import { readFileSync } from "node:fs";
import { z } from "zod";
import type { DbAdapter } from "./db.abstract.js";
import type {
  QualificationConfig,
  QualificationCorpus,
  QualificationKnowledge,
  ReviewPointsKnowledge,
  SupportingDocumentsKnowledge,
} from "../../usecases/domains/qualify-tool/qualify-tool.types.js";

const QualificationConfigSchema = z.object({
  householdStatuses: z.array(z.string()).min(1),
  incomeTypes: z.array(z.string()).min(1),
  chargeTypes: z.array(z.string()).min(1),
  dependentContextTypes: z.array(z.string()),
  donationContextTypes: z.array(z.string()),
  homeServiceContextTypes: z.array(z.string()),
  alimonyContextTypes: z.array(z.string()),
  outOfScopeIncomeTypes: z.array(z.string()),
  monitorChargeTypes: z.array(z.string()),
  outOfScopeEventKeywords: z.array(z.string()),
});

const SourceRefSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string(),
  authorityLevel: z.enum(["primary_official", "secondary_official"]),
});

const RuleTriggerSchema = z.object({
  incomeTypes: z.array(z.string()).optional(),
  charges: z.array(z.string()).optional(),
  eventKeywords: z.array(z.string()).optional(),
  dependentContexts: z.array(z.string()).optional(),
  donationContexts: z.array(z.string()).optional(),
  homeServiceContexts: z.array(z.string()).optional(),
  alimonyContexts: z.array(z.string()).optional(),
});

const CorpusAssetSchema = z.object({
  name: z.string(),
  role: z.enum(["primary", "secondary"]),
  status: z.enum(["promoted", "supporting"]),
  notes: z.array(z.string()),
});

const CorpusDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  publisher: z.string(),
  authorityLevel: z.enum(["primary_official", "secondary_official"]),
  topics: z.array(z.string()),
  promoted: z.boolean(),
});

const CorpusSignalSchema = z.object({
  id: z.string(),
  originAsset: z.string(),
  topic: z.string(),
  statement: z.string(),
  status: z.enum(["promoted", "candidate", "rejected"]),
  reason: z.string(),
});

const QualificationCorpusSchema = z.object({
  campaign: z.string(),
  assets: z.array(CorpusAssetSchema),
  officialDocuments: z.array(CorpusDocumentSchema),
  candidateSignals: z.array(CorpusSignalSchema),
});

const QualificationKnowledgeSchema = z.object({
  campaign: z.string(),
  sourceAnalysis: z.object({
    preferredAsset: z.string(),
    secondaryAssets: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  rules: z.array(
    z.object({
      id: z.string(),
      topic: z.string(),
      trigger: RuleTriggerSchema,
      complexityImpact: z.enum(["simple", "monitor", "out_of_scope"]),
      decisionImpact: z.enum(["supported", "supported_with_caution", "human_review"]),
      pointsToConfirm: z.array(z.string()),
      nextQuestions: z.array(z.string()),
      suggestedCaseCodes: z.array(z.string()),
      requiredDocuments: z.array(z.string()),
      onlineUiHints: z.array(z.string()),
      confidenceLevel: z.enum(["high", "medium", "low"]),
      sources: z.array(SourceRefSchema),
    })
  ),
});

const QualifyToolDbSchema = z.object({
  qualificationConfig: QualificationConfigSchema,
  qualificationKnowledge: QualificationKnowledgeSchema,
  qualificationCorpus: QualificationCorpusSchema,
});

const SupportingDocumentsKnowledgeSchema = z.object({
  campaign: z.string(),
  recommendedByIncomeType: z.record(z.string(), z.array(z.string())),
  recommendedByChargeType: z.record(z.string(), z.array(z.string())),
  additionalRules: z.array(
    z.object({
      id: z.string(),
      when: z.object({
        incomeTypesAny: z.array(z.string()).optional(),
        chargesAny: z.array(z.string()).optional(),
        eventKeywordsAny: z.array(z.string()).optional(),
      }),
      recommendedDocuments: z.array(z.string()),
      note: z.string().optional(),
    })
  ),
});

const ReviewPointConditionSchema = z.object({
  incomeTypesAny: z.array(z.string()).optional(),
  chargesAny: z.array(z.string()).optional(),
  dependentContextsAny: z.array(z.string()).optional(),
  outOfScopeIncomes: z.boolean().optional(),
  outOfScopeEvents: z.boolean().optional(),
  declaredAmountWithoutIncomeType: z
    .object({
      amountKeywords: z.array(z.string()),
      requiredIncomeType: z.string(),
    })
    .optional(),
});

const ReviewPointsKnowledgeSchema = z.object({
  campaign: z.string(),
  rules: z.array(
    z.object({
      id: z.string(),
      severity: z.enum(["info", "warning", "error"]),
      blocking: z.boolean(),
      topic: z.string(),
      justificationTemplate: z.string(),
      suggestedActions: z.array(z.string()),
      when: ReviewPointConditionSchema,
      confirmedByKeywords: z.array(z.string()).optional(),
    })
  ),
});

export class JsonDbAdapter implements DbAdapter {
  private readonly qualificationConfig: QualificationConfig;
  private readonly qualificationKnowledge: QualificationKnowledge;
  private readonly qualificationCorpus: QualificationCorpus;
  private readonly supportingDocumentsKnowledge: SupportingDocumentsKnowledge;
  private readonly reviewPointsKnowledge: ReviewPointsKnowledge;

  constructor() {
    const dbRaw = readFileSync(new URL("../../data/qualify-tool.db.json", import.meta.url), "utf8");
    const dbParsed = QualifyToolDbSchema.parse(JSON.parse(dbRaw));
    const documentsRaw = readFileSync(
      new URL("../../data/list-supporting-documents.db.json", import.meta.url),
      "utf8"
    );
    const documentsParsed = SupportingDocumentsKnowledgeSchema.parse(JSON.parse(documentsRaw));
    const reviewPointsRaw = readFileSync(
      new URL("../../data/detect-review-points.db.json", import.meta.url),
      "utf8"
    );
    const reviewPointsParsed = ReviewPointsKnowledgeSchema.parse(JSON.parse(reviewPointsRaw));

    this.qualificationConfig = dbParsed.qualificationConfig;
    this.qualificationKnowledge = dbParsed.qualificationKnowledge;
    this.qualificationCorpus = dbParsed.qualificationCorpus;
    this.supportingDocumentsKnowledge = documentsParsed;
    this.reviewPointsKnowledge = reviewPointsParsed;
  }

  getQualificationConfig() {
    return this.qualificationConfig;
  }

  getQualificationKnowledge() {
    return this.qualificationKnowledge;
  }

  getQualificationCorpus() {
    return this.qualificationCorpus;
  }

  getSupportingDocumentsKnowledge() {
    return this.supportingDocumentsKnowledge;
  }

  getReviewPointsKnowledge() {
    return this.reviewPointsKnowledge;
  }
}
