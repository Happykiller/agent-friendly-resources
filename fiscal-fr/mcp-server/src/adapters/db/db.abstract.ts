import type {
  QualificationConfig,
  QualificationCorpus,
  QualificationKnowledge,
} from "../../usecases/domains/qualify-tool/qualify-tool.types.js";

export interface DbAdapter {
  getQualificationConfig(): QualificationConfig;
  getQualificationKnowledge(): QualificationKnowledge;
  getQualificationCorpus(): QualificationCorpus;
}
