import { z } from "zod";
import type { QualifyToolRepository } from "./qualify-tool.repository.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import type {
  BuildPreDeclarationResult,
  PreDeclarationEntry,
  PreDeclarationSection,
} from "./qualify-tool.types.js";

export class BuildPreDeclarationUseCase {
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
            "Montants déclarés par clé technique (ex: { salary: 35000, donations: 200 }). Les clés correspondent aux amountKey de chaque rubrique.",
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
        declaredAmounts: z.record(z.string(), z.number()).default({}),
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
        // parsedProfile.success is guaranteed: superRefine already rejected invalid profiles
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
    declaredAmounts: Record<string, number>;
    knownFacts: string[];
  }): BuildPreDeclarationResult {
    const knowledge = this.repository.getPreDeclarationKnowledge();
    const qualification = this.qualifyUseCase.execute(input.profileSnapshot);
    const { incomeTypes, charges } = input.profileSnapshot;
    const { declaredAmounts } = input;

    const sectionMap = new Map<string, PreDeclarationSection>();
    const pointsToConfirm: string[] = [];

    for (const mapping of knowledge.fieldMappings) {
      const triggered =
        (mapping.triggeredByIncomeType !== undefined &&
          incomeTypes.includes(mapping.triggeredByIncomeType)) ||
        (mapping.triggeredByChargeType !== undefined &&
          charges.includes(mapping.triggeredByChargeType));

      if (!triggered) continue;

      const rawValue = declaredAmounts[mapping.amountKey];
      const value = rawValue !== undefined ? rawValue : null;
      const status: PreDeclarationEntry["status"] = value !== null ? "confirmed" : "to_confirm";

      if (status === "to_confirm") {
        const caseRef = mapping.caseCode ? ` (case ${mapping.caseCode})` : "";
        pointsToConfirm.push(`Montant à renseigner : ${mapping.label}${caseRef}`);
      }

      if (!sectionMap.has(mapping.sectionId)) {
        sectionMap.set(mapping.sectionId, {
          id: mapping.sectionId,
          label: mapping.sectionLabel,
          entries: [],
        });
      }

      sectionMap.get(mapping.sectionId)!.entries.push({
        id: mapping.id,
        label: mapping.label,
        caseCode: mapping.caseCode,
        value,
        status,
        origin: mapping.origin,
        sourceUrls: mapping.sourceUrls,
      });
    }

    const sections = knowledge.sectionOrder
      .filter((id) => sectionMap.has(id))
      .map((id) => sectionMap.get(id)!);

    return {
      sections,
      draftStatus: pointsToConfirm.length === 0 ? "complete" : "incomplete",
      pointsToConfirm,
      profileSummary: {
        complexity: qualification.complexity,
        mvpDecision: qualification.mvpDecision,
        detectedTopics: qualification.detectedTopics,
      },
    };
  }
}
