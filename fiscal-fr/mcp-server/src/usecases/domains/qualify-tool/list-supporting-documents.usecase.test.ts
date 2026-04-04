import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import { ListSupportingDocumentsUseCase } from "./list-supporting-documents.usecase.js";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  const qualifyUseCase = new QualifyTaxProfileUseCase(repository);
  return new ListSupportingDocumentsUseCase(qualifyUseCase, repository);
}

test("builds required docs for donations and childcare", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      householdStatus: "married",
      dependentsCount: 2,
      incomeTypes: ["salary"],
      charges: ["donations", "childcare"],
      events: [],
      dependentContexts: [],
      donationContexts: ["general_interest"],
      homeServiceContexts: [],
      alimonyContexts: [],
    },
    alreadyAvailableDocuments: [],
    knownFacts: [],
  });

  assert.ok(result.required.some((doc) => doc.technicalKey.includes("recus_fiscaux")));
  assert.ok(result.required.some((doc) => doc.label.includes("garde")));
  assert.ok(result.missing.length > 0);
});

test("marks required docs as non-missing when provided", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      householdStatus: "single",
      dependentsCount: 0,
      incomeTypes: ["dividends"],
      charges: ["none"],
      events: [],
      dependentContexts: [],
      donationContexts: [],
      homeServiceContexts: [],
      alimonyContexts: [],
    },
    alreadyAvailableDocuments: ["Imprime Fiscal Unique (IFU) 2025"],
    knownFacts: [],
  });

  assert.ok(result.required.some((doc) => doc.label.includes("IFU")));
  assert.equal(result.missing.length, 0);
});

test("adds recommended docs from income and charges", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      householdStatus: "single",
      dependentsCount: 0,
      incomeTypes: ["salary", "rental_income"],
      charges: ["home_services"],
      events: [],
      dependentContexts: [],
      donationContexts: [],
      homeServiceContexts: [],
      alimonyContexts: [],
    },
    alreadyAvailableDocuments: [],
    knownFacts: [],
  });

  assert.ok(result.recommended.some((doc) => doc.label.includes("salaire")));
  assert.ok(result.recommended.some((doc) => doc.label.includes("loyers")));
  assert.ok(result.recommended.some((doc) => doc.label.includes("emploi a domicile")));
});

test("adds caution note on human review cases", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      householdStatus: "single",
      dependentsCount: 0,
      incomeTypes: ["salary"],
      charges: ["none"],
      events: ["investissement pinel"],
      dependentContexts: [],
      donationContexts: [],
      homeServiceContexts: [],
      alimonyContexts: [],
    },
    alreadyAvailableDocuments: [],
    knownFacts: [],
  });

  assert.equal(result.profileSummary.mvpDecision, "human_review");
  assert.ok(result.notes.some((note) => note.includes("revue humaine")));
});

test("keeps technical key and label separated", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      householdStatus: "single",
      dependentsCount: 0,
      incomeTypes: ["micro_entrepreneur"],
      charges: ["none"],
      events: [],
      dependentContexts: [],
      donationContexts: [],
      homeServiceContexts: [],
      alimonyContexts: [],
    },
    alreadyAvailableDocuments: [],
    knownFacts: [],
  });

  const item = result.required[0];
  assert.ok(item.label.length > 0);
  assert.ok(item.technicalKey.includes("_"));
});

test("input validation rejects invalid profile snapshot", () => {
  const useCase = createUseCase();
  const parsed = useCase.validateInput({
    profileSnapshot: {
      householdStatus: "invalid",
      dependentsCount: 0,
      incomeTypes: ["salary"],
    },
  });

  assert.equal(parsed.success, false);
});
