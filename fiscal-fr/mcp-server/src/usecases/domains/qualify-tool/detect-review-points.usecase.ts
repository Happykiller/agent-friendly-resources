import { z } from "zod";
import type { QualifyToolRepository } from "./qualify-tool.repository.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import type { DetectReviewPointsResult, ReviewPoint, ReviewPointRule } from "./qualify-tool.types.js";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function knownFactsContain(knownFacts: string[], keywords: string[]): boolean {
  const normalized = knownFacts.map(normalizeText);
  return keywords.some((kw) => normalized.some((fact) => fact.includes(normalizeText(kw))));
}

function resolveJustification(template: string, found: string): string {
  return template.replace("{found}", found);
}

export class DetectReviewPointsUseCase {
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
        knownFacts: {
          type: "array",
          items: { type: "string" },
        },
        declaredAmounts: {
          type: "object",
          additionalProperties: { type: "number" },
        },
      },
      required: ["profileSnapshot"],
    };
  }

  validateInput(rawInput: unknown) {
    const schema = z
      .object({
        profileSnapshot: z.unknown(),
        knownFacts: z.array(z.string()).default([]),
        declaredAmounts: z.record(z.string(), z.number()).optional(),
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
        // parsedProfile.success is guaranteed here: superRefine already rejected invalid profiles
        return {
          ...value,
          profileSnapshot: parsedProfile.data!,
        };
      });

    return schema.safeParse(rawInput);
  }

  execute(input: {
    profileSnapshot: {
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
    knownFacts: string[];
    declaredAmounts?: Record<string, number>;
  }): DetectReviewPointsResult {
    const config = this.repository.getQualificationConfig();
    const knowledge = this.repository.getReviewPointsKnowledge();
    const qualification = this.qualifyUseCase.execute(input.profileSnapshot);
    const reviewPoints: ReviewPoint[] = [];

    const { incomeTypes, charges, events, dependentContexts } = input.profileSnapshot;
    const { knownFacts, declaredAmounts } = input;

    const outOfScopeEventPattern = new RegExp(
      config.outOfScopeEventKeywords
        .map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|"),
      "i"
    );

    for (const rule of knowledge.rules) {
      const point = this.applyRule(rule, {
        incomeTypes,
        charges,
        events,
        dependentContexts,
        knownFacts,
        declaredAmounts,
        outOfScopeIncomeTypes: config.outOfScopeIncomeTypes,
        outOfScopeEventPattern,
      });

      if (point) {
        reviewPoints.push(point);
      }
    }

    // human_review point: derived from qualification result, not from profile fields directly
    const hasBlockingError = reviewPoints.some((rp) => rp.severity === "error" && rp.blocking);
    if (qualification.mvpDecision === "human_review" && !hasBlockingError) {
      reviewPoints.push({
        id: "human_review_recommended",
        severity: "warning",
        blocking: false,
        topic: "Verification humaine recommandee",
        justification:
          "La qualification indique que cette situation necessite une verification humaine avant finalisation.",
        suggestedActions: [
          "Valider les points a confirmer avec un conseiller fiscal ou le service des impots.",
          "Ne pas finaliser la declaration sans avoir leve les points d'attention identifies.",
        ],
      });
    }

    const blockingCount = reviewPoints.filter((rp) => rp.blocking).length;

    return {
      reviewPoints,
      hasBlockingPoints: blockingCount > 0,
      summary: {
        complexity: qualification.complexity,
        mvpDecision: qualification.mvpDecision,
        totalPoints: reviewPoints.length,
        blockingCount,
      },
    };
  }

  private applyRule(
    rule: ReviewPointRule,
    ctx: {
      incomeTypes: string[];
      charges: string[];
      events: string[];
      dependentContexts: string[];
      knownFacts: string[];
      declaredAmounts?: Record<string, number>;
      outOfScopeIncomeTypes: string[];
      outOfScopeEventPattern: RegExp;
    }
  ): ReviewPoint | null {
    const { when, confirmedByKeywords } = rule;

    // Check confirmation bypass first
    if (confirmedByKeywords && knownFactsContain(ctx.knownFacts, confirmedByKeywords)) {
      return null;
    }

    if (when.outOfScopeIncomes) {
      const found = ctx.incomeTypes.filter((t) => ctx.outOfScopeIncomeTypes.includes(t));
      if (found.length === 0) return null;
      return this.buildPoint(rule, found.join(", "));
    }

    if (when.outOfScopeEvents) {
      const found = ctx.events.filter((e) => ctx.outOfScopeEventPattern.test(e));
      if (found.length === 0) return null;
      return this.buildPoint(rule, found.join(", "));
    }

    if (when.incomeTypesAny) {
      if (!when.incomeTypesAny.some((t) => ctx.incomeTypes.includes(t))) return null;
    }

    if (when.chargesAny) {
      if (!when.chargesAny.some((c) => ctx.charges.includes(c))) return null;
    }

    if (when.dependentContextsAny) {
      if (!when.dependentContextsAny.some((dc) => ctx.dependentContexts.includes(dc))) return null;
    }

    if (when.declaredAmountWithoutIncomeType) {
      const { amountKeywords, requiredIncomeType } = when.declaredAmountWithoutIncomeType;
      if (!ctx.declaredAmounts) return null;
      const hasDeclared = Object.keys(ctx.declaredAmounts).some((k) =>
        amountKeywords.some((kw) => k.toLowerCase().includes(kw))
      );
      if (!hasDeclared) return null;
      if (ctx.incomeTypes.includes(requiredIncomeType)) return null;
    } else if (!when.outOfScopeIncomes && !when.outOfScopeEvents) {
      // At least one standard condition must have been present and matched
      if (!when.incomeTypesAny && !when.chargesAny && !when.dependentContextsAny) return null;
    }

    return this.buildPoint(rule, "");
  }

  private buildPoint(rule: ReviewPointRule, found: string): ReviewPoint {
    return {
      id: rule.id,
      severity: rule.severity,
      blocking: rule.blocking,
      topic: rule.topic,
      justification: resolveJustification(rule.justificationTemplate, found),
      suggestedActions: rule.suggestedActions,
    };
  }
}
