import type {
  QualificationConfig,
  QualificationCorpus,
  QualificationKnowledge,
  SupportingDocumentsKnowledge,
} from "./qualify-tool.types.js";

export interface QualifyToolRepository {
  getQualificationConfig(): QualificationConfig;
  getQualificationKnowledge(): QualificationKnowledge;
  getQualificationCorpus(): QualificationCorpus;
  getSupportingDocumentsKnowledge(): SupportingDocumentsKnowledge;
}
