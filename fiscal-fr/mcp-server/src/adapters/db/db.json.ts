import { readFileSync } from "node:fs";
import { z } from "zod";
import type { DbAdapter } from "./db.abstract.js";
import type {
  QualificationConfig,
  QualificationCorpus,
  QualificationKnowledge,
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

export class JsonDbAdapter implements DbAdapter {
  private readonly qualificationConfig: QualificationConfig;
  private readonly qualificationKnowledge: QualificationKnowledge;
  private readonly qualificationCorpus: QualificationCorpus;

  constructor() {
    const dbRaw = readFileSync(new URL("../../data/qualify-tool.db.json", import.meta.url), "utf8");
    const dbParsed = QualifyToolDbSchema.parse(JSON.parse(dbRaw));

    this.qualificationConfig = dbParsed.qualificationConfig;
    this.qualificationKnowledge = dbParsed.qualificationKnowledge;
    this.qualificationCorpus = dbParsed.qualificationCorpus;
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
}
