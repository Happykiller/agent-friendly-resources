import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  return new QualifyTaxProfileUseCase(repository);
}

test("rejects empty income types", () => {
  const useCase = createUseCase();
  const parsed = useCase.validateInput({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: [],
  });

  assert.equal(parsed.success, false);
});

test("rejects charges with none mixed with other values", () => {
  const useCase = createUseCase();
  const parsed = useCase.validateInput({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    charges: ["none", "donations"],
  });

  assert.equal(parsed.success, false);
});

test("accepts extended context arrays", () => {
  const useCase = createUseCase();
  const parsed = useCase.validateInput({
    householdStatus: "married",
    dependentsCount: 1,
    incomeTypes: ["salary"],
    dependentContexts: ["children_shared_custody"],
    donationContexts: ["general_interest"],
    homeServiceContexts: ["received_aids"],
    alimonyContexts: ["adult_child_support"],
  });

  assert.equal(parsed.success, true);
});

test("detects dependent shared custody rule", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "divorced",
    dependentsCount: 1,
    incomeTypes: ["salary"],
    charges: ["none"],
    events: [],
    dependentContexts: ["children_shared_custody"],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.equal(result.complexity, "monitor");
  assert.ok(result.suggestedCaseCodes.includes("H"));
  assert.ok(result.suggestedCaseCodes.includes("7GE"));
});

test("detects donation heritage religious rule", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    charges: ["donations"],
    events: [],
    dependentContexts: [],
    donationContexts: ["heritage_religious"],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.ok(result.suggestedCaseCodes.includes("7UJ"));
});

test("detects home service aids context", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    charges: ["home_services"],
    events: [],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: ["received_aids"],
    alimonyContexts: [],
  });

  assert.ok(result.suggestedCaseCodes.includes("7DR"));
});

test("detects alimony adult child context", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "divorced",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    charges: ["alimony"],
    events: [],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: ["adult_child_support"],
  });

  assert.ok(result.detectedTopics.includes("pensions_versees"));
  assert.equal(result.mvpDecision, "supported_with_caution");
});

test("keeps out_of_scope decision for out of scope income", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["salary", "foreign_income"],
    charges: ["none"],
    events: [],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.equal(result.complexity, "out_of_scope");
  assert.equal(result.mvpDecision, "human_review");
});

test("detects rental income qualification branch", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["rental_income"],
    charges: ["none"],
    events: [],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.ok(result.detectedTopics.includes("revenus_fonciers"));
  assert.ok(result.suggestedCaseCodes.includes("4BE"));
});

test("detects micro entrepreneur branch", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["micro_entrepreneur"],
    charges: ["none"],
    events: [],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.ok(result.detectedTopics.includes("micro_entrepreneur"));
  assert.ok(result.suggestedCaseCodes.includes("5KO"));
  assert.equal(result.mvpDecision, "supported_with_caution");
});

test("detects furnished rental branch", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "married",
    dependentsCount: 0,
    incomeTypes: ["furnished_rental"],
    charges: ["none"],
    events: [],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.ok(result.detectedTopics.includes("location_meublee"));
  assert.ok(result.suggestedCaseCodes.includes("5NG"));
});

test("detects salary frais reels branch from events", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    charges: ["none"],
    events: ["je veux declarer mes frais reels"],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.ok(result.detectedTopics.includes("frais_reels"));
  assert.ok(result.suggestedCaseCodes.includes("1AK"));
});

test("marks pinel investment keywords as human review", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "single",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    charges: ["none"],
    events: ["investissement pinel 2025"],
    dependentContexts: [],
    donationContexts: [],
    homeServiceContexts: [],
    alimonyContexts: [],
  });

  assert.ok(result.detectedTopics.includes("investissements_locatifs"));
  assert.equal(result.complexity, "out_of_scope");
  assert.equal(result.mvpDecision, "human_review");
});
