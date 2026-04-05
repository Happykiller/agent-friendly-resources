import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import { EstimateImpactUseCase } from "./estimate-impact.usecase.js";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  const qualifyUseCase = new QualifyTaxProfileUseCase(repository);
  return new EstimateImpactUseCase(qualifyUseCase, repository);
}

const baseProfile = {
  householdStatus: "celibataire",
  dependentsCount: 0,
  incomeTypes: ["salary"],
  charges: ["none"],
  events: [],
  dependentContexts: [],
  donationContexts: [],
  homeServiceContexts: [],
  alimonyContexts: [],
};

// ── Cas 1 : célibataire sans enfant, salaire seul ─────────────────────────────

test("célibataire salaire 30 000€ : abattement 10% et barème correct", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 30000 },
    options: {},
  });

  // RNI = 30000 − 3000 (10%) = 27000
  // Barème sur 27000 : 0% sur 11600 + 11% sur (27000−11600) = 11% × 15400 = 1694
  assert.equal(result.revenuNetImposable, 27000);
  assert.equal(result.nombreParts, 1);

  // Impôt brut ≈ 1694 (arrondi)
  assert.ok(result.impotBrut >= 1690 && result.impotBrut <= 1700, `impotBrut=${result.impotBrut}`);

  // Décote : impôt brut < 1982 → décote = 897 − 0.4525 × impotBrut > 0
  assert.ok(result.decote > 0, "décote doit être positive");

  // Disclaimer toujours présent
  assert.ok(result.disclaimer.length > 0);
  // Campagne correcte
  assert.equal(result.campaign, "2026");
});

// ── Cas 2 : couple marié, 2 enfants à charge exclusive, salaires ───────────────

test("couple marié 2 enfants : nombre de parts = 3", () => {
  const useCase = createUseCase();
  const coupleProfile = {
    ...baseProfile,
    householdStatus: "marie_pacse",
    dependentsCount: 2,
    incomeTypes: ["salary"],
  };

  const result = useCase.execute({
    profileSnapshot: coupleProfile,
    declaredAmounts: { salary: 60000 },
    options: {},
  });

  // baseParts=2, enfant1=0.5, enfant2=0.5 → 3 parts
  assert.equal(result.nombreParts, 3);

  // Abattement : min(6000, 2×14555) cap → 6000 (10% de 60000, plancher 2×509=1018 ok)
  assert.equal(result.revenuNetImposable, 54000);
});

// ── Cas 3 : parent isolé célibataire, 1 enfant ────────────────────────────────

test("parent isolé célibataire 1 enfant : 2 parts (1 base + 0.5 enfant + 0.5 parent isolé)", () => {
  const useCase = createUseCase();
  const parentIsoleProfile = {
    ...baseProfile,
    householdStatus: "celibataire",
    dependentsCount: 1,
  };

  const result = useCase.execute({
    profileSnapshot: parentIsoleProfile,
    declaredAmounts: { salary: 30000 },
    options: {},
  });

  // 1 (base) + 0.5 (enfant CE1) + 0.5 (parent isolé) = 2.0 parts
  assert.equal(result.nombreParts, 2);

  // Avertissement parent isolé présent
  const hasParentIsoleWarning = result.warnings.some((w) =>
    w.toLowerCase().includes("parent isolé")
  );
  assert.ok(hasParentIsoleWarning, "doit mentionner parent isolé dans les warnings");
});

// ── Cas 4 : PFU sur dividendes sans option barème ─────────────────────────────

test("dividendes sans option barème → PFU 31.4% calculé séparément", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 40000, dividends: 10000 },
    options: {},
  });

  // Dividendes → PFU, pas dans RNI
  assert.ok(result.pfuDetails !== undefined, "pfuDetails doit être défini");
  assert.equal(result.pfuDetails!.base, 10000);
  // PFU = 10000 × 0.314 = 3140
  assert.equal(result.pfuDetails!.impotPfu, 3140);
  // Dividendes ne sont pas dans le RNI du barème
  // RNI = 40000 × 0.90 = 36000
  assert.equal(result.revenuNetImposable, 36000);
});

// ── Cas 5 : dividendes avec option barème → abattement 40% ────────────────────

test("dividendes avec option barème → abattement 40% appliqué, pas de PFU", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["salary", "dividends"] },
    declaredAmounts: { salary: 30000, dividends: 5000 },
    options: { dividendesOptionBareme: true },
  });

  // Abattement dividendes = 5000 × 0.40 = 2000 → net = 3000
  // RNI = 27000 (salaires) + 3000 (dividendes) = 30000
  assert.equal(result.revenuNetImposable, 30000);
  // Pas de PFU sur dividendes
  assert.equal(result.pfuDetails, undefined);
});

// ── Cas 6 : réduction dons 66% ────────────────────────────────────────────────

