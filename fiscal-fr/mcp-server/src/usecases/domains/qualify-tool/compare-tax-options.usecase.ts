import { z } from "zod";
import type { QualifyToolRepository } from "./qualify-tool.repository.js";
import type {
  CompareTaxArbitrageId,
  CompareTaxComparisonResult,
  CompareTaxOptionsInput,
  CompareTaxOptionsRateSet,
  CompareTaxOptionsResult,
} from "./qualify-tool.types.js";

const ARBITRAGE_IDS: CompareTaxArbitrageId[] = [
  "pfu_vs_bareme",
  "real_expenses_vs_10pct",
  "micro_vs_real_rental",
  "child_attachment_vs_detachment",
];

export class CompareTaxOptionsUseCase {
  private readonly repository: QualifyToolRepository;

  constructor(repository: QualifyToolRepository) {
    this.repository = repository;
  }

  getToolSchema() {
    return {
      type: "object",
      properties: {
        householdStatus: { type: "string" },
        dependentsCount: { type: "number", minimum: 0 },
        incomeTypes: { type: "array", items: { type: "string" } },
        estimatedTmi: {
          type: "number",
          minimum: 0,
          maximum: 0.45,
          description: "TMI estimee (0 a 0.45), utile pour les comparaisons approximatives.",
        },
        includeDeferredCsgBenefit: {
          type: "boolean",
          description:
            "Si true, integre une estimation de l'effet CSG deductible (6,8%) l'annee suivante dans la branche bareme.",
        },
        incomeYear: {
          type: "string",
          description: "Annee des revenus compares (par defaut : annee de revenus du dataset).",
        },
        salary: {
          type: "object",
          properties: {
            grossAnnual: { type: "number", minimum: 0 },
            taxableAnnual: { type: "number", minimum: 0 },
          },
          required: ["grossAnnual", "taxableAnnual"],
        },
        realExpenses: {
          type: "object",
          properties: { totalAmount: { type: "number", minimum: 0 } },
          required: ["totalAmount"],
        },
        capitalIncome: {
          type: "object",
          properties: {
            interests: { type: "number", minimum: 0 },
            dividends: { type: "number", minimum: 0 },
            eligibleDividendsAmount: {
              type: "number",
              minimum: 0,
              description:
                "Part des dividendes eligible a l'abattement de 40% en cas d'option bareme (par defaut: total dividendes).",
            },
            deductibleFees: {
              type: "number",
              minimum: 0,
              description: "Frais RCM deductibles (2CA) integres seulement dans la branche bareme.",
            },
          },
          required: ["interests", "dividends"],
        },
        rentalIncome: {
          type: "object",
          properties: {
            grossRevenue: { type: "number", minimum: 0 },
            totalCharges: { type: "number", minimum: 0 },
          },
          required: ["grossRevenue"],
        },
        adultChild: {
          type: "object",
          properties: {
            childAge: { type: "number", minimum: 0 },
            pensionPaidAmount: { type: "number", minimum: 0 },
            estimatedAttachmentTaxSaving: { type: "number", minimum: 0 },
            attachmentExtraHalfParts: { type: "number", minimum: 0 },
          },
          required: ["childAge"],
        },
        requestedArbitrages: {
          type: "array",
          items: {
            type: "string",
            enum: [...ARBITRAGE_IDS, "all"],
          },
        },
      },
      required: ["householdStatus", "dependentsCount", "incomeTypes"],
    };
  }

  validateInput(rawInput: unknown) {
    const schema = z.object({
      householdStatus: z.string().min(1),
      dependentsCount: z.number().int().min(0),
      incomeTypes: z.array(z.string()).default([]),
      estimatedTmi: z.number().min(0).max(0.45).optional(),
      includeDeferredCsgBenefit: z.boolean().optional(),
      incomeYear: z.string().optional(),
      salary: z
        .object({
          grossAnnual: z.number().min(0),
          taxableAnnual: z.number().min(0),
        })
        .optional(),
      realExpenses: z
        .object({
          totalAmount: z.number().min(0),
        })
        .optional(),
      capitalIncome: z
        .object({
          interests: z.number().min(0),
          dividends: z.number().min(0),
          eligibleDividendsAmount: z.number().min(0).optional(),
          deductibleFees: z.number().min(0).optional(),
        })
        .optional(),
      rentalIncome: z
        .object({
          grossRevenue: z.number().min(0),
          totalCharges: z.number().min(0).optional(),
        })
        .optional(),
      adultChild: z
        .object({
          childAge: z.number().int().min(0),
          pensionPaidAmount: z.number().min(0).optional(),
          estimatedAttachmentTaxSaving: z.number().min(0).optional(),
          attachmentExtraHalfParts: z.number().min(0).optional(),
        })
        .optional(),
      requestedArbitrages: z.array(z.enum([...ARBITRAGE_IDS, "all"])).optional(),
    });

    return schema.safeParse(rawInput);
  }

