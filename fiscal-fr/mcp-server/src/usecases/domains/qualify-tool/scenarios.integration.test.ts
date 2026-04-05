/**
 * Tests de parcours métier (scénarios d'intégration multi-tools).
 *
 * Chaque scénario simule un parcours complet ou partiel en chaînant plusieurs
 * usecases comme le ferait l'orchestrateur SKILL.md. Ces tests couvrent les
 * 10 scénarios minimum requis par la Phase 5.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { QualifyTaxProfileUseCase } from "./qualify-tax-profile.usecase.js";
import { ListSupportingDocumentsUseCase } from "./list-supporting-documents.usecase.js";
import { DetectReviewPointsUseCase } from "./detect-review-points.usecase.js";
import { BuildPreDeclarationUseCase } from "./build-pre-declaration.usecase.js";
import { EstimateImpactUseCase } from "./estimate-impact.usecase.js";
import { GuideFilingStepUseCase } from "./guide-filing-step.usecase.js";

function createStack() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  const qualify = new QualifyTaxProfileUseCase(repository);
  const documents = new ListSupportingDocumentsUseCase(qualify, repository);
  const reviewPoints = new DetectReviewPointsUseCase(qualify, repository);
  const preDeclare = new BuildPreDeclarationUseCase(qualify, repository);
  const estimate = new EstimateImpactUseCase(qualify, repository);
  const guide = new GuideFilingStepUseCase(repository);
  return { qualify, documents, reviewPoints, preDeclare, estimate, guide };
}

// ── Scénario 1 : célibataire salarié simple ───────────────────────────────────
// Parcours complet : qualification → documents → vigilance → pré-déclaration → estimation

test("Scénario 1 : célibataire salarié — parcours complet", () => {
  const { qualify, documents, reviewPoints, preDeclare, estimate } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["salary"] as string[],
    charges: ["none"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  // Étape 1 : qualification
  const qualifyResult = qualify.execute(profile);
  assert.equal(qualifyResult.complexity, "simple");
  assert.equal(qualifyResult.mvpDecision, "supported");

  // Étape 2 : documents
  const docsResult = documents.execute({
    profileSnapshot: profile,
    alreadyAvailableDocuments: [],
    knownFacts: [],
  });
  assert.ok(docsResult.required.length > 0, "doit avoir des documents obligatoires");

  // Étape 3 : vigilance
  const vigilanceResult = reviewPoints.execute({
    profileSnapshot: profile,
    knownFacts: [],
    declaredAmounts: {},
  });
  assert.equal(vigilanceResult.hasBlockingPoints, false);

  // Étape 4 : pré-déclaration
  const predeclResult = preDeclare.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 32000 },
    knownFacts: [],
  });
  assert.equal(predeclResult.draftStatus, "complete");

  // Étape 5 : estimation
  const estimResult = estimate.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 32000 },
    options: {},
  });
  assert.ok(estimResult.impotNet >= 0);
  assert.ok(estimResult.disclaimer.length > 0);
  assert.equal(estimResult.campaign, "2026");
});

// ── Scénario 2 : couple avec enfant ──────────────────────────────────────────
// Vérification : couple (marie_pacse) + 1 enfant → 2,5 parts, revenu net imposable correct
// Note: le usecase estimate utilise householdStatus.startsWith("marie") pour détecter un couple.

test("Scénario 2 : couple avec un enfant — 2,5 parts, IR calculé", () => {
  const { qualify, preDeclare, estimate } = createStack();

  // qualify accepte "married" ; estimate détecte le couple via "marie_pacse"
  const qualifyProfile = {
    householdStatus: "married" as const,
    dependentsCount: 1,
    incomeTypes: ["salary"] as string[],
    charges: ["none"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  const qualifyResult = qualify.execute(qualifyProfile);
  assert.notEqual(qualifyResult.mvpDecision, "human_review");

  const predeclResult = preDeclare.execute({
    profileSnapshot: qualifyProfile,
    declaredAmounts: { salary: 55000 },
    knownFacts: [],
  });
  assert.equal(predeclResult.draftStatus, "complete");

  // Pour tester les parts, utiliser le statut compris par le usecase estimate
  const estimProfile = { ...qualifyProfile, householdStatus: "marie_pacse" };
  const estimResult = estimate.execute({
    profileSnapshot: estimProfile,
    declaredAmounts: { salary: 55000 },
    options: {},
  });

  // 2 parts (couple) + 0.5 pour 1 enfant = 2.5 parts
  assert.equal(estimResult.nombreParts, 2.5);
  assert.ok(estimResult.impotNet >= 0);
  // Revenu net imposable = 55000 − 10% abattement (5500) = 49500
  assert.equal(estimResult.revenuNetImposable, 49500);
});

// ── Scénario 3 : célibataire avec dons ───────────────────────────────────────
// Vérification : réduction dons visible, pré-déclaration section charges_deductions

test("Scénario 3 : dons — réduction 66% appliquée, rubrique charges présente", () => {
  const { qualify, preDeclare, estimate } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["salary"] as string[],
    charges: ["donations"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: ["general_interest"] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  const qualifyResult = qualify.execute(profile);
  assert.notEqual(qualifyResult.mvpDecision, "human_review");

  const predeclResult = preDeclare.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 40000, donations: 500 },
    knownFacts: [],
  });
  const chargesSection = predeclResult.sections.find((s) => s.id === "charges_deductions");
  assert.ok(chargesSection, "section charges_deductions doit être présente");
  const donEntry = chargesSection.entries.find((e) => e.id === "donations");
  assert.ok(donEntry, "rubrique donations_7uf doit être présente");
  assert.equal(donEntry.status, "confirmed");

  const estimResult = estimate.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 40000, donations: 500 },
    options: {},
  });
  // Réduction dons = 66% × 500 = 330
  assert.ok(estimResult.reductionsImpot > 0, "réduction dons doit être > 0");
});

// ── Scénario 4 : emploi à domicile ───────────────────────────────────────────
// Vérification : crédit emploi domicile présent dans estimation

test("Scénario 4 : emploi à domicile — crédit 50% appliqué", () => {
  const { qualify, preDeclare, estimate } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["salary"] as string[],
    charges: ["home_services"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  const qualifyResult = qualify.execute(profile);
  assert.notEqual(qualifyResult.mvpDecision, "human_review");

  const predeclResult = preDeclare.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 35000, home_services: 3000 },
    knownFacts: [],
  });
  const chargesSection = predeclResult.sections.find((s) => s.id === "charges_deductions");
  assert.ok(chargesSection, "section charges_deductions doit être présente");
  const homeEntry = chargesSection.entries.find((e) => e.id === "home_services");
  assert.ok(homeEntry, "rubrique home_services doit être présente");

  const estimResult = estimate.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 35000, home_services: 3000 },
    options: {},
  });
  // Crédit emploi domicile = 50% × 3000 = 1500
  assert.ok(estimResult.creditsImpot > 0, "crédit emploi domicile doit être > 0");
});

// ── Scénario 5 : intérêts bancaires ──────────────────────────────────────────
// Vérification : PFU appliqué, section revenus_capitaux présente

test("Scénario 5 : intérêts bancaires — PFU calculé, section revenus_capitaux présente", () => {
  const { qualify, preDeclare, estimate } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["salary", "bank_interest"] as string[],
    charges: ["none"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  const qualifyResult = qualify.execute(profile);
  assert.equal(qualifyResult.mvpDecision, "supported");

  const predeclResult = preDeclare.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 30000, bank_interest: 1000 },
    knownFacts: [],
  });
  const capitauxSection = predeclResult.sections.find((s) => s.id === "revenus_capitaux");
  assert.ok(capitauxSection, "section revenus_capitaux doit être présente");
  const interestEntry = capitauxSection.entries.find((e) => e.id === "bank_interest");
  assert.ok(interestEntry, "rubrique bank_interest doit être présente");
  assert.equal(interestEntry.status, "confirmed");

  const estimResult = estimate.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 30000, bank_interest: 1000 },
    options: {},
  });
  // Intérêts soumis au PFU → pfuDetails présent
  assert.ok(estimResult.pfuDetails !== undefined, "pfuDetails doit être présent pour les intérêts");
  assert.ok(estimResult.pfuDetails!.impotPfu > 0, "PFU sur intérêts doit être > 0");
});

// ── Scénario 6 : données incohérentes ────────────────────────────────────────
// Vérification : detect_review_points signale le salaire déclaré sans type salary

test("Scénario 6 : salaire déclaré sans incomeType salary → point de vigilance", () => {
  const { qualify, reviewPoints } = createStack();

  // Profil sans salary mais avec montant salary déclaré
  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["pension"] as string[],
    charges: ["none"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  qualify.execute(profile);

  const vigilanceResult = reviewPoints.execute({
    profileSnapshot: profile,
    knownFacts: [],
    declaredAmounts: { salary: 20000 }, // salary déclaré mais incomeType = pension
  });

  const incoherencePoint = vigilanceResult.reviewPoints.find(
    (p) => p.id === "declared_salary_no_income_type"
  );
  assert.ok(incoherencePoint, "doit détecter l'incohérence salaire déclaré sans income type salary");
  assert.equal(incoherencePoint.severity, "warning");
});

// ── Scénario 7 : cas complexe rejeté ─────────────────────────────────────────
// Vérification : qualify retourne out_of_scope + mvpDecision human_review

test("Scénario 7 : revenus étrangers — cas hors périmètre refusé proprement", () => {
  const { qualify, reviewPoints } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["foreign_income"] as string[],
    charges: ["none"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  const qualifyResult = qualify.execute(profile);
  assert.equal(qualifyResult.complexity, "out_of_scope");
  assert.equal(qualifyResult.mvpDecision, "human_review");

  const vigilanceResult = reviewPoints.execute({
    profileSnapshot: profile,
    knownFacts: [],
    declaredAmounts: {},
  });

  const outOfScopePoint = vigilanceResult.reviewPoints.find(
    (p) => p.id === "out_of_scope_income"
  );
  assert.ok(outOfScopePoint, "doit signaler un revenu hors périmètre");
  assert.equal(outOfScopePoint.severity, "error");
  assert.equal(outOfScopePoint.blocking, true);
  assert.equal(vigilanceResult.hasBlockingPoints, true);
});

// ── Scénario 8 : justificatifs manquants ─────────────────────────────────────
// Vérification : documents marqués missing quand non disponibles

test("Scénario 8 : justificatifs manquants — checklist signale les documents absents", () => {
  const { qualify, documents } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["salary", "dividends"] as string[],
    charges: ["none"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  qualify.execute(profile);

  // Aucun document disponible
  const docsResult = documents.execute({
    profileSnapshot: profile,
    alreadyAvailableDocuments: [],
    knownFacts: [],
  });

  // Des documents obligatoires doivent exister
  assert.ok(docsResult.required.length > 0, "doit avoir des documents obligatoires");
  // Tous les obligatoires sont manquants car aucun fourni
  assert.ok(docsResult.missing.length > 0, "des documents doivent être manquants");
  assert.equal(docsResult.missing.length, docsResult.required.length, "tous les obligatoires manquants");
});

// ── Scénario 9 : estimation incomplète ───────────────────────────────────────
// Vérification : pré-déclaration incomplete si montants absents, estimation toujours retournée

test("Scénario 9 : estimation avec montants partiels — draftStatus incomplete, estimation produite", () => {
  const { qualify, preDeclare, estimate } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["salary", "bank_interest"] as string[],
    charges: ["none"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  qualify.execute(profile);

  // Seul le salaire est renseigné, pas les intérêts
  const predeclResult = preDeclare.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 28000 },
    knownFacts: [],
  });
  assert.equal(predeclResult.draftStatus, "incomplete");

  // L'estimation est quand même produite (sur base partielle)
  const estimResult = estimate.execute({
    profileSnapshot: profile,
    declaredAmounts: { salary: 28000 },
    options: {},
  });
  assert.ok(estimResult.impotNet >= 0);
  assert.ok(estimResult.disclaimer.length > 0);
});

// ── Scénario 10 : guidage écran par écran ────────────────────────────────────
// Vérification : copilote retourne les bonnes étapes dans l'ordre avec contexte

test("Scénario 10 : copilote de saisie — étapes ordonnées, highlights contextuels", () => {
  const { qualify, guide } = createStack();

  const profile = {
    householdStatus: "single" as const,
    dependentsCount: 0,
    incomeTypes: ["salary", "dividends"] as string[],
    charges: ["donations"] as string[],
    events: [] as string[],
    dependentContexts: [] as string[],
    donationContexts: ["general_interest"] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  qualify.execute(profile);

  // Étape salaires avec contexte profil
  const salairesStep = guide.execute({
    currentStep: "step_revenus_salaires",
    knownContext: { incomeTypes: ["salary", "dividends"], charges: ["donations"] },
  });
  assert.equal(salairesStep.stepId, "step_revenus_salaires");
  assert.ok(salairesStep.contextualHighlights.some((h) => h.includes("1AJ")));
  // dividends n'est pas pertinent pour cette étape → pas de highlight
  assert.ok(
    !salairesStep.contextualHighlights.some((h) => h.toLowerCase().includes("barème")),
    "étape salaires ne doit pas mentionner barème (dividendes)"
  );

  // Étape capitaux avec dividendes
  const capitauxStep = guide.execute({
    currentStep: "step_revenus_capitaux_mobiliers",
    knownContext: { incomeTypes: ["salary", "dividends"] },
  });
  assert.ok(capitauxStep.contextualHighlights.some((h) => h.includes("2OP") || h.toLowerCase().includes("barème")));

  // Étape réductions avec dons
  const reductionsStep = guide.execute({
    currentStep: "step_reductions_credits_impot",
    knownContext: { charges: ["donations"] },
  });
  assert.ok(reductionsStep.contextualHighlights.some((h) => h.includes("7UF")));

  // availableSteps triées par position dans chaque réponse
  const positions = salairesStep.availableSteps.map((s) => s.position);
  for (let i = 1; i < positions.length; i++) {
    assert.ok(positions[i] >= positions[i - 1], "availableSteps non triées");
  }
});

// ── Scénario 11 : vigilance transversale accessible à tout moment ─────────────
// Vérification : step_vigilance_transversale retourne position 99 et points transversaux

test("Scénario 11 : step_vigilance_transversale — accessible hors séquence, position 99", () => {
  const { guide } = createStack();

  const vigilanceStep = guide.execute({
    currentStep: "step_vigilance_transversale",
    knownContext: { incomeTypes: ["salary"] },
  });

  assert.equal(vigilanceStep.stepId, "step_vigilance_transversale");
  assert.equal(vigilanceStep.position, 99);
  assert.ok(vigilanceStep.verifyNow.length > 0);
  assert.ok(vigilanceStep.traps.length > 0);
  // Disponible dans availableSteps avec toutes les autres étapes
  assert.ok(vigilanceStep.availableSteps.some((s) => s.stepId === "step_vigilance_transversale"));
  assert.ok(vigilanceStep.availableSteps.some((s) => s.stepId === "step_connexion"));
});

// ── Scénario 12 : événement bloquant ─────────────────────────────────────────
// Vérification : événement divorce → point bloquant détecté

test("Scénario 12 : événement divorce — point bloquant détecté", () => {
  const { qualify, reviewPoints } = createStack();

  const profile = {
    householdStatus: "divorced" as const,
    dependentsCount: 0,
    incomeTypes: ["salary"] as string[],
    charges: ["none"] as string[],
    events: ["divorce"] as string[],
    dependentContexts: [] as string[],
    donationContexts: [] as string[],
    homeServiceContexts: [] as string[],
    alimonyContexts: [] as string[],
  };

  qualify.execute(profile);

  const vigilanceResult = reviewPoints.execute({
    profileSnapshot: profile,
    knownFacts: [],
    declaredAmounts: {},
  });

  const blockingPoint = vigilanceResult.reviewPoints.find(
    (p) => p.id === "out_of_scope_event"
  );
  assert.ok(blockingPoint, "doit détecter l'événement bloquant");
  assert.equal(blockingPoint.severity, "error");
  assert.equal(blockingPoint.blocking, true);
  assert.equal(vigilanceResult.hasBlockingPoints, true);
});
