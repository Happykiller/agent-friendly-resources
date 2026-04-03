import type {
  QualificationConfig,
  QualificationCorpus,
  QualificationKnowledge,
} from "./qualify-tool.types.js";

export interface QualifyToolRepository {
  getQualificationConfig(): QualificationConfig;
  getQualificationKnowledge(): QualificationKnowledge;
  getQualificationCorpus(): QualificationCorpus;
}
