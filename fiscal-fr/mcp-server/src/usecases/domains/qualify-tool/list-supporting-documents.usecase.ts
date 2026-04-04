import { z } from "zod";
import type { DocumentItem, ListSupportingDocumentsResult } from "./qualify-tool.types.js";
import type { QualifyToolRepository } from "./qualify-tool.repository.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTechnicalKey(label: string) {
  return normalizeText(label).replace(/\s+/g, "_");
}

function addUnique(target: string[], values: string[]) {
  for (const value of values) {
    if (!target.includes(value)) {
      target.push(value);
    }
  }
}

function isDocumentProvided(item: DocumentItem, availableNormalized: string[]) {
  const label = normalizeText(item.label);

  return availableNormalized.some(
    (entry) =>
      entry.includes(label) ||
      label.includes(entry) ||
      entry.includes(item.technicalKey) ||
      item.technicalKey.includes(entry)
  );
}

export class ListSupportingDocumentsUseCase {
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
        alreadyAvailableDocuments: {
          type: "array",
          items: { type: "string" },
        },
        knownFacts: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["profileSnapshot"],
    };
  }

  validateInput(rawInput: unknown) {
    const schema = z
      .object({
        profileSnapshot: z.unknown(),
        alreadyAvailableDocuments: z.array(z.string()).default([]),
        knownFacts: z.array(z.string()).default([]),
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

        if (!parsedProfile.success) {
          return {
            ...value,
            profileSnapshot: {
              householdStatus: "single",
              dependentsCount: 0,
              incomeTypes: [],
              charges: [],
              events: [],
              dependentContexts: [],
              donationContexts: [],
              homeServiceContexts: [],
              alimonyContexts: [],
            },
          };
        }

        return {
          ...value,
          profileSnapshot: parsedProfile.data,
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
    alreadyAvailableDocuments: string[];
    knownFacts: string[];
  }): ListSupportingDocumentsResult {
    const documentsKnowledge = this.repository.getSupportingDocumentsKnowledge();
    const qualification = this.qualifyUseCase.execute(input.profileSnapshot);
    const requiredMap = new Map<string, DocumentItem>();
    const recommendedMap = new Map<string, DocumentItem>();
    const derivedFacts: string[] = [];

    for (const recommendation of qualification.knowledgeRecommendations) {
      for (const docLabel of recommendation.requiredDocuments) {
        const technicalKey = toTechnicalKey(docLabel);
        const existing = requiredMap.get(technicalKey);

        if (!existing) {
          requiredMap.set(technicalKey, {
            label: docLabel,
            technicalKey,
            reasons: [`Topic: ${recommendation.topic}`],
            sourceUrls: recommendation.sources.map((source) => source.url),
          });
          continue;
        }

        addUnique(existing.reasons, [`Topic: ${recommendation.topic}`]);
        addUnique(existing.sourceUrls, recommendation.sources.map((source) => source.url));
      }
    }

    const recommendedLabels: string[] = [];

    for (const incomeType of input.profileSnapshot.incomeTypes) {
      addUnique(recommendedLabels, documentsKnowledge.recommendedByIncomeType[incomeType] ?? []);
    }

    for (const chargeType of input.profileSnapshot.charges) {
      addUnique(recommendedLabels, documentsKnowledge.recommendedByChargeType[chargeType] ?? []);
    }

    const normalizedEvents = input.profileSnapshot.events.map(normalizeText);

    for (const rule of documentsKnowledge.additionalRules) {
      const incomeMatch =
        !rule.when.incomeTypesAny ||
        rule.when.incomeTypesAny.some((incomeType) => input.profileSnapshot.incomeTypes.includes(incomeType));
      const chargeMatch =
        !rule.when.chargesAny ||
        rule.when.chargesAny.some((chargeType) => input.profileSnapshot.charges.includes(chargeType));
      const eventMatch =
        !rule.when.eventKeywordsAny ||
        rule.when.eventKeywordsAny.some((keyword) => {
          const normalizedKeyword = normalizeText(keyword);
          return normalizedEvents.some((eventValue) => eventValue.includes(normalizedKeyword));
        });

      if (!(incomeMatch && chargeMatch && eventMatch)) {
        continue;
      }

      addUnique(recommendedLabels, rule.recommendedDocuments);

      if (rule.note) {
        addUnique(derivedFacts, [rule.note]);
      }
    }

    for (const label of recommendedLabels) {
      const technicalKey = toTechnicalKey(label);

      if (requiredMap.has(technicalKey)) {
        continue;
      }

      recommendedMap.set(technicalKey, {
        label,
        technicalKey,
        reasons: ["Bonne pratique documentaire"],
        sourceUrls: [],
      });
    }

    const availableNormalized = input.alreadyAvailableDocuments.map(normalizeText);
    const required = [...requiredMap.values()];
    const missing = required.filter((item) => !isDocumentProvided(item, availableNormalized));
    const recommended = [...recommendedMap.values()];
    const notes: string[] = [];

    if (qualification.mvpDecision === "human_review") {
      notes.push("Cas a revue humaine: preparer les justificatifs prioritaires avant validation definitive.");
    }

    if (missing.length > 0) {
      notes.push("Des justificatifs obligatoires restent manquants pour finaliser la preparation.");
    }

    if (input.knownFacts.length > 0) {
      notes.push("Les faits deja confirmes ont ete pris en compte dans la priorisation documentaire.");
    }

    for (const fact of [...input.knownFacts, ...derivedFacts]) {
      if (fact.includes("revue humaine")) {
        notes.push(fact);
      }
    }

    return {
      required,
      recommended,
      missing,
      notes,
      profileSummary: {
        complexity: qualification.complexity,
        mvpDecision: qualification.mvpDecision,
        detectedTopics: qualification.detectedTopics,
      },
    };
  }
}
