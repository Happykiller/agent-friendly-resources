import { z } from "zod";
import type { QualifyToolRepository } from "./qualify-tool.repository.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import type {
  BaremeTranche,
  EstimateImpactDetailLine,
  EstimateImpactKnowledge,
  EstimateImpactResult,
} from "./qualify-tool.types.js";

type ProfileSnapshot = {
  householdStatus: string;
  dependentsCount: number;
  incomeTypes: string[];
  charges: string[];
  events: string[];
  dependentContexts: string[];
  donationContexts: string[];
  homeServiceContexts: string[];
  alimonyContexts: string[];
};

export class EstimateImpactUseCase {
  private readonly qualifyUseCase: QualifyTaxProfileUseCase;
  private readonly repository: QualifyToolRepository;

  constructor(qualifyUseCase: QualifyTaxProfileUseCase, repository: QualifyToolRepository) {
    this.qualifyUseCase = qualifyUseCase;
    this.repository = repository;
  }

  getToolSchema() {
    return {
      type: "object",
      properties: {
        profileSnapshot: this.qualifyUseCase.getToolSchema(),
        declaredAmounts: {
          type: "object",
          additionalProperties: { type: "number" },
          description:
            "Montants déclarés par clé technique (ex: { salary: 35000, pension: 12000, dividends: 5000, donations: 500, childcare: 3000, home_services: 8000 }). " +
            "Clés reconnues : salary, pension, bank_interest, dividends, rental_income, furnished_rental, micro_entrepreneur, donations, childcare, home_services, alimony.",
        },
        options: {
          type: "object",
          properties: {
            dividendesOptionBareme: {
              type: "boolean",
              description:
                "Si true, les dividendes sont imposés au barème progressif (avec abattement 40 %) au lieu du PFU (31,4 %).",
            },
          },
        },
      },
      required: ["profileSnapshot"],
    };
  }