  execute(input: CompareTaxOptionsInput): CompareTaxOptionsResult {
    const knowledge = this.repository.getCompareTaxOptionsKnowledge();
    const comparisons: CompareTaxComparisonResult[] = [];
    const globalWarnings: string[] = [];
    const requested =
      !input.requestedArbitrages || input.requestedArbitrages.length === 0
        ? ARBITRAGE_IDS
        : input.requestedArbitrages.includes("all")
          ? ARBITRAGE_IDS
          : (input.requestedArbitrages as CompareTaxArbitrageId[]);
    const effectiveIncomeYear = input.incomeYear ?? knowledge.revenusAnneeDefaut;

    if (requested.includes("pfu_vs_bareme")) {
      comparisons.push(this.comparePfuVsBareme(input, effectiveIncomeYear));
    }

    if (requested.includes("real_expenses_vs_10pct")) {
      comparisons.push(this.compareRealExpensesVs10Pct(input));
    }

    if (requested.includes("micro_vs_real_rental")) {
      comparisons.push(this.compareMicroVsRealRental(input));
    }

    if (requested.includes("child_attachment_vs_detachment")) {
      comparisons.push(this.compareChildAttachmentVsDetachment(input));
    }

    globalWarnings.push(
      "Les comparaisons sont indicatives et basees sur les donnees fournies. Verifier les montants et options declaratives avant arbitrage final."
    );

    return {
      comparisons,
      globalWarnings,
      disclaimer:
        "Cette comparaison est indicative et ne constitue pas un conseil fiscal opposable. En cas de situation complexe, demander une revue humaine.",
    };
  }