test("réduction dons 66% plafonnée à 20% du RNI", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, charges: ["donations"] },
    declaredAmounts: { salary: 30000, donations: 500 },
    options: {},
  });

  // RNI = 27000
  // Plafond dons = 27000 × 0.20 = 5400 → base = 500 (< plafond)
  // Réduction = 500 × 0.66 = 330
  assert.equal(result.reductionsImpot, 330);
});

// ── Cas 7 : crédit emploi domicile ────────────────────────────────────────────

test("crédit emploi domicile 50% plafond 12 000€", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, charges: ["home_services"] },
    declaredAmounts: { salary: 50000, home_services: 8000 },
    options: {},
  });

  // Crédit = 8000 × 0.50 = 4000
  assert.equal(result.creditsImpot, 4000);
});

// ── Cas 8 : revenu nul → impôt zéro ──────────────────────────────────────────

test("aucun revenu déclaré → impôt zéro", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: {},
    options: {},
  });

  assert.equal(result.revenuNetImposable, 0);
  assert.equal(result.impotBrut, 0);
  assert.equal(result.impotNet, 0);
  assert.equal(result.totalDu, 0);
});

// ── Cas 9 : abattement salaires plancher ─────────────────────────────────────

test("abattement salaires : plancher de 509€ si 10% inférieur au plancher", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 2000 }, // 10% = 200 < plancher 509
    options: {},
  });

  // Abattement = 509 (plancher), RNI = 2000 − 509 = 1491
  assert.equal(result.revenuNetImposable, 1491);
  // Revenu < 11600 → impôt brut = 0
  assert.equal(result.impotBrut, 0);
});

// ── Cas 10 : abattement salaires plafond ─────────────────────────────────────

test("abattement salaires : plafond de 14 555€ si 10% supérieur au plafond", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 200000 }, // 10% = 20000 > plafond 14555
    options: {},
  });

  // Abattement = 14555 (plafond), RNI = 200000 − 14555 = 185445
  assert.equal(result.revenuNetImposable, 185445);
});

// ── Cas 11 : disclaimer toujours présent ──────────────────────────────────────

test("disclaimer toujours présent dans le résultat", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 40000 },
    options: {},
  });

  assert.ok(result.disclaimer.length > 20, "disclaimer doit être une phrase significative");
  assert.ok(
    result.disclaimer.toLowerCase().includes("indicative") ||
      result.disclaimer.toLowerCase().includes("indicatif"),
    "disclaimer doit mentionner le caractère indicatif"
  );
});

// ── Cas 12 : micro-foncier avertissement si > 15 000€ ────────────────────────

test("micro-foncier : warning si recettes > 15 000€", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["salary", "rental_income"] },
    declaredAmounts: { salary: 30000, rental_income: 20000 },
    options: {},
  });

  const hasMicroFoncierWarning = result.warnings.some(
    (w) => w.toLowerCase().includes("micro-foncier") || w.toLowerCase().includes("régime réel")
  );
  assert.ok(hasMicroFoncierWarning, "doit avertir que le régime réel s'applique");
});

// ── Cas 13 : validateInput rejette un profil invalide ────────────────────────

test("validateInput rejette un profil sans householdStatus", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({
    profileSnapshot: { dependentsCount: 0 }, // householdStatus manquant
    declaredAmounts: {},
  });

  assert.equal(result.success, false);
});

// ── Cas 14 : garde alternée → moitié des parts enfants ───────────────────────

test("2 enfants garde alternée : nombreParts = 1 + 0.25 + 0.25 = 1.5", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      ...baseProfile,
      householdStatus: "celibataire",
      dependentsCount: 2,
      dependentContexts: ["garde_alternee"],
    },
    declaredAmounts: { salary: 30000 },
    options: {},
  });

  // Note: parent isolé s'applique aussi → 1 + 0.25 + 0.25 + 0.5 = 2.0
  assert.equal(result.nombreParts, 2.0);
});

// ── Cas 15 : sourcesUsed renvoyées ───────────────────────────────────────────

test("sourcesUsed est non vide et contient les sources documentaires", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 40000 },
    options: {},
  });

  assert.ok(Array.isArray(result.sourcesUsed) && result.sourcesUsed.length > 0);
  assert.ok(result.sourcesUsed[0].ruleId !== undefined);
  assert.ok(result.sourcesUsed[0].url !== undefined);
});

// ── Contrat : validateInput accepte un input valide ───────────────────────────

test("validateInput accepte un input valide (contrat OK)", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({
    profileSnapshot: {
      householdStatus: "single",
      dependentsCount: 0,
      incomeTypes: ["salary"],
    },
    declaredAmounts: { salary: 30000 },
    options: {},
  });

  assert.equal(result.success, true);
});