  validateInput(rawInput: unknown) {
    const schema = z
      .object({
        profileSnapshot: z.unknown(),
        declaredAmounts: z.record(z.string(), z.number()).default({}),
        options: z
          .object({
            dividendesOptionBareme: z.boolean().optional(),
          })
          .default({}),
      })
      .superRefine((value, ctx) => {
        const parsedProfile = this.qualifyUseCase.validateInput(value.profileSnapshot);
        if (!parsedProfile.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["profileSnapshot"],
            message: "Invalid profileSnapshot",
          });
        }
      })
      .transform((value) => {
        const parsedProfile = this.qualifyUseCase.validateInput(value.profileSnapshot);
        return { ...value, profileSnapshot: parsedProfile.data! };
      });

    return schema.safeParse(rawInput);
  }

  execute(input: {
    profileSnapshot: ProfileSnapshot;
    declaredAmounts: Record<string, number>;
    options: { dividendesOptionBareme?: boolean };
  }): EstimateImpactResult {
    const knowledge = this.repository.getEstimateImpactKnowledge();
    const { profileSnapshot, declaredAmounts, options } = input;
    const warnings: string[] = [];
    const details: EstimateImpactDetailLine[] = [];

    const isCouple =
      profileSnapshot.householdStatus === "marie_pacse" ||
      profileSnapshot.householdStatus.startsWith("marie") ||
      profileSnapshot.householdStatus.startsWith("pacse");
    const nbDeclarants = isCouple ? 2 : 1;
    const isGardeAlternee = profileSnapshot.dependentContexts.includes("garde_alternee");
    const n = profileSnapshot.dependentsCount;
    const isParentIsole = !isCouple && n > 0;

    // ── Nombre de parts ──────────────────────────────────────────────────────
    const baseParts = isCouple
      ? knowledge.quotientFamilial.partsBase.marie_pacse
      : knowledge.quotientFamilial.partsBase.celibataire;

    const { partsEnfants, demiPartsEnfantsStandard } = this.calculerPartsEnfants(
      n,
      isGardeAlternee,
      knowledge
    );
    const parentIsolePart = isParentIsole
      ? knowledge.quotientFamilial.parentIsole.majoration
      : 0;
    const nombreParts = baseParts + partsEnfants + parentIsolePart;

    // ── Abattement salaires ───────────────────────────────────────────────────
    const salary = declaredAmounts["salary"] ?? 0;
    let revenuNetSalaires = 0;
    if (salary > 0) {
      const abs = knowledge.abattements.salaires;
      const abattement = clamp(
        Math.round(salary * abs.taux),
        abs.plancherParDeclarant * nbDeclarants,
        abs.plafondParDeclarant * nbDeclarants
      );
      revenuNetSalaires = salary - abattement;
      details.push({
        step: "abattement_salaires",
        label: "Abattement 10 % salaires",
        value: abattement,
        details: `${salary} € brut → ${revenuNetSalaires} € net imposable`,
      });
    }

    // ── Abattement pensions ───────────────────────────────────────────────────
    const pension = declaredAmounts["pension"] ?? 0;
    let revenuNetPensions = 0;
    if (pension > 0) {
      const abs = knowledge.abattements.pensions;
      const abattement = clamp(
        Math.round(pension * abs.taux),
        abs.plancherParPensionne,
        abs.plafondParFoyer
      );
      revenuNetPensions = pension - abattement;
      details.push({
        step: "abattement_pensions",
        label: "Abattement 10 % pensions",
        value: abattement,
        details: `${pension} € brut → ${revenuNetPensions} € net imposable`,
      });
    }

    // ── Dividendes et intérêts (PFU ou barème) ────────────────────────────────
    const dividends = declaredAmounts["dividends"] ?? 0;
    const bankInterest = declaredAmounts["bank_interest"] ?? 0;
    let revenuNetDividendes = 0;
    let pfuBase = 0;
    let pfuImpot = 0;

    if (options.dividendesOptionBareme && dividends > 0) {
      const abattement = Math.round(
        dividends * knowledge.abattements.dividendesOptionBareme.taux
      );
      revenuNetDividendes = dividends - abattement;
      details.push({
        step: "abattement_dividendes_bareme",
        label: "Abattement 40 % dividendes (option barème)",
        value: abattement,
        details: `${dividends} € brut → ${revenuNetDividendes} € net imposable`,
      });
      warnings.push(
        "Option barème retenue pour les dividendes : vérifiez que cette option est plus avantageuse que le PFU (31,4 %)."
      );
      // bank_interest still goes to PFU if present
      if (bankInterest > 0) {
        pfuBase = bankInterest;
        pfuImpot = Math.round(bankInterest * knowledge.pfu.tauxGlobal);
        details.push({
          step: "pfu_interets",
          label: `PFU 31,4 % sur intérêts bancaires`,
          value: pfuImpot,
          details: `Base : ${bankInterest} €`,
        });
      }
    } else if (dividends > 0 || bankInterest > 0) {
      pfuBase = dividends + bankInterest;
      pfuImpot = Math.round(pfuBase * knowledge.pfu.tauxGlobal);
      details.push({
        step: "pfu",
        label: `PFU 31,4 % sur revenus du capital`,
        value: pfuImpot,
        details: `Base : ${pfuBase} € (dividendes ${dividends} € + intérêts ${bankInterest} €)`,
      });
    }

    // ── Revenus fonciers micro-foncier ────────────────────────────────────────
    const rentalIncome = declaredAmounts["rental_income"] ?? 0;
    let revenuNetFoncier = 0;
    if (rentalIncome > 0) {
      if (rentalIncome > knowledge.abattements.microFoncier.plafondRecettesBrutes) {
        revenuNetFoncier = rentalIncome; // pas d'abattement micro au-delà du seuil
        warnings.push(
          `Revenus fonciers bruts (${rentalIncome} €) dépassent le seuil micro-foncier (${knowledge.abattements.microFoncier.plafondRecettesBrutes} €). ` +
            "Le régime réel s'applique : l'estimation pour cette catégorie n'est pas fiable."
        );
      } else {
        const abattement = Math.round(
          rentalIncome * knowledge.abattements.microFoncier.taux
        );
        revenuNetFoncier = rentalIncome - abattement;
        details.push({
          step: "abattement_micro_foncier",
          label: "Abattement 30 % micro-foncier",
          value: abattement,
          details: `${rentalIncome} € recettes → ${revenuNetFoncier} € net imposable`,
        });
      }
    }

    // ── Micro-entrepreneur ────────────────────────────────────────────────────
    const microEntrepreneur = declaredAmounts["micro_entrepreneur"] ?? 0;
    let revenuNetMicroEntrepreneur = 0;
    if (microEntrepreneur > 0) {
      const abs = knowledge.abattements.microEntrepreneur.bicServices; // 50% par défaut
      const abattement = Math.max(
        abs.minimumAbattement,
        Math.round(microEntrepreneur * abs.taux)
      );
      revenuNetMicroEntrepreneur = Math.max(0, microEntrepreneur - abattement);
      details.push({
        step: "abattement_micro_entrepreneur",
        label: "Abattement forfaitaire micro-entrepreneur (50 % BIC services, par défaut)",
        value: abattement,
        details: `${microEntrepreneur} € CA → ${revenuNetMicroEntrepreneur} € net imposable`,
      });
      warnings.push(
        "Micro-entrepreneur : abattement de 50 % (BIC services) appliqué par défaut. " +
          "Vérifiez le taux réel de votre activité : BIC vente 71 %, BIC services 50 %, BNC libéral 34 %."
      );
    }

    // ── Location meublée (micro-BIC) ──────────────────────────────────────────
    const furnishedRental = declaredAmounts["furnished_rental"] ?? 0;
    let revenuNetMeuble = 0;
    if (furnishedRental > 0) {
      const abs = knowledge.abattements.microEntrepreneur.bicServices; // 50% micro-BIC meublé
      const abattement = Math.max(
        abs.minimumAbattement,
        Math.round(furnishedRental * abs.taux)
      );
      revenuNetMeuble = Math.max(0, furnishedRental - abattement);
      details.push({
        step: "abattement_meuble",
        label: "Abattement 50 % location meublée (micro-BIC)",
        value: abattement,
        details: `${furnishedRental} € recettes → ${revenuNetMeuble} € net imposable`,
      });
    }

    // ── Pensions alimentaires versées (déduction du revenu global) ────────────
    const alimony = declaredAmounts["alimony"] ?? 0;
    if (alimony > 0) {
      details.push({
        step: "deduction_alimony",
        label: "Pensions alimentaires versées (déduites du revenu global)",
        value: alimony,
      });
      warnings.push(
        "Les pensions alimentaires versées sont déduites de façon simplifiée. " +
          "Le montant déductible peut être plafonné selon les règles du CGI art. 156."
      );
    }

    // ── Revenu net imposable total (barème) ───────────────────────────────────
    const revenuNetImposable = Math.max(
      0,
      revenuNetSalaires +
        revenuNetPensions +
        revenuNetDividendes +
        revenuNetFoncier +
        revenuNetMicroEntrepreneur +
        revenuNetMeuble -
        alimony
    );
    details.push({
      step: "revenu_net_imposable",
      label: "Revenu net imposable total (soumis au barème)",
      value: revenuNetImposable,
    });

    // ── Impôt brut avec quotient familial ─────────────────────────────────────
    const impotBrut = this.calculerImpotAvecQF(
      revenuNetImposable,
      nombreParts,
      baseParts,
      demiPartsEnfantsStandard,
      isParentIsole,
      knowledge,
      details
    );

    // ── Décote ────────────────────────────────────────────────────────────────
    const decoteParams = isCouple
      ? knowledge.decote.couple
      : knowledge.decote.celibataire;
    const decote =
      impotBrut < decoteParams.seuil
        ? Math.max(0, Math.round(decoteParams.base - decoteParams.taux * impotBrut))
        : 0;
    if (decote > 0) {
      details.push({
        step: "decote",
        label: "Décote",
        value: decote,
        details: `${decoteParams.base} − ${decoteParams.taux} × ${impotBrut} €`,
      });
    }

    const impotAvantCredits = Math.max(0, impotBrut - decote);

    // ── Réductions d'impôt ────────────────────────────────────────────────────
    let reductionsTotal = 0;
    const donations = declaredAmounts["donations"] ?? 0;
    if (donations > 0) {
      const r = knowledge.reductionsImpot.dons.taux66;
      const plafond = Math.round(revenuNetImposable * r.plafondPctRevenuImposable);
      const baseDons = Math.min(donations, plafond);
      const reduction = Math.round(baseDons * r.taux);
      reductionsTotal += reduction;
      details.push({
        step: "reduction_dons_66",
        label: "Réduction dons 66 % (case 7UF)",
        value: reduction,
        details: `Base retenue : ${baseDons} € (plafond 20 % du RNI = ${plafond} €)`,
      });
      if (donations > plafond) {
        warnings.push(
          `Dons déclarés (${donations} €) dépassent le plafond de 20 % du RNI (${plafond} €). ` +
            "L'excédent peut être reporté sur les 5 années suivantes."
        );
      }
    }

    const reductionsImpot = Math.min(reductionsTotal, impotAvantCredits);

    // ── Crédits d'impôt ───────────────────────────────────────────────────────
    let creditsTotal = 0;

    const childcare = declaredAmounts["childcare"] ?? 0;
    if (childcare > 0) {
      const ci = knowledge.creditsImpot.gardeEnfant;
      const nbEnfants = Math.max(1, n);
      const plafond = ci.plafondDepensesParEnfant * nbEnfants;
      const base = Math.min(childcare, plafond);
      const credit = Math.round(base * ci.taux);
      creditsTotal += credit;
      details.push({
        step: "credit_garde_enfant",
        label: "Crédit garde d'enfant (50 %, plaf. 3 500 €/enfant)",
        value: credit,
        details: `Base retenue : ${base} € sur ${childcare} € déclarés`,
      });
    }

    const homeServices = declaredAmounts["home_services"] ?? 0;
    if (homeServices > 0) {
      const ci = knowledge.creditsImpot.emploiDomicile;
      const majorations = n * ci.majorationParEnfantACharge;
      const plafond = Math.min(ci.plafondBase + majorations, ci.plafondAvecMajorations);
      const base = Math.min(homeServices, plafond);
      const credit = Math.round(base * ci.taux);
      creditsTotal += credit;
      details.push({
        step: "credit_emploi_domicile",
        label: "Crédit emploi domicile (50 %, plaf. 12 000 € + majorations)",
        value: credit,
        details: `Base retenue : ${base} € (plafond applicable : ${plafond} €)`,
      });
    }

    const creditsImpot = creditsTotal;

    // ── Impôt net ─────────────────────────────────────────────────────────────
    const impotNet = Math.max(0, impotAvantCredits - reductionsImpot - creditsImpot);

    // ── CEHR / CDHR ───────────────────────────────────────────────────────────
    // Revenu fiscal de référence simplifié ≈ RNI (hors PFU)
    const rfrEstimatif = revenuNetImposable;
    const cehrTranches = isCouple
      ? knowledge.cehr.couple
      : knowledge.cehr.celibataire;
    const cehr = this.applyBareme(rfrEstimatif, cehrTranches);
    if (cehr > 0) {
      details.push({
        step: "cehr",
        label: "Contribution différentielle sur hauts revenus (CDHR)",
        value: cehr,
        details: `RFR estimatif : ${rfrEstimatif} €`,
      });
      warnings.push(
        "CDHR calculée sur un RFR simplifié (≈ RNI hors revenus du capital soumis au PFU). " +
          "Le calcul exact nécessite le Revenu Fiscal de Référence complet incluant le PFU."
      );
    }

    // ── Avertissements généraux ───────────────────────────────────────────────
    if (isParentIsole) {
      warnings.push(
        "Statut parent isolé (case T) déduit automatiquement de votre situation. " +
          "Vérifiez que vous remplissez les conditions : vivre seul au 1er janvier avec au moins un enfant à charge."
      );
    }
    warnings.push(
      "Cette estimation ne couvre pas les revenus exceptionnels, l'imposition séparée, " +
        "les régimes spéciaux, ni l'ensemble des crédits et réductions d'impôt applicables."
    );

    const totalDu = impotNet + cehr + pfuImpot;

    return {
      campaign: knowledge.campaign,
      revenusAnnee: knowledge.revenusAnnee,
      nombreParts,
      revenuNetImposable,
      impotBrut,
      decote,
      impotAvantCredits,
      reductionsImpot,
      creditsImpot,
      impotNet,
      cehr,
      totalDu,
      pfuDetails: pfuBase > 0 ? { base: pfuBase, impotPfu: pfuImpot } : undefined,
      details,
      warnings,
      disclaimer:
        "Estimation purement indicative, sans valeur juridique. " +
        "Pour un calcul définitif, utilisez le simulateur officiel DGFiP (impots.gouv.fr) " +
        "ou consultez un conseiller fiscal agréé.",
      sourcesUsed: knowledge.sources,
    };
  }

  // ── Helpers privés ──────────────────────────────────────────────────────────

  private calculerPartsEnfants(
    n: number,
    isGardeAlternee: boolean,
    knowledge: EstimateImpactKnowledge
  ): { partsEnfants: number; demiPartsEnfantsStandard: number } {
    const maj = knowledge.quotientFamilial.majorationsEnfants;
    let partsEnfants = 0;

    for (let i = 1; i <= n; i++) {
      if (isGardeAlternee) {
        if (i === 1) partsEnfants += maj.gardeAlternee1;
        else if (i === 2) partsEnfants += maj.gardeAlternee2;
        else partsEnfants += maj.gardeAlternee3etPlus;
      } else {
        if (i === 1) partsEnfants += maj.chargeExclusive1;
        else if (i === 2) partsEnfants += maj.chargeExclusive2;
        else partsEnfants += maj.chargeExclusive3etPlus;
      }
    }

    // demiPartsEnfantsStandard = nombre de demi-parts issues uniquement des enfants (pour plafonnement QF)
    const demiPartsEnfantsStandard = Math.round(partsEnfants * 2);
    return { partsEnfants, demiPartsEnfantsStandard };
  }

  private calculerImpotAvecQF(
    rni: number,
    nombreParts: number,
    baseParts: number,
    demiPartsEnfantsStandard: number,
    isParentIsole: boolean,
    knowledge: EstimateImpactKnowledge,
    details: EstimateImpactDetailLine[]
  ): number {
    const tranches = knowledge.baremeIR.tranches;

    // Impôt avec toutes les parts (QF complet)
    const impotAvecQF = this.applyBareme(rni / nombreParts, tranches) * nombreParts;

    if (nombreParts === baseParts) {
      // Pas d'enfants, pas de QF → pas de plafonnement à vérifier
      return Math.round(impotAvecQF);
    }

    // Impôt sans les parts supplémentaires (célibataire ou couple sans enfants)
    const impotSansEnfants = this.applyBareme(rni / baseParts, tranches) * baseParts;

    const avantageBrut = Math.round(impotSansEnfants - impotAvecQF);

    // Plafond de l'avantage en impôt
    const plafondParDemiPart = knowledge.quotientFamilial.plafonds.avantageParDemiPart;
    const plafondParentIsole =
      knowledge.quotientFamilial.plafonds.avantageParentIsolePremierePartSpecifique;

    const maxAvantageEnfants = demiPartsEnfantsStandard * plafondParDemiPart;
    const maxAvantageParentIsole = isParentIsole ? plafondParentIsole : 0;
    const maxAvantage = maxAvantageEnfants + maxAvantageParentIsole;

    let impotBrut: number;
    if (avantageBrut > maxAvantage) {
      // Plafonnement actif
      impotBrut = Math.round(impotSansEnfants - maxAvantage);
      details.push({
        step: "plafonnement_qf",
        label: "Plafonnement du quotient familial",
        value: maxAvantage,
        details: `Avantage brut (${avantageBrut} €) > plafond (${maxAvantage} €) → plafonnement appliqué`,
      });
    } else {
      impotBrut = Math.round(impotAvecQF);
    }

    return impotBrut;
  }

  private applyBareme(revenu: number, tranches: BaremeTranche[]): number {
    let impot = 0;
    for (const tranche of tranches) {
      const lowerBound = tranche.de > 0 ? tranche.de - 1 : 0;
      const upperBound = tranche.a !== null ? tranche.a : Infinity;
      const taxable = Math.max(0, Math.min(revenu, upperBound) - lowerBound);
      impot += taxable * tranche.taux;
    }
    return impot;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