  private comparePfuVsBareme(
    input: CompareTaxOptionsInput,
    incomeYear: string
  ): CompareTaxComparisonResult {
    const knowledge = this.repository.getCompareTaxOptionsKnowledge();
    const rule = knowledge.arbitrages.find((item) => item.arbitrageId === "pfu_vs_bareme")!;
    const missingData: string[] = [];
    const hypotheses: string[] = [];
    const warnings = [...rule.warnings];
    const sourceUrls = this.resolveSourceUrls(rule.sourceRuleIds);

    const capitalIncome = input.capitalIncome;
    if (!capitalIncome) {
      missingData.push("capitalIncome");
      return this.insufficient("pfu_vs_bareme", rule, missingData, warnings, sourceUrls, hypotheses);
    }

    const rateSet = this.resolveRateSet(rule.rateSets ?? [], incomeYear);
    hypotheses.push(`Annee de revenus utilisee: ${rateSet.incomeYear}`);

    const interests = capitalIncome.interests ?? 0;
    const dividends = capitalIncome.dividends ?? 0;
    const base = interests + dividends;
    if (base <= 0) {
      missingData.push("capitalIncome.interests|dividends > 0");
      return this.insufficient("pfu_vs_bareme", rule, missingData, warnings, sourceUrls, hypotheses);
    }
    const optionAAmount = this.round(base * rateSet.pfu.tauxGlobal);

    if (input.estimatedTmi === undefined) {
      missingData.push("estimatedTmi");
      return this.insufficient("pfu_vs_bareme", rule, missingData, warnings, sourceUrls, hypotheses);
    }

    const eligibleDividends = Math.min(
      dividends,
      capitalIncome.eligibleDividendsAmount ?? dividends
    );
    const nonEligibleDividends = Math.max(0, dividends - eligibleDividends);
    const deductibleFees = capitalIncome.deductibleFees ?? 0;
    const baremeBase = Math.max(0, interests + eligibleDividends * 0.6 + nonEligibleDividends - deductibleFees);
    const irBareme = baremeBase * input.estimatedTmi;
    const psBareme = base * rateSet.pfu.tauxPS;
    const csgDeductibleGain = input.includeDeferredCsgBenefit
      ? base * 0.068 * input.estimatedTmi
      : 0;
    const optionBAmount = this.round(irBareme + psBareme - csgDeductibleGain);

    const recommendation =
      optionAAmount === optionBAmount
        ? "neutral"
        : optionAAmount < optionBAmount
          ? "option_a"
          : "option_b";

    hypotheses.push(
      "Bareme: dividendes eligibles avec abattement 40%, dividendes non eligibles et interets sans abattement"
    );
    hypotheses.push("Option 2OP est globale: le resultat par categorie est une approximation locale");
    if (capitalIncome.eligibleDividendsAmount === undefined && dividends > 0) {
      warnings.push(
        "Part de dividendes eligibles a l'abattement 40% non detaillee: hypothese par defaut = 100% eligibles."
      );
    }
    if (deductibleFees > 0) {
      hypotheses.push(`Frais RCM deductibles integres (2CA): ${this.round(deductibleFees)} EUR`);
    }
    if (input.includeDeferredCsgBenefit) {
      hypotheses.push("Effet CSG deductible (6,8%) estime en gain differe l'annee suivante");
      warnings.push(
        "Gain CSG deductible estime a titre economique (effet differe), non equivalent a un gain de tresorerie immediate."
      );
    }
    if (interests > 0 && dividends > 0) {
      warnings.push(
        "Portefeuille mixte interets + dividendes: une simulation globale foyer est recommandee avant decision 2OP."
      );
    }
    warnings.push(
      "Arbitrage 2OP: valider sur simulation foyer complete (global_recompute_required)."
    );
    hypotheses.push("Acompte 2CK non integre dans ce comparatif simplifie");

    return {
      arbitrageId: "pfu_vs_bareme",
      optionA: {
        label: rule.optionA.label,
        amount: optionAAmount,
        details: `PFU ${Math.round(rateSet.pfu.tauxGlobal * 1000) / 10}% sur base ${base} EUR`,
      },
      optionB: {
        label: rule.optionB.label,
        amount: optionBAmount,
        details:
          `Bareme approx avec TMI ${(input.estimatedTmi * 100).toFixed(0)}% + PS ${(rateSet.pfu.tauxPS * 100).toFixed(1)}%` +
          (input.includeDeferredCsgBenefit ? " (gain CSG differe inclus)" : ""),
      },
      difference: this.round(Math.abs(optionAAmount - optionBAmount)),
      recommendation,
      hypotheses,
      missingData,
      warnings,
      sourceUrls,
    };
  }

  private compareRealExpensesVs10Pct(input: CompareTaxOptionsInput): CompareTaxComparisonResult {
    const knowledge = this.repository.getCompareTaxOptionsKnowledge();
    const rule = knowledge.arbitrages.find(
      (item) => item.arbitrageId === "real_expenses_vs_10pct"
    )!;
    const missingData: string[] = [];
    const hypotheses: string[] = [];
    const warnings = [...rule.warnings];
    const sourceUrls = this.resolveSourceUrls(rule.sourceRuleIds);

    if (!input.salary) {
      missingData.push("salary");
    }
    if (!input.realExpenses) {
      missingData.push("realExpenses");
    }
    if (missingData.length > 0) {
      return this.insufficient(
        "real_expenses_vs_10pct",
        rule,
        missingData,
        warnings,
        sourceUrls,
        hypotheses
      );
    }

    const taxable = input.salary!.taxableAnnual;
    const abattement = this.round(Math.max(509, Math.min(14555, taxable * 0.1)));
    const fraisReels = this.round(input.realExpenses!.totalAmount);

    hypotheses.push("Abattement 10% applique avec plancher 509 EUR et plafond 14 555 EUR");
    hypotheses.push("Calcul simplifie sur un contribuable agrege; le choix est juridiquement individuel par membre du foyer");

    const householdStatus = input.householdStatus.toLowerCase();
    if (householdStatus.includes("marie") || householdStatus.includes("pacse")) {
      warnings.push(
        "Foyer couple: le choix frais reels vs 10% se fait par declarant; confirmer les montants par personne."
      );
    }

    return {
      arbitrageId: "real_expenses_vs_10pct",
      optionA: {
        label: rule.optionA.label,
        amount: abattement,
        details: `Deduction forfaitaire estimee: ${abattement} EUR`,
      },
      optionB: {
        label: rule.optionB.label,
        amount: fraisReels,
        details: `Frais reels declares: ${fraisReels} EUR`,
      },
      difference: this.round(Math.abs(abattement - fraisReels)),
      recommendation:
        abattement === fraisReels ? "neutral" : abattement > fraisReels ? "option_a" : "option_b",
      hypotheses,
      missingData,
      warnings,
      sourceUrls,
    };
  }

