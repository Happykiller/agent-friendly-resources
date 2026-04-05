import { readFileSync } from "node:fs";
import { z } from "zod";
import type { DbAdapter } from "./db.abstract.js";
import type {
  EstimateImpactKnowledge,
  GuideFilingKnowledge,
  PreDeclarationKnowledge,
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

const PreDeclarationKnowledgeSchema = z.object({
  campaign: z.string(),
  sectionOrder: z.array(z.string()),
  fieldMappings: z.array(
    z.object({
      id: z.string(),
      sectionId: z.string(),
      sectionLabel: z.string(),
      label: z.string(),
      caseCode: z.string().nullable(),
      triggeredByIncomeType: z.string().optional(),
      triggeredByChargeType: z.string().optional(),
      amountKey: z.string(),
      origin: z.string(),
      sourceUrls: z.array(z.string().url()),
    })
  ),
});

const BaremeTrancheSchema = z.object({
  de: z.number(),
  a: z.number().nullable(),
  taux: z.number(),
});

const DecoteParamsSchema = z.object({
  seuil: z.number(),
  base: z.number(),
  taux: z.number(),
});

const MicroEntrepreneurAbattementSchema = z.object({
  taux: z.number(),
  minimumAbattement: z.number(),
});

const EstimateImpactKnowledgeSchema = z.object({
  campaign: z.string(),
  revenusAnnee: z.string(),
  sources: z.array(
    z.object({
      ruleId: z.string(),
      url: z.string().url(),
      title: z.string(),
      authority: z.string(),
      confidence: z.enum(["high", "low"]),
    })
  ),
  baremeIR: z.object({
    tranches: z.array(BaremeTrancheSchema).min(1),
  }),
  decote: z.object({
    celibataire: DecoteParamsSchema,
    couple: DecoteParamsSchema,
  }),
  quotientFamilial: z.object({
    partsBase: z.object({
      celibataire: z.number(),
      marie_pacse: z.number(),
    }),
    majorationsEnfants: z.object({
      chargeExclusive1: z.number(),
      chargeExclusive2: z.number(),
      chargeExclusive3etPlus: z.number(),
      gardeAlternee1: z.number(),
      gardeAlternee2: z.number(),
      gardeAlternee3etPlus: z.number(),
    }),
    parentIsole: z.object({
      majoration: z.number(),
    }),
    plafonds: z.object({
      avantageParDemiPart: z.number(),
      avantageParentIsolePremierePartSpecifique: z.number(),
    }),
  }),
  abattements: z.object({
    salaires: z.object({
      taux: z.number(),
      plancherParDeclarant: z.number(),
      plafondParDeclarant: z.number(),
    }),
    pensions: z.object({
      taux: z.number(),
      plancherParPensionne: z.number(),
      plafondParFoyer: z.number(),
    }),
    microFoncier: z.object({
      taux: z.number(),
      plafondRecettesBrutes: z.number(),
    }),
    dividendesOptionBareme: z.object({
      taux: z.number(),
    }),
    microEntrepreneur: z.object({
      bicVente: MicroEntrepreneurAbattementSchema,
      bicServices: MicroEntrepreneurAbattementSchema,
      bncLiberal: MicroEntrepreneurAbattementSchema,
    }),
  }),
  pfu: z.object({
    tauxGlobal: z.number(),
    tauxIR: z.number(),
    tauxPS: z.number(),
  }),
  creditsImpot: z.object({
    gardeEnfant: z.object({
      taux: z.number(),
      plafondDepensesParEnfant: z.number(),
      plafondDepensesGardeAlterneeParParent: z.number(),
    }),
    emploiDomicile: z.object({
      taux: z.number(),
      plafondBase: z.number(),
      majorationParEnfantACharge: z.number(),
      majorationParEnfantGardeAlternee: z.number(),
      majorationParMembrePlus65ans: z.number(),
      plafondAvecMajorations: z.number(),
      plafondInvalidite: z.number(),
    }),
  }),
  reductionsImpot: z.object({
    dons: z.object({
      taux66: z.object({
        taux: z.number(),
        plafondPctRevenuImposable: z.number(),
        caseDeclaration: z.string(),
      }),
      taux75Coluche: z.object({
        taux: z.number(),
        plafondDons: z.number(),
        dateApplicationNouveauPlafond: z.string(),
        caseDeclaration: z.string(),
      }),
    }),
  }),
  cehr: z.object({
    celibataire: z.array(BaremeTrancheSchema),
    couple: z.array(BaremeTrancheSchema),
  }),
});

const GuideFilingStepSchema = z.object({
  stepId: z.string(),
  label: z.string(),
  position: z.number(),
  verifyNow: z.array(z.string()),
  frequentOmissions: z.array(z.string()),
  traps: z.array(z.string()),
  keyCaseCodes: z.array(z.string()),
  sourceUrl: z.string().url(),
  sourceTitle: z.string(),
  confidenceLevel: z.enum(["high", "medium", "low"]),
  notes: z.string().optional(),
});

const GuideFilingKnowledgeSchema = z.object({
  campaign: z.string(),
  steps: z.array(GuideFilingStepSchema).min(1),
});

export class JsonDbAdapter implements DbAdapter {
  private readonly qualificationConfig: QualificationConfig;
  private readonly qualificationKnowledge: QualificationKnowledge;
  private readonly qualificationCorpus: QualificationCorpus;
  private readonly supportingDocumentsKnowledge: SupportingDocumentsKnowledge;
  private readonly reviewPointsKnowledge: ReviewPointsKnowledge;
  private readonly preDeclarationKnowledge: PreDeclarationKnowledge;
  private readonly estimateImpactKnowledge: EstimateImpactKnowledge;
  private readonly guideFilingKnowledge: GuideFilingKnowledge;

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
    const preDeclarationRaw = readFileSync(
      new URL("../../data/build-pre-declaration.db.json", import.meta.url),
      "utf8"
    );
    const preDeclarationParsed = PreDeclarationKnowledgeSchema.parse(JSON.parse(preDeclarationRaw));
    const estimateImpactRaw = readFileSync(
      new URL("../../data/estimate-impact.db.json", import.meta.url),
      "utf8"
    );
    const estimateImpactParsed = EstimateImpactKnowledgeSchema.parse(JSON.parse(estimateImpactRaw));
    const guideFilingRaw = readFileSync(
      new URL("../../data/guide-filing.db.json", import.meta.url),
      "utf8"
    );
    const guideFilingParsed = GuideFilingKnowledgeSchema.parse(JSON.parse(guideFilingRaw));

    this.qualificationConfig = dbParsed.qualificationConfig;
    this.qualificationKnowledge = dbParsed.qualificationKnowledge;
    this.qualificationCorpus = dbParsed.qualificationCorpus;
    this.supportingDocumentsKnowledge = documentsParsed;
    this.reviewPointsKnowledge = reviewPointsParsed;
    this.preDeclarationKnowledge = preDeclarationParsed;
    this.estimateImpactKnowledge = estimateImpactParsed;
    this.guideFilingKnowledge = guideFilingParsed;
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

  getPreDeclarationKnowledge() {
    return this.preDeclarationKnowledge;
  }

  getEstimateImpactKnowledge() {
    return this.estimateImpactKnowledge;
  }

  getGuideFilingKnowledge() {
    return this.guideFilingKnowledge;
  }
}
