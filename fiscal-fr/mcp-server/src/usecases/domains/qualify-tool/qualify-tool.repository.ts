import type {
  CompareTaxOptionsKnowledge,
  EstimateImpactKnowledge,
  GuideFilingKnowledge,
  PreDeclarationKnowledge,
  QualificationConfig,
  QualificationCorpus,
  QualificationKnowledge,
  ReviewPointsKnowledge,
  SupportingDocumentsKnowledge,
} from "./qualify-tool.types.js";

export interface QualifyToolRepository {
  getQualificationConfig(): QualificationConfig;
  getQualificationKnowledge(): QualificationKnowledge;
  getQualificationCorpus(): QualificationCorpus;
  getSupportingDocumentsKnowledge(): SupportingDocumentsKnowledge;
  getReviewPointsKnowledge(): ReviewPointsKnowledge;
  getPreDeclarationKnowledge(): PreDeclarationKnowledge;
  getEstimateImpactKnowledge(): EstimateImpactKnowledge;
  getCompareTaxOptionsKnowledge(): CompareTaxOptionsKnowledge;
  getGuideFilingKnowledge(): GuideFilingKnowledge;
}
