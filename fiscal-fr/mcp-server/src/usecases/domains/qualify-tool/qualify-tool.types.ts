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
  dependentContexts?: string[];
  donationContexts?: string[];
  homeServiceContexts?: string[];
  alimonyContexts?: string[];
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
  dependentContextTypes: string[];
  donationContextTypes: string[];
  homeServiceContextTypes: string[];
  alimonyContextTypes: string[];
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
  dependentContexts: string[];
  donationContexts: string[];
  homeServiceContexts: string[];
  alimonyContexts: string[];
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

export type ListSupportingDocumentsInput = {
  profileSnapshot: QualifyTaxProfileInput;
  alreadyAvailableDocuments: string[];
  knownFacts: string[];
};

export type DocumentItem = {
  label: string;
  technicalKey: string;
  reasons: string[];
  sourceUrls: string[];
};

export type ListSupportingDocumentsResult = {
  required: DocumentItem[];
  recommended: DocumentItem[];
  missing: DocumentItem[];
  notes: string[];
  profileSummary: {
    complexity: ComplexityLevel;
    mvpDecision: DecisionLevel;
    detectedTopics: string[];
  };
};

export type ReviewPointSeverity = "info" | "warning" | "error";

export type ReviewPointCondition = {
  incomeTypesAny?: string[];
  chargesAny?: string[];
  dependentContextsAny?: string[];
  outOfScopeIncomes?: boolean;
  outOfScopeEvents?: boolean;
  declaredAmountWithoutIncomeType?: {
    amountKeywords: string[];
    requiredIncomeType: string;
  };
};

export type ReviewPointRule = {
  id: string;
  severity: ReviewPointSeverity;
  blocking: boolean;
  topic: string;
  justificationTemplate: string;
  suggestedActions: string[];
  when: ReviewPointCondition;
  confirmedByKeywords?: string[];
};

export type ReviewPointsKnowledge = {
  campaign: string;
  rules: ReviewPointRule[];
};

export type ReviewPoint = {
  id: string;
  severity: ReviewPointSeverity;
  blocking: boolean;
  topic: string;
  justification: string;
  suggestedActions: string[];
};

export type DetectReviewPointsInput = {
  profileSnapshot: QualifyTaxProfileInput;
  knownFacts: string[];
  declaredAmounts?: Record<string, number>;
};

export type DetectReviewPointsResult = {
  reviewPoints: ReviewPoint[];
  hasBlockingPoints: boolean;
  summary: {
    complexity: ComplexityLevel;
    mvpDecision: DecisionLevel;
    totalPoints: number;
    blockingCount: number;
  };
};

export type PreDeclarationFieldMapping = {
  id: string;
  sectionId: string;
  sectionLabel: string;
  label: string;
  caseCode: string | null;
  triggeredByIncomeType?: string;
  triggeredByChargeType?: string;
  amountKey: string;
  origin: string;
  sourceUrls: string[];
};

export type PreDeclarationKnowledge = {
  campaign: string;
  fieldMappings: PreDeclarationFieldMapping[];
  sectionOrder: string[];
};

export type PreDeclarationEntry = {
  id: string;
  label: string;
  caseCode: string | null;
  value: number | null;
  status: "confirmed" | "to_confirm";
  origin: string;
  sourceUrls: string[];
};

export type PreDeclarationSection = {
  id: string;
  label: string;
  entries: PreDeclarationEntry[];
};

export type BuildPreDeclarationInput = {
  profileSnapshot: QualifyTaxProfileInput;
  declaredAmounts: Record<string, number>;
  knownFacts: string[];
};

export type BuildPreDeclarationResult = {
  sections: PreDeclarationSection[];
  draftStatus: "complete" | "incomplete";
  pointsToConfirm: string[];
  profileSummary: {
    complexity: ComplexityLevel;
    mvpDecision: DecisionLevel;
    detectedTopics: string[];
  };
};

export type SupportingDocumentsKnowledge = {
  campaign: string;
  recommendedByIncomeType: Record<string, string[]>;
  recommendedByChargeType: Record<string, string[]>;
  additionalRules: Array<{
    id: string;
    when: {
      incomeTypesAny?: string[];
      chargesAny?: string[];
      eventKeywordsAny?: string[];
    };
    recommendedDocuments: string[];
    note?: string;
  }>;
};
