import { z } from "zod";
import type { QualifyToolRepository } from "./qualify-tool.repository.js";
import type {
  GuideFilingStepInput,
  GuideFilingStepResult,
} from "./qualify-tool.types.js";

// ── Context keyword maps ───────────────────────────────────────────────────
// These map incomeType/chargeType values to stepIds where contextual highlights apply.

const INCOME_TYPE_STEP_MAP: Record<string, string[]> = {
  salary: ["step_revenus_salaires"],
  pension: ["step_revenus_salaires"],
  bank_interest: ["step_revenus_capitaux_mobiliers"],
  dividends: ["step_revenus_capitaux_mobiliers"],
  rental_income: ["step_revenus_fonciers"],
  furnished_rental: ["step_micro_entrepreneur"],
  micro_entrepreneur: ["step_micro_entrepreneur"],
};

const CHARGE_TYPE_STEP_MAP: Record<string, string[]> = {
  donations: ["step_reductions_credits_impot"],
  childcare: ["step_reductions_credits_impot"],
  home_services: ["step_reductions_credits_impot"],
  alimony: ["step_charges_deductibles"],
  per: ["step_charges_deductibles"],
};

// Highlighted items by incomeType / chargeType for a specific step
const CONTEXTUAL_HIGHLIGHTS: Record<string, Record<string, string>> = {
  step_etat_civil: {
    children_exclusive_custody: "En tant que parent isolé élevant seul vos enfants, n'oubliez pas de cocher la case T pour bénéficier d'une part supplémentaire.",
    children_shared_custody: "En garde alternée, chaque parent bénéficie d'une part partagée. Vérifiez la cohérence avec l'autre parent.",
  },
  step_revenus_salaires: {
    salary: "Optimisation Frais Réels : Si vos frais de transport/repas dépassent 10% de votre salaire, l'option pour les frais réels (1AK) est plus avantageuse.",
    pension: "Votre profil inclut des pensions : vérifier les cases 1AS/1BS avec l'attestation fiscale de la caisse de retraite.",
  },
  step_revenus_capitaux_mobiliers: {
    bank_interest: "Votre profil inclut des intérêts bancaires : vérifier la case 2TR et l'IFU de chaque établissement.",
    dividends: "Optimisation Case 2OP : L'option barème peut être plus avantageuse que le PFU de 31,4% si vous êtes peu imposable.",
  },
  step_revenus_fonciers: {
    rental_income: "Votre profil inclut des revenus fonciers : vérifier le régime applicable (micro-foncier ≤ 15 000 € ou régime réel).",
  },
  step_micro_entrepreneur: {
    micro_entrepreneur: "Votre profil inclut des revenus micro-entrepreneur : identifier le bon abattement (71 % BIC vente, 50 % BIC services, 34 % BNC).",
    furnished_rental: "Votre profil inclut de la location meublée (BIC) : utiliser la déclaration 2042C PRO, pas les revenus fonciers (cadre 4).",
  },
  step_charges_deductibles: {
    alimony: "Votre profil inclut des pensions alimentaires : vérifier les cases 6GU/6EL/6EM selon le bénéficiaire (enfant mineur, majeur ou ascendant).",
    per: "Votre profil inclut un PER : vérifier les cases 6NS/6NT et les plafonds de déductibilité.",
  },
  step_reductions_credits_impot: {
    donations: "Optimisation Dons (7UF/7UD) : Le plafond à 75% est de 2 000 € depuis le 14/10/2025. Vérifiez vos reçus fiscaux.",
    childcare: "Votre profil inclut des frais de garde d'enfant : saisir le montant NET après déduction des aides CAF (case 7GA).",
    home_services: "Votre profil inclut de l'emploi à domicile : saisir le montant NET après aides, et renseigner la nouvelle case d'identification du bénéficiaire (7DB).",
  },
};

// ── Input schema ───────────────────────────────────────────────────────────

