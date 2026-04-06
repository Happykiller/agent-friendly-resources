import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { GuideFilingStepUseCase } from "./guide-filing-step.usecase.ts";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  return new GuideFilingStepUseCase(repository);
}

test("step_etat_civil returns Case T highlight when children are in context", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    currentStep: "step_etat_civil",
    knownContext: {
      dependentContexts: ["children_exclusive_custody"]
    }
  });

  // Highlight statically from DB
  assert.ok(result.contextualHighlights.some(h => h.includes("Case T (Parent Isolé)")), "should have Case T highlight from DB");
  // Highlight from usecase logic (CONTEXTUAL_HIGHLIGHTS)
  assert.ok(result.contextualHighlights.some(h => h.includes("En tant que parent isolé élevant seul vos enfants")), "should have Case T highlight from usecase logic");
});

test("step_revenus_salaires returns 1AK highlight for salary", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    currentStep: "step_revenus_salaires",
    knownContext: {
      incomeTypes: ["salary"]
    }
  });

  assert.ok(result.contextualHighlights.some(h => h.includes("Frais Réels (1AK)")), "should have 1AK highlight from DB");
  assert.ok(result.contextualHighlights.some(h => h.includes("Optimisation Frais Réels")), "should have 1AK highlight from usecase");
});

test("step_revenus_capitaux_mobiliers returns 2OP highlight for dividends", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    currentStep: "step_revenus_capitaux_mobiliers",
    knownContext: {
      incomeTypes: ["dividends"]
    }
  });

  assert.ok(result.contextualHighlights.some(h => h.includes("Option Barème (2OP)")), "should have 2OP highlight from DB");
  assert.ok(result.contextualHighlights.some(h => h.includes("Optimisation Case 2OP")), "should have 2OP highlight from usecase");
});