  private compareMicroVsRealRental(input: CompareTaxOptionsInput): CompareTaxComparisonResult {
    const knowledge = this.repository.getCompareTaxOptionsKnowledge();
    const rule = knowledge.arbitrages.find((item) => item.arbitrageId === "micro_vs_real_rental")!;
    const missingData: string[] = [];
    const hypotheses: string[] = [];
    const warnings = [...rule.warnings];
    const sourceUrls = this.resolveSourceUrls(rule.sourceRuleIds);

    if (!input.rentalIncome) {
      missingData.push("rentalIncome");
      return this.insufficient(
        "micro_vs_real_rental",
        rule,
        missingData,
        warnings,
        sourceUrls,
        hypotheses
      );
    }

    const gross = input.rentalIncome.grossRevenue;
    const charges = input.rentalIncome.totalCharges;
    if (charges === undefined) {
      missingData.push("rentalIncome.totalCharges");
      return this.insufficient(
        "micro_vs_real_rental",
        rule,
        missingData,
        warnings,
        sourceUrls,
        hypotheses
      );
    }

    const microTaxableBase = this.round(gross * 0.7);
    const realTaxableBase = this.round(gross - charges);

    const microNotEligible = gross > 15000;
    if (microNotEligible) {
      warnings.push("Micro-foncier non eligible au-dela de 15 000 EUR de recettes brutes.");
    }

    hypotheses.push("Comparaison effectuee sur base imposable fonciere (hors effet tranche marginale).");
    warnings.push(
      "Seuil 30% charges vs recettes: heuristique de premier niveau. Confirmer via simulation reelle 2044 pour arbitrage final."
    );

    return {
      arbitrageId: "micro_vs_real_rental",
      optionA: {
        label: rule.optionA.label,
        amount: microTaxableBase,
        details: `Base imposable micro-foncier: ${microTaxableBase} EUR`,
      },
      optionB: {
        label: rule.optionB.label,
        amount: realTaxableBase,
        details: `Base imposable reel: ${realTaxableBase} EUR`,
      },
      difference: this.round(Math.abs(microTaxableBase - realTaxableBase)),
      recommendation: microNotEligible
        ? "option_b"
        : microTaxableBase === realTaxableBase
          ? "neutral"
          : microTaxableBase < realTaxableBase
            ? "option_a"
            : "option_b",
      hypotheses,
      missingData,
      warnings,
      sourceUrls,
    };
  }

