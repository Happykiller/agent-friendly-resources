import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import { DetectReviewPointsUseCase } from "./detect-review-points.usecase.js";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  const qualifyUseCase = new QualifyTaxProfileUseCase(repository);
  return new DetectReviewPointsUseCase(qualifyUseCase, repository);
}

const baseProfile = {
  householdStatus: "single" as const,
  dependentsCount: 0,
  incomeTypes: ["salary"],
  charges: ["none"],
  events: [],
  dependentContexts: [],
  donationContexts: [],
  homeServiceContexts: [],
  alimonyContexts: [],
};

test("optimization_2op is triggered for dividends", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["salary", "dividends"] },
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "optimization_2op");
  assert.ok(point, "should have optimization_2op point");
  assert.equal(point.severity, "info");
  assert.equal(point.topic, "Optimisation : Option pour le barème (case 2OP)");
});

test("optimization_2op is triggered for bank_interest", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["salary", "bank_interest"] },
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "optimization_2op");
  assert.ok(point, "should have optimization_2op point");
});

test("optimization_frais_reels is triggered for salary", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "optimization_frais_reels");
  assert.ok(point, "should have optimization_frais_reels point");
  assert.equal(point.severity, "info");
  assert.equal(point.topic, "Optimisation : Frais réels (case 1AK)");
});

test("optimization_parent_isole is triggered for children_exclusive_custody", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { 
      ...baseProfile, 
      dependentsCount: 1, 
      dependentContexts: ["children_exclusive_custody"] 
    },
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "optimization_parent_isole");
  assert.ok(point, "should have optimization_parent_isole point");
  assert.equal(point.severity, "info");
});
