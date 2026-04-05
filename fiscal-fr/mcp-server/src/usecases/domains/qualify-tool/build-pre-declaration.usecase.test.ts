import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import { BuildPreDeclarationUseCase } from "./build-pre-declaration.usecase.js";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  const qualifyUseCase = new QualifyTaxProfileUseCase(repository);
  return new BuildPreDeclarationUseCase(qualifyUseCase, repository);
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

// --- entrée salary sans montant → to_confirm ---
test("salary entry appears as to_confirm when no amount declared", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: {},
    knownFacts: [],
  });

  const section = result.sections.find((s) => s.id === "revenus_activite");
  assert.ok(section, "should have revenus_activite section");

  const entry = section.entries.find((e) => e.id === "salary_net_d1");
  assert.ok(entry, "should have salary_net_d1 entry");
  assert.equal(entry.status, "to_confirm");
  assert.equal(entry.value, null);
  assert.ok(entry.caseCode === "1AJ");
  assert.equal(result.draftStatus, "incomplete");
});

// --- salary avec montant → confirmed ---
test("salary entry is confirmed when amount is declared", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 35000 },
    knownFacts: [],
  });

  const section = result.sections.find((s) => s.id === "revenus_activite");
  const entry = section!.entries.find((e) => e.id === "salary_net_d1");
  assert.ok(entry);
  assert.equal(entry.status, "confirmed");
  assert.equal(entry.value, 35000);
  assert.equal(result.draftStatus, "complete");
});

// --- charge donations déclenche la section charges ---
test("donations charge triggers charges_deductions section", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      ...baseProfile,
      charges: ["donations"],
      donationContexts: ["general_interest"],
    },
    declaredAmounts: { salary: 35000, donations: 200 },
    knownFacts: [],
  });

  const section = result.sections.find((s) => s.id === "charges_deductions");
  assert.ok(section, "should have charges_deductions section");

  const entry = section.entries.find((e) => e.id === "donations");
  assert.ok(entry, "should have donations entry");
  assert.equal(entry.caseCode, "7UF");
  assert.equal(entry.value, 200);
  assert.equal(entry.status, "confirmed");
});

// --- charge sans montant → pointsToConfirm renseigné ---
test("missing amount for triggered charge appears in pointsToConfirm", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      ...baseProfile,
      charges: ["childcare"],
    },
    declaredAmounts: { salary: 30000 },
    knownFacts: [],
  });

  assert.ok(
    result.pointsToConfirm.some((p) => p.includes("7GA")),
    "should mention case 7GA in pointsToConfirm"
  );
  assert.equal(result.draftStatus, "incomplete");
});

// --- incomeType non présent ne déclenche pas d'entrée ---
test("pension entry is absent when income type is only salary", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 40000 },
    knownFacts: [],
  });

  const allEntries = result.sections.flatMap((s) => s.entries);
  const pension = allEntries.find((e) => e.id === "pension_retraite_d1");
  assert.equal(pension, undefined);
});

// --- ordre des sections respecte sectionOrder ---
test("sections are ordered according to sectionOrder", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: {
      ...baseProfile,
      incomeTypes: ["salary", "bank_interest"],
      charges: ["donations"],
      donationContexts: ["general_interest"],
    },
    declaredAmounts: { salary: 30000, bank_interest: 500, donations: 100 },
    knownFacts: [],
  });

  const sectionIds = result.sections.map((s) => s.id);
  const revenus = sectionIds.indexOf("revenus_activite");
  const capitaux = sectionIds.indexOf("revenus_capitaux");
  const charges = sectionIds.indexOf("charges_deductions");

  assert.ok(revenus < capitaux, "revenus_activite should come before revenus_capitaux");
  assert.ok(capitaux < charges, "revenus_capitaux should come before charges_deductions");
});

// --- profileSummary reflète la qualification ---
test("profileSummary reflects qualification result", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    profileSnapshot: baseProfile,
    declaredAmounts: { salary: 30000 },
    knownFacts: [],
  });

  assert.equal(result.profileSummary.complexity, "simple");
  assert.equal(result.profileSummary.mvpDecision, "supported");
  assert.ok(Array.isArray(result.profileSummary.detectedTopics));
});

// --- validateInput rejette un profil invalide ---
test("validateInput rejects invalid profileSnapshot", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({
    profileSnapshot: { householdStatus: "invalid", dependentsCount: 0, incomeTypes: ["salary"] },
  });
  assert.equal(result.success, false);
});

// --- validateInput accepte input minimal avec defaults ---
test("validateInput accepts minimal input and applies defaults", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({ profileSnapshot: baseProfile });
  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.declaredAmounts, {});
    assert.deepEqual(result.data.knownFacts, []);
  }
});

// --- draftStatus complete uniquement quand tous les montants sont renseignés ---
test("draftStatus is complete only when all triggered amounts are declared", () => {
  const useCase = createUseCase();

  const incomplete = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["salary", "bank_interest"] },
    declaredAmounts: { salary: 30000 },
    knownFacts: [],
  });
  assert.equal(incomplete.draftStatus, "incomplete");

  const complete = useCase.execute({
    profileSnapshot: { ...baseProfile, incomeTypes: ["salary", "bank_interest"] },
    declaredAmounts: { salary: 30000, bank_interest: 800 },
    knownFacts: [],
  });
  assert.equal(complete.draftStatus, "complete");
});
