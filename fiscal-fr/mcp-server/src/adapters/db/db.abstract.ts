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
} from "../../usecases/domains/qualify-tool/qualify-tool.types.js";

export interface DbAdapter {
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
