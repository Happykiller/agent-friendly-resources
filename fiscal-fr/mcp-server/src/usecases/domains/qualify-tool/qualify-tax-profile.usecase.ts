import { z } from "zod";
import type { QualifyToolRepository } from "./qualify-tool.repository.js";
import type {
  ComplexityLevel,
  DecisionLevel,
  QualificationRule,
  QualifyTaxProfileInput,
  QualifyTaxProfileResult,
  SourceRef,
} from "./qualify-tool.types.js";

function addUnique(target: string[], values: string[]) {
  for (const value of values) {
    if (!target.includes(value)) {
      target.push(value);
    }
  }
}

function mergeComplexity(current: ComplexityLevel, next: ComplexityLevel): ComplexityLevel {
  const rank: Record<ComplexityLevel, number> = {
    simple: 0,
    monitor: 1,
    out_of_scope: 2,
  };

  return rank[next] > rank[current] ? next : current;
}

function mergeDecision(current: DecisionLevel, next: DecisionLevel): DecisionLevel {
  const rank: Record<DecisionLevel, number> = {
    supported: 0,
    supported_with_caution: 1,
    human_review: 2,
  };

  return rank[next] > rank[current] ? next : current;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ruleMatchesInput(rule: QualificationRule, input: QualifyTaxProfileInput, normalizedEvents: string[]) {
  const { trigger } = rule;

  if (
    trigger.incomeTypes &&
    !input.incomeTypes.some((incomeType) => trigger.incomeTypes?.includes(incomeType))
  ) {
    return false;
  }

  if (trigger.charges && !input.charges.some((chargeType) => trigger.charges?.includes(chargeType))) {
    return false;
  }

  if (
    trigger.eventKeywords &&
    !normalizedEvents.some((eventValue) =>
      trigger.eventKeywords?.some((keyword) => eventValue.includes(normalizeText(keyword)))
    )
  ) {
    return false;
  }

  return true;
}

export class QualifyTaxProfileUseCase {
  private readonly repository: QualifyToolRepository;

  constructor(repository: QualifyToolRepository) {
    this.repository = repository;
  }

  getToolSchema() {
    const config = this.repository.getQualificationConfig();

    return {
      type: "object",
      properties: {
        householdStatus: {
          type: "string",
          enum: [...config.householdStatuses],
        },
        dependentsCount: {
          type: "integer",
          minimum: 0,
        },
        incomeTypes: {
          type: "array",
          items: {
            type: "string",
            enum: [...config.incomeTypes],
          },
        },
        charges: {
          type: "array",
          items: {
            type: "string",
            enum: [...config.chargeTypes],
          },
        },
        events: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: ["householdStatus", "dependentsCount", "incomeTypes"],
    };
  }

  validateInput(rawInput: unknown) {
    const config = this.repository.getQualificationConfig();

    const schema = z.object({
      householdStatus: z.string().refine((value) => config.householdStatuses.includes(value), {
        message: "Invalid householdStatus",
      }),
      dependentsCount: z.number().int().min(0),
      incomeTypes: z.array(
        z.string().refine((value) => config.incomeTypes.includes(value), {
          message: "Invalid incomeTypes value",
        })
      ),
      charges: z
        .array(
          z.string().refine((value) => config.chargeTypes.includes(value), {
            message: "Invalid charges value",
          })
        )
        .default([]),
      events: z.array(z.string()).default([]),
    });

    return schema.safeParse(rawInput);
  }

  execute(input: QualifyTaxProfileInput): QualifyTaxProfileResult {
    const config = this.repository.getQualificationConfig();
    const knowledge = this.repository.getQualificationKnowledge();
    const corpus = this.repository.getQualificationCorpus();

    const facts: string[] = [];
    const hypotheses: string[] = [];
    const pointsToConfirm: string[] = [];
    const nextQuestions: string[] = [];
    const detectedTopics: string[] = [];
    const suggestedCaseCodes: string[] = [];
    const requiredDocuments: string[] = [];
    const onlineUiHints: string[] = [];
    const knowledgeRecommendations: QualifyTaxProfileResult["knowledgeRecommendations"] = [];
    const sourcesByUrl = new Map<string, SourceRef>();

    const outOfScopeIncomeTypesSet = new Set(config.outOfScopeIncomeTypes);
    const monitorChargeTypesSet = new Set(config.monitorChargeTypes);
    const outOfScopeEventPattern = new RegExp(
      config.outOfScopeEventKeywords.map(escapeRegex).join("|"),
      "i"
    );
    const normalizedEvents = input.events.map(normalizeText);

    let complexity: ComplexityLevel = "simple";
    let decision: DecisionLevel = "supported";

    facts.push(`Situation familiale: ${input.householdStatus}`);
    facts.push(`Nombre de personnes a charge: ${input.dependentsCount}`);
    facts.push(`Types de revenus: ${input.incomeTypes.join(", ") || "aucun precise"}`);

    if (input.charges.length > 0 && !input.charges.includes("none")) {
      facts.push(`Charges mentionnees: ${input.charges.join(", ")}`);
    }

    if (input.incomeTypes.some((incomeType) => outOfScopeIncomeTypesSet.has(incomeType))) {
      complexity = mergeComplexity(complexity, "out_of_scope");
      decision = mergeDecision(decision, "human_review");
      hypotheses.push("La situation semble inclure un ou plusieurs elements hors perimetre MVP.");
    }

    if (input.events.some((eventValue) => outOfScopeEventPattern.test(eventValue))) {
      complexity = mergeComplexity(complexity, "out_of_scope");
      decision = mergeDecision(decision, "human_review");
      hypotheses.push("Un evenement declare suggere un besoin de revue humaine.");
    }

    if (
      complexity === "simple" &&
      (input.dependentsCount > 0 || input.charges.some((chargeType) => monitorChargeTypesSet.has(chargeType)))
    ) {
      complexity = mergeComplexity(complexity, "monitor");
      decision = mergeDecision(decision, "supported_with_caution");
      hypotheses.push("Le cas semble supportable dans le MVP, avec verifications documentaires.");
    }

    for (const rule of knowledge.rules) {
      if (!ruleMatchesInput(rule, input, normalizedEvents)) {
        continue;
      }

      if (!detectedTopics.includes(rule.topic)) {
        detectedTopics.push(rule.topic);
      }

      addUnique(pointsToConfirm, rule.pointsToConfirm);
      addUnique(nextQuestions, rule.nextQuestions);
      addUnique(suggestedCaseCodes, rule.suggestedCaseCodes);
      addUnique(requiredDocuments, rule.requiredDocuments);
      addUnique(onlineUiHints, rule.onlineUiHints);

      complexity = mergeComplexity(complexity, rule.complexityImpact);
      decision = mergeDecision(decision, rule.decisionImpact);

      for (const source of rule.sources) {
        sourcesByUrl.set(source.url, source);
      }

      knowledgeRecommendations.push({
        ruleId: rule.id,
        topic: rule.topic,
        confidenceLevel: rule.confidenceLevel,
        suggestedCaseCodes: rule.suggestedCaseCodes,
        requiredDocuments: rule.requiredDocuments,
        pointsToConfirm: rule.pointsToConfirm,
        nextQuestions: rule.nextQuestions,
        onlineUiHints: rule.onlineUiHints,
        sources: rule.sources,
      });
    }

    if (input.incomeTypes.length === 0) {
      pointsToConfirm.push("Types de revenus non precises.");
      nextQuestions.push("Quels types de revenus avez-vous percus en 2025 ?");
    }

    if (input.charges.length === 0) {
      pointsToConfirm.push("Charges particulieres non precisees.");
      nextQuestions.push("Avez-vous eu des dons, frais de garde, emploi a domicile ou pension versee ?");
    }

    if (input.dependentsCount > 0) {
      pointsToConfirm.push("Age et situation des personnes a charge a confirmer.");
      nextQuestions.push("Quel est l'age des enfants ou personnes a charge ?");
    }

    return {
      factsConfirmed: facts,
      hypotheses,
      pointsToConfirm,
      complexity,
      mvpDecision: decision,
      nextQuestions,
      detectedTopics,
      suggestedCaseCodes,
      requiredDocuments,
      onlineUiHints,
      knowledgeRecommendations,
      sourceCoverage: {
        campaign: knowledge.campaign,
        sourceAnalysis: knowledge.sourceAnalysis,
        sourcesUsed: [...sourcesByUrl.values()].filter((source) =>
          corpus.officialDocuments.some((document) => document.url === source.url)
        ),
      },
    };
  }
}
