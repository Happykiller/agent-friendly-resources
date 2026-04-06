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

// --- cas simple sans alerte bloquante ---
test("one review point (optimization) for simple salaried case with known facts", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    knownFacts: [],
  });

  assert.equal(result.hasBlockingPoints, false);
  // Expect 1 point: optimization_frais_reels (triggered by 'salary')
  assert.equal(result.reviewPoints.length, 1);
  assert.equal(result.reviewPoints[0].id, "optimization_frais_reels");
  assert.equal(result.summary.complexity, "simple");
  assert.equal(result.summary.mvpDecision, "supported");
});

// --- dons sans justificatif confirme ---
test("warns on donations without confirmed receipt", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, charges: ["donations"], donationContexts: ["general_interest"] },
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "donation_receipt_unconfirmed");
  assert.ok(point, "should have donation_receipt_unconfirmed point");
  assert.equal(point.severity, "warning");
  assert.equal(point.blocking, false);
});

test("no donation warning when receipt confirmed in knownFacts", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, charges: ["donations"], donationContexts: ["general_interest"] },
    knownFacts: ["recu fiscal disponible pour chaque don"],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "donation_receipt_unconfirmed");
  assert.equal(point, undefined);
});

// --- garde alternee avec infos incompletes ---
test("info point for shared custody without detail", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      ...baseProfile,
      dependentsCount: 1,
      dependentContexts: ["children_shared_custody"],
    },
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "shared_custody_details_needed");
  assert.ok(point, "should have shared_custody_details_needed point");
  assert.equal(point.severity, "info");
  assert.equal(point.blocking, false);
});

// --- location meublee avec statut LMNP/LMP non tranche ---
test("warns on furnished rental without confirmed status", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["furnished_rental"] },
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "furnished_rental_status_unclear");
  assert.ok(point, "should have furnished_rental_status_unclear point");
  assert.equal(point.severity, "warning");
});

test("no furnished rental warning when status is confirmed", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["furnished_rental"] },
    knownFacts: ["statut LMNP confirme, regime micro-BIC"],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "furnished_rental_status_unclear");
  assert.equal(point, undefined);
});

// --- revenus fonciers sans choix de regime ---
test("warns on rental income without regime clarification", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["rental_income"] },
    knownFacts: [],
  });

  const point = result.reviewPoints.find((rp) => rp.id === "rental_regime_unclear");
  assert.ok(point, "should have rental_regime_unclear point");
  assert.equal(point.severity, "warning");
  assert.equal(point.blocking, false);
});

// --- cas hors perimetre avec alerte bloquante ---
test("blocking error for out-of-scope income (crypto)", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["salary", "crypto"] },
    knownFacts: [],
  });

  assert.equal(result.hasBlockingPoints, true);
  const point = result.reviewPoints.find((rp) => rp.id === "out_of_scope_income");
  assert.ok(point, "should have out_of_scope_income point");
  assert.equal(point.severity, "error");
  assert.equal(point.blocking, true);
});

test("blocking error for out-of-scope event (divorce)", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, events: ["divorce en cours cette annee"] },
    knownFacts: [],
  });

  assert.equal(result.hasBlockingPoints, true);
  const point = result.reviewPoints.find((rp) => rp.id === "out_of_scope_event");
  assert.ok(point, "should have out_of_scope_event point");
  assert.equal(point.severity, "error");
  assert.equal(point.blocking, true);
});

// --- incoherence declaredAmounts ---
test("warns when salary amount declared but salary not in incomeTypes", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["dividends"] },
    knownFacts: [],
    declaredAmounts: { salary: 35000 },
  });

  const point = result.reviewPoints.find((rp) => rp.id === "declared_salary_no_income_type");
  assert.ok(point, "should have declared_salary_no_income_type point");
  assert.equal(point.severity, "warning");
});

// --- validateInput rejette un profile invalide ---
test("validateInput rejects invalid profileSnapshot", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({
    profileSnapshot: { householdStatus: "invalid_status", dependentsCount: 0, incomeTypes: ["salary"] },
    knownFacts: [],
  });

  assert.equal(result.success, false);
});

test("validateInput accepts valid input with defaults", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({
    profileSnapshot: baseProfile,
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.knownFacts, []);
    assert.equal(result.data.declaredAmounts, undefined);
  }
});

// --- summary coherence ---
test("summary reflects blocking count correctly", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["crypto", "foreign_income"] },
    knownFacts: [],
  });

  assert.equal(result.summary.blockingCount, result.reviewPoints.filter((rp) => rp.blocking).length);
  assert.equal(result.hasBlockingPoints, result.summary.blockingCount > 0);
});
