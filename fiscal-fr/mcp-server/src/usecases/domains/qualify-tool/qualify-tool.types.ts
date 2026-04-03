export type ComplexityLevel = "simple" | "monitor" | "out_of_scope";
export type DecisionLevel = "supported" | "supported_with_caution" | "human_review";
export type ConfidenceLevel = "high" | "medium" | "low";

export type SourceRef = {
  title: string;
  url: string;
  publisher: string;
  authorityLevel: "primary_official" | "secondary_official";
};

export type RuleTrigger = {
  incomeTypes?: string[];
  charges?: string[];
  eventKeywords?: string[];
};

export type QualificationRule = {
  id: string;
  topic: string;
  trigger: RuleTrigger;
  complexityImpact: ComplexityLevel;
  decisionImpact: DecisionLevel;
  pointsToConfirm: string[];
  nextQuestions: string[];
  suggestedCaseCodes: string[];
  requiredDocuments: string[];
  onlineUiHints: string[];
  confidenceLevel: ConfidenceLevel;
  sources: SourceRef[];
};

export type QualificationConfig = {
  householdStatuses: string[];
  incomeTypes: string[];
  chargeTypes: string[];
  outOfScopeIncomeTypes: string[];
  monitorChargeTypes: string[];
  outOfScopeEventKeywords: string[];
};

export type QualificationKnowledge = {
  campaign: string;
  sourceAnalysis: {
    preferredAsset: string;
    secondaryAssets: string[];
    notes: string[];
  };
  rules: QualificationRule[];
};

export type CorpusAsset = {
  name: string;
  role: "primary" | "secondary";
  status: "promoted" | "supporting";
  notes: string[];
};

export type CorpusDocument = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  authorityLevel: "primary_official" | "secondary_official";
  topics: string[];
  promoted: boolean;
};

export type CorpusSignal = {
  id: string;
  originAsset: string;
  topic: string;
  statement: string;
  status: "promoted" | "candidate" | "rejected";
  reason: string;
};

export type QualificationCorpus = {
  campaign: string;
  assets: CorpusAsset[];
  officialDocuments: CorpusDocument[];
  candidateSignals: CorpusSignal[];
};

export type QualifyTaxProfileInput = {
  householdStatus: string;
  dependentsCount: number;
  incomeTypes: string[];
  charges: string[];
  events: string[];
};

export type QualifyTaxProfileResult = {
  factsConfirmed: string[];
  hypotheses: string[];
  pointsToConfirm: string[];
  complexity: ComplexityLevel;
  mvpDecision: DecisionLevel;
  nextQuestions: string[];
  detectedTopics: string[];
  suggestedCaseCodes: string[];
  requiredDocuments: string[];
  onlineUiHints: string[];
  knowledgeRecommendations: Array<{
    ruleId: string;
    topic: string;
    confidenceLevel: ConfidenceLevel;
    suggestedCaseCodes: string[];
    requiredDocuments: string[];
    pointsToConfirm: string[];
    nextQuestions: string[];
    onlineUiHints: string[];
    sources: SourceRef[];
  }>;
  sourceCoverage: {
    campaign: string;
    sourceAnalysis: {
      preferredAsset: string;
      secondaryAssets: string[];
      notes: string[];
    };
    sourcesUsed: SourceRef[];
  };
};
