import type { DbAdapter } from "./db.abstract.js";
import type { QualifyToolRepository } from "../../usecases/domains/qualify-tool/qualify-tool.repository.js";

export class JsonQualifyToolRepository implements QualifyToolRepository {
  private readonly db: DbAdapter;

  constructor(db: DbAdapter) {
    this.db = db;
  }

  getQualificationConfig() {
    return this.db.getQualificationConfig();
  }

  getQualificationKnowledge() {
    return this.db.getQualificationKnowledge();
  }

  getQualificationCorpus() {
    return this.db.getQualificationCorpus();
  }

  getSupportingDocumentsKnowledge() {
    return this.db.getSupportingDocumentsKnowledge();
  }

  getReviewPointsKnowledge() {
    return this.db.getReviewPointsKnowledge();
  }

  getPreDeclarationKnowledge() {
    return this.db.getPreDeclarationKnowledge();
  }

  getEstimateImpactKnowledge() {
    return this.db.getEstimateImpactKnowledge();
  }

  getCompareTaxOptionsKnowledge() {
    return this.db.getCompareTaxOptionsKnowledge();
  }

  getGuideFilingKnowledge() {
    return this.db.getGuideFilingKnowledge();
  }
}