  private compareChildAttachmentVsDetachment(
    input: CompareTaxOptionsInput
  ): CompareTaxComparisonResult {
    const knowledge = this.repository.getCompareTaxOptionsKnowledge();
    const rule = knowledge.arbitrages.find(
      (item) => item.arbitrageId === "child_attachment_vs_detachment"
    )!;
    const missingData: string[] = [];
    const hypotheses: string[] = [];
    const warnings = [...rule.warnings];
    const sourceUrls = this.resolveSourceUrls(rule.sourceRuleIds);

    if (!input.adultChild) {
      missingData.push("adultChild");
      return this.insufficient(
        "child_attachment_vs_detachment",
        rule,
        missingData,
        warnings,
        sourceUrls,
        hypotheses
      );
    }

    const { childAge, pensionPaidAmount, estimatedAttachmentTaxSaving, attachmentExtraHalfParts } =
      input.adultChild;

    if (childAge < 18) {
      warnings.push("Enfant mineur: arbitrage rattachement enfant majeur non applicable.");
      return this.insufficient(
        "child_attachment_vs_detachment",
        rule,
        ["adultChild.childAge >= 18"],
        warnings,
        sourceUrls,
        hypotheses
      );
    }

    if (input.estimatedTmi === undefined) {
      missingData.push("estimatedTmi");
    }
    if (pensionPaidAmount === undefined) {
      missingData.push("adultChild.pensionPaidAmount");
    }
    if (missingData.length > 0) {
      return this.insufficient(
        "child_attachment_vs_detachment",
        rule,
        missingData,
        warnings,
        sourceUrls,
        hypotheses
      );
    }

    const halfParts = attachmentExtraHalfParts ?? 1;
    const capByHalfPart = 1807;
    const attachmentSavingFromCap = halfParts * capByHalfPart;
    const attachmentSavingFromTmiProxy = 6674 * input.estimatedTmi!;
    const attachmentSaving = this.round(
      estimatedAttachmentTaxSaving ?? Math.min(attachmentSavingFromCap, attachmentSavingFromTmiProxy)
    );
    const pensionDeductible = Math.min(6674, pensionPaidAmount!);
    const detachmentSaving = this.round(pensionDeductible * input.estimatedTmi!);

    hypotheses.push(
      estimatedAttachmentTaxSaving === undefined
        ? "Gain rattachement estime via minimum entre plafond QF simplifie (1807 EUR par demi-part) et proxy TMI."
        : "Gain rattachement fourni par l'utilisateur."
    );
    if (estimatedAttachmentTaxSaving === undefined) {
      warnings.push(
        "Gain rattachement estime via proxy simplifie: verifier le resultat avec une simulation foyer complete."
      );
    }
    hypotheses.push("Pension deductible plafonnee a 6 674 EUR dans ce comparatif simplifie.");
    warnings.push(
      "Arbitrage rattachement/pension: valider avec simulation foyer complete integrant plafonnement du quotient familial."
    );
    warnings.push(
      "Verifier que l'enfant est en etat de besoin et que la pension est effectivement versee/justifiable."
    );

    return {
      arbitrageId: "child_attachment_vs_detachment",
      optionA: {
        label: rule.optionA.label,
        amount: attachmentSaving,
        details: `Economie d'impot estimee via rattachement: ${attachmentSaving} EUR`,
      },
      optionB: {
        label: rule.optionB.label,
        amount: detachmentSaving,
        details: `Economie d'impot via pension deductible: ${detachmentSaving} EUR`,
      },
      difference: this.round(Math.abs(attachmentSaving - detachmentSaving)),
      recommendation:
        attachmentSaving === detachmentSaving
          ? "neutral"
          : attachmentSaving > detachmentSaving
            ? "option_a"
            : "option_b",
      hypotheses,
      missingData,
      warnings,
      sourceUrls,
    };
  }

  private insufficient(
    arbitrageId: CompareTaxArbitrageId,
    rule: { optionA: { label: string }; optionB: { label: string } },
    missingData: string[],
    warnings: string[],
    sourceUrls: string[],
    hypotheses: string[]
  ): CompareTaxComparisonResult {
    return {
      arbitrageId,
      optionA: { label: rule.optionA.label, amount: 0, details: "Donnees insuffisantes" },
      optionB: { label: rule.optionB.label, amount: 0, details: "Donnees insuffisantes" },
      difference: 0,
      recommendation: "insufficient_data",
      hypotheses,
      missingData,
      warnings,
      sourceUrls,
    };
  }

  private resolveRateSet(rateSets: CompareTaxOptionsRateSet[], requestedYear: string) {
    return (
      rateSets.find((item) => item.incomeYear === requestedYear) ??
      rateSets.find((item) => item.incomeYear === "2025") ??
      rateSets[0]
    );
  }

  private resolveSourceUrls(sourceRuleIds: string[]) {
    const sources = this.repository.getCompareTaxOptionsKnowledge().sources;
    return sources.filter((s) => sourceRuleIds.includes(s.ruleId)).map((s) => s.url);
  }

  private round(value: number): number {
    return Math.round(value);
  }
}