const GuideFilingStepInputSchema = z.object({
  currentStep: z.string().min(1, "currentStep est requis"),
  knownContext: z
    .object({
      incomeTypes: z.array(z.string()).optional(),
      charges: z.array(z.string()).optional(),
      dependentContexts: z.array(z.string()).optional(),
    })
    .optional(),
});

// ── Usecase ────────────────────────────────────────────────────────────────

export class GuideFilingStepUseCase {
  private readonly repository: QualifyToolRepository;

  constructor(repository: QualifyToolRepository) {
    this.repository = repository;
  }

  getToolSchema() {
    return {
      type: "object" as const,
      properties: {
        currentStep: {
          type: "string",
          description:
            "Identifiant de l'étape de saisie en cours sur impots.gouv.fr. Valeurs disponibles : step_connexion, step_declaration_automatique, step_selection_rubriques, step_etat_civil, step_revenus_salaires, step_revenus_capitaux_mobiliers, step_revenus_fonciers, step_micro_entrepreneur, step_charges_deductibles, step_reductions_credits_impot, step_recapitulatif_impot, step_vigilance_transversale.",
        },
        knownContext: {
          type: "object",
          description:
            "Contexte optionnel du profil utilisateur pour personnaliser les points de vigilance.",
          properties: {
            incomeTypes: {
              type: "array",
              items: { type: "string" },
              description:
                "Types de revenus du profil (salary, pension, bank_interest, dividends, rental_income, furnished_rental, micro_entrepreneur).",
            },
            charges: {
              type: "array",
              items: { type: "string" },
              description:
                "Charges et déductions du profil (donations, childcare, home_services, alimony, per).",
            },
            dependentContexts: {
              type: "array",
              items: { type: "string" },
              description:
                "Contextes familiaux (children_exclusive_custody, children_shared_custody).",
            },
          },
        },
      },
      required: ["currentStep"],
    };
  }

  validateInput(rawInput: unknown) {
    return GuideFilingStepInputSchema.safeParse(rawInput);
  }

  execute(input: GuideFilingStepInput): GuideFilingStepResult {
    const knowledge = this.repository.getGuideFilingKnowledge();

    const step = knowledge.steps.find((s) => s.stepId === input.currentStep);
    if (!step) {
      const availableSteps = knowledge.steps
        .sort((a, b) => a.position - b.position)
        .map((s) => ({ stepId: s.stepId, label: s.label, position: s.position }));

      throw new Error(
        `Étape inconnue : '${input.currentStep}'. Étapes disponibles : ${availableSteps.map((s) => s.stepId).join(", ")}`
      );
    }

    const contextualHighlights: string[] = [];

    // Add static highlights from the step itself (from JSON DB)
    const stepInDb = (step as any);
    if (stepInDb.contextualHighlights && Array.isArray(stepInDb.contextualHighlights)) {
      contextualHighlights.push(...stepInDb.contextualHighlights);
    }

    if (input.knownContext) {
      const stepHighlights = CONTEXTUAL_HIGHLIGHTS[step.stepId];
      if (stepHighlights) {
        const allContextKeys = [
          ...(input.knownContext.incomeTypes ?? []),
          ...(input.knownContext.charges ?? []),
          ...(input.knownContext.dependentContexts ?? []),
        ];
        for (const key of allContextKeys) {
          if (stepHighlights[key]) {
            contextualHighlights.push(stepHighlights[key]);
          }
        }
      }
    }

    const availableSteps = knowledge.steps
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ stepId: s.stepId, label: s.label, position: s.position }));

    const result: GuideFilingStepResult = {
      stepId: step.stepId,
      label: step.label,
      position: step.position,
      verifyNow: step.verifyNow,
      frequentOmissions: step.frequentOmissions,
      traps: step.traps,
      keyCaseCodes: step.keyCaseCodes,
      sourceUrl: step.sourceUrl,
      sourceTitle: step.sourceTitle,
      contextualHighlights,
      availableSteps,
      campaign: knowledge.campaign,
    };

    if (step.notes !== undefined) {
      result.notes = step.notes;
    }

    return result;
  }
}
