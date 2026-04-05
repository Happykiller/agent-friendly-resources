import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { GuideFilingStepUseCase } from "./guide-filing-step.usecase.js";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  return new GuideFilingStepUseCase(repository);
}

// ── Cas 1 : étape connexion retournée correctement ─────────────────────────

test("step_connexion : retourne les champs attendus", () => {
  const useCase = createUseCase();
  const result = useCase.execute({ currentStep: "step_connexion" });

  assert.equal(result.stepId, "step_connexion");
  assert.ok(result.label.length > 0);
  assert.ok(result.verifyNow.length > 0);
  assert.ok(result.frequentOmissions.length > 0);
  assert.ok(result.traps.length > 0);
  assert.ok(Array.isArray(result.keyCaseCodes));
  assert.ok(result.sourceUrl.startsWith("https://"));
  assert.ok(result.sourceTitle.length > 0);
  assert.equal(result.campaign, "2026");
  assert.ok(Array.isArray(result.availableSteps) && result.availableSteps.length > 0);
  assert.ok(result.notes !== undefined && result.notes.length > 0, "step_connexion doit avoir des notes");
});

// ── Cas 2 : availableSteps triées par position ────────────────────────────

test("availableSteps sont triées par position croissante", () => {
  const useCase = createUseCase();
  const result = useCase.execute({ currentStep: "step_etat_civil" });

  const positions = result.availableSteps.map((s) => s.position);
  for (let i = 1; i < positions.length; i++) {
    assert.ok(
      positions[i] >= positions[i - 1],
      `availableSteps non triées : position[${i - 1}]=${positions[i - 1]} > position[${i}]=${positions[i]}`
    );
  }
});

// ── Cas 3 : étape inconnue lève une erreur ────────────────────────────────

test("étape inconnue → throw Error avec la liste des étapes disponibles", () => {
  const useCase = createUseCase();
  assert.throws(
    () => useCase.execute({ currentStep: "step_inexistant" }),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes("step_inexistant"));
      assert.ok(err.message.includes("step_connexion"));
      return true;
    }
  );
});

// ── Cas 4 : step_revenus_salaires sans contexte ───────────────────────────

test("step_revenus_salaires sans contexte : contextualHighlights vide", () => {
  const useCase = createUseCase();
  const result = useCase.execute({ currentStep: "step_revenus_salaires" });

  assert.deepEqual(result.contextualHighlights, []);
  assert.ok(result.verifyNow.some((v) => v.includes("1AJ")), "doit mentionner la case 1AJ");
  assert.ok(result.keyCaseCodes.includes("1AJ"));
  assert.ok(result.keyCaseCodes.includes("1AS"));
});

// ── Cas 5 : step_revenus_salaires avec contexte salary ────────────────────

test("step_revenus_salaires avec incomeType salary → highlight contextuel", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    currentStep: "step_revenus_salaires",
    knownContext: { incomeTypes: ["salary"] },
  });

  assert.ok(result.contextualHighlights.length > 0, "doit avoir au moins un highlight");
  assert.ok(
    result.contextualHighlights.some((h) => h.includes("1AJ")),
    "le highlight salary doit mentionner 1AJ"
  );
});

// ── Cas 6 : step_revenus_capitaux_mobiliers avec dividendes ───────────────

test("step_revenus_capitaux_mobiliers avec dividends → highlight option barème", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    currentStep: "step_revenus_capitaux_mobiliers",
    knownContext: { incomeTypes: ["dividends"] },
  });

  assert.ok(
    result.contextualHighlights.some((h) => h.toLowerCase().includes("barème") || h.toLowerCase().includes("2op")),
    "doit mentionner l'option barème ou 2OP"
  );
});

// ── Cas 7 : step_reductions_credits_impot avec dons et garde ─────────────

test("step_reductions_credits_impot avec donations + childcare → 2 highlights", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    currentStep: "step_reductions_credits_impot",
    knownContext: { charges: ["donations", "childcare"] },
  });

  assert.ok(result.contextualHighlights.length >= 2, "doit avoir au moins 2 highlights");
  assert.ok(
    result.contextualHighlights.some((h) => h.includes("7UD") || h.includes("Coluche")),
    "highlight donations doit mentionner 7UD ou Coluche"
  );
  assert.ok(
    result.contextualHighlights.some((h) => h.includes("7GA") || h.includes("garde")),
    "highlight childcare doit mentionner 7GA ou garde"
  );
});

// ── Cas 8 : step_reductions_credits_impot a les cases 7UF et 7UD ─────────

test("step_reductions_credits_impot : keyCaseCodes inclut 7UF et 7UD", () => {
  const useCase = createUseCase();
  const result = useCase.execute({ currentStep: "step_reductions_credits_impot" });

  assert.ok(result.keyCaseCodes.includes("7UF"), "doit contenir 7UF");
  assert.ok(result.keyCaseCodes.includes("7UD"), "doit contenir 7UD");
  assert.ok(result.keyCaseCodes.includes("7DB"), "doit contenir 7DB");
  assert.ok(result.keyCaseCodes.includes("7GA"), "doit contenir 7GA");
});

// ── Cas 9 : step_vigilance_transversale disponible ────────────────────────

test("step_vigilance_transversale est accessible et a position 99", () => {
  const useCase = createUseCase();
  const result = useCase.execute({ currentStep: "step_vigilance_transversale" });

  assert.equal(result.stepId, "step_vigilance_transversale");
  assert.equal(result.position, 99);
  assert.ok(result.traps.some((t) => t.toLowerCase().includes("déclaration automatique")));
});

// ── Cas 10 : validateInput rejette input sans currentStep ─────────────────

test("validateInput rejette un input sans currentStep", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({});

  assert.equal(result.success, false);
});

// ── Cas 11 : validateInput rejette currentStep vide ──────────────────────

test("validateInput rejette un currentStep vide", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({ currentStep: "" });

  assert.equal(result.success, false);
});

// ── Cas 12 : step sans notes n'a pas le champ notes dans la sortie ────────

test("step sans notes : champ notes absent du résultat", () => {
  const useCase = createUseCase();
  const result = useCase.execute({ currentStep: "step_etat_civil" });

  assert.equal(result.notes, undefined, "step_etat_civil ne doit pas avoir de notes");
});

// ── Cas 13 : step_revenus_fonciers contient les bonnes cases ─────────────

test("step_revenus_fonciers : keyCaseCodes inclut 4BE, 4BA, 4BC", () => {
  const useCase = createUseCase();
  const result = useCase.execute({ currentStep: "step_revenus_fonciers" });

  assert.ok(result.keyCaseCodes.includes("4BE"), "doit contenir 4BE");
  assert.ok(result.keyCaseCodes.includes("4BA"), "doit contenir 4BA");
  assert.ok(result.keyCaseCodes.includes("4BC"), "doit contenir 4BC");
});

// ── Cas 14 : contexte irrelevant pour une étape → pas de highlight ────────

test("contexte irrelevant pour l'étape → contextualHighlights vide", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    currentStep: "step_connexion",
    knownContext: { incomeTypes: ["salary", "dividends"], charges: ["donations"] },
  });

  assert.deepEqual(
    result.contextualHighlights,
    [],
    "step_connexion n'a pas de highlights contextuels"
  );
});

// ── Cas 15 : validateInput accepte un input valide ────────────────────────────

test("validateInput accepte un input valide (contrat OK)", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({ currentStep: "step_connexion" });

  assert.equal(result.success, true);
});
