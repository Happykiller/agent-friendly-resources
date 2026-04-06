import test from "node:test";
import assert from "node:assert/strict";
import { JsonDbAdapter } from "../../../adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "../../../adapters/db/qualify-tool.repository.json.js";
import { CompareTaxOptionsUseCase } from "./compare-tax-options.usecase.js";

function createUseCase() {
  const db = new JsonDbAdapter();
  const repository = new JsonQualifyToolRepository(db);
  return new CompareTaxOptionsUseCase(repository);
}

test("validateInput accepte un payload minimal valide", () => {
  const useCase = createUseCase();
  const result = useCase.validateInput({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["salary"],
  });

  assert.equal(result.success, true);
});

test("PFU vs bareme retourne insufficient_data sans TMI", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends", "bank_interest"],
    capitalIncome: { interests: 1000, dividends: 4000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.equal(result.comparisons.length, 1);
  assert.equal(result.comparisons[0].recommendation, "insufficient_data");
  assert.ok(result.comparisons[0].missingData.includes("estimatedTmi"));
});

test("PFU vs bareme compare selon incomeYear 2025", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0.3,
    incomeYear: "2025",
    capitalIncome: { interests: 0, dividends: 5000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  const comparison = result.comparisons[0];
  assert.equal(comparison.optionA.amount, 1500);
  assert.equal(comparison.optionB.amount, 1760);
  assert.equal(comparison.recommendation, "option_a");
});

test("frais reels vs 10% recommande frais reels si deduction plus elevee", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    salary: { grossAnnual: 30000, taxableAnnual: 30000 },
    realExpenses: { totalAmount: 4000 },
    requestedArbitrages: ["real_expenses_vs_10pct"],
  });

  const comparison = result.comparisons[0];
  assert.equal(comparison.optionA.amount, 3000);
  assert.equal(comparison.optionB.amount, 4000);
  assert.equal(comparison.recommendation, "option_b");
});

test("micro vs reel: micro non eligible si recettes > 15k (warning)", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["rental_income"],
    rentalIncome: { grossRevenue: 16000, totalCharges: 2000 },
    requestedArbitrages: ["micro_vs_real_rental"],
  });

  const comparison = result.comparisons[0];
  assert.ok(comparison.warnings.some((w) => w.toLowerCase().includes("non eligible")));
  assert.equal(comparison.recommendation, "option_b");
});

test("rattachement vs detachement: insufficient_data si enfant mineur", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 1,
    incomeTypes: ["none"],
    estimatedTmi: 0.3,
    adultChild: { childAge: 17, pensionPaidAmount: 6000 },
    requestedArbitrages: ["child_attachment_vs_detachment"],
  });

  const comparison = result.comparisons[0];
  assert.equal(comparison.recommendation, "insufficient_data");
});

// PFU vs bareme (5)
test("pfu_vs_bareme: TMI 0% et dividendes 5000 -> bareme favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0,
    capitalIncome: { interests: 0, dividends: 5000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_b");
});

test("pfu_vs_bareme: TMI 30% et dividendes 5000 -> PFU favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0.3,
    capitalIncome: { interests: 0, dividends: 5000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_a");
});

test("pfu_vs_bareme: TMI 11%, dividendes 10000, interets 2000 -> bareme favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends", "bank_interest"],
    estimatedTmi: 0.11,
    capitalIncome: { interests: 2000, dividends: 10000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_b");
});

test("pfu_vs_bareme: TMI 41% et dividendes 2000 -> PFU favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0.41,
    capitalIncome: { interests: 0, dividends: 2000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_a");
});

test("pfu_vs_bareme: pas de RCM -> insufficient_data", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.equal(result.comparisons[0].recommendation, "insufficient_data");
  assert.ok(result.comparisons[0].missingData.includes("capitalIncome"));
});

test("pfu_vs_bareme: dividendes non eligibles abaissent l'avantage bareme", () => {
  const useCase = createUseCase();
  const allEligible = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0.11,
    capitalIncome: { interests: 0, dividends: 10000, eligibleDividendsAmount: 10000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });
  const partialEligible = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0.11,
    capitalIncome: { interests: 0, dividends: 10000, eligibleDividendsAmount: 2000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.ok(
    partialEligible.comparisons[0].optionB.amount > allEligible.comparisons[0].optionB.amount,
    "moins de dividendes eligibles doit augmenter l'impot bareme"
  );
});

test("pfu_vs_bareme: frais deductibles 2CA reduisent l'impot bareme", () => {
  const useCase = createUseCase();
  const withoutFees = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends", "bank_interest"],
    estimatedTmi: 0.3,
    capitalIncome: { interests: 2000, dividends: 3000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });
  const withFees = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends", "bank_interest"],
    estimatedTmi: 0.3,
    capitalIncome: { interests: 2000, dividends: 3000, deductibleFees: 1000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.ok(
    withFees.comparisons[0].optionB.amount < withoutFees.comparisons[0].optionB.amount,
    "les frais deductibles doivent diminuer l'impot bareme"
  );
});

test("pfu_vs_bareme: option includeDeferredCsgBenefit reduit la branche bareme", () => {
  const useCase = createUseCase();
  const immediateOnly = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0.3,
    capitalIncome: { interests: 0, dividends: 5000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });
  const withDeferredCsg = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["dividends"],
    estimatedTmi: 0.3,
    includeDeferredCsgBenefit: true,
    capitalIncome: { interests: 0, dividends: 5000 },
    requestedArbitrages: ["pfu_vs_bareme"],
  });

  assert.ok(withDeferredCsg.comparisons[0].optionB.amount < immediateOnly.comparisons[0].optionB.amount);
  assert.ok(
    withDeferredCsg.comparisons[0].warnings.some((w) => w.includes("global_recompute_required"))
  );
});

// Frais reels vs 10% (5)
test("real_expenses_vs_10pct: salaire 30000, frais 2000 -> 10% favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    salary: { grossAnnual: 30000, taxableAnnual: 30000 },
    realExpenses: { totalAmount: 2000 },
    requestedArbitrages: ["real_expenses_vs_10pct"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_a");
});

test("real_expenses_vs_10pct: salaire 5000, frais 400 -> plancher 509 favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    salary: { grossAnnual: 5000, taxableAnnual: 5000 },
    realExpenses: { totalAmount: 400 },
    requestedArbitrages: ["real_expenses_vs_10pct"],
  });

  assert.equal(result.comparisons[0].optionA.amount, 509);
  assert.equal(result.comparisons[0].recommendation, "option_a");
});

test("real_expenses_vs_10pct: salaire 150000, frais 16000 -> frais reels favorables", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    salary: { grossAnnual: 150000, taxableAnnual: 150000 },
    realExpenses: { totalAmount: 16000 },
    requestedArbitrages: ["real_expenses_vs_10pct"],
  });

  assert.equal(result.comparisons[0].optionA.amount, 14555);
  assert.equal(result.comparisons[0].recommendation, "option_b");
});

test("real_expenses_vs_10pct: pas de salaire -> insufficient_data", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["none"],
    realExpenses: { totalAmount: 1000 },
    requestedArbitrages: ["real_expenses_vs_10pct"],
  });

  assert.equal(result.comparisons[0].recommendation, "insufficient_data");
  assert.ok(result.comparisons[0].missingData.includes("salary"));
});

test("real_expenses_vs_10pct: couple -> warning choix par declarant", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "marie_pacse",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    salary: { grossAnnual: 50000, taxableAnnual: 50000 },
    realExpenses: { totalAmount: 6000 },
    requestedArbitrages: ["real_expenses_vs_10pct"],
  });

  assert.ok(
    result.comparisons[0].warnings.some((w) => w.toLowerCase().includes("par declarant"))
  );
});

// Micro vs reel foncier (5)
test("micro_vs_real_rental: loyers 12000, charges 5000 -> reel favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["rental_income"],
    rentalIncome: { grossRevenue: 12000, totalCharges: 5000 },
    requestedArbitrages: ["micro_vs_real_rental"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_b");
});

test("micro_vs_real_rental: loyers 12000, charges 2000 -> micro favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["rental_income"],
    rentalIncome: { grossRevenue: 12000, totalCharges: 2000 },
    requestedArbitrages: ["micro_vs_real_rental"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_a");
});

test("micro_vs_real_rental: loyers 12000, charges 3600 -> neutral", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["rental_income"],
    rentalIncome: { grossRevenue: 12000, totalCharges: 3600 },
    requestedArbitrages: ["micro_vs_real_rental"],
  });

  assert.equal(result.comparisons[0].recommendation, "neutral");
  assert.ok(result.comparisons[0].warnings.some((w) => w.toLowerCase().includes("heuristique")));
});

test("micro_vs_real_rental: pas de revenus fonciers -> insufficient_data", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 0,
    incomeTypes: ["salary"],
    requestedArbitrages: ["micro_vs_real_rental"],
  });

  assert.equal(result.comparisons[0].recommendation, "insufficient_data");
});

// Rattachement enfant majeur (5)
test("child_attachment_vs_detachment: TMI 30%, pension 6000 -> rattachement favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 1,
    incomeTypes: ["none"],
    estimatedTmi: 0.3,
    adultChild: { childAge: 20, pensionPaidAmount: 6000 },
    requestedArbitrages: ["child_attachment_vs_detachment"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_a");
});

test("child_attachment_vs_detachment: TMI 11%, pension 1000 -> rattachement favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 1,
    incomeTypes: ["none"],
    estimatedTmi: 0.11,
    adultChild: { childAge: 19, pensionPaidAmount: 1000 },
    requestedArbitrages: ["child_attachment_vs_detachment"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_a");
});

test("child_attachment_vs_detachment: TMI 41%, pension 6674 -> pension favorable", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 1,
    incomeTypes: ["none"],
    estimatedTmi: 0.41,
    adultChild: { childAge: 19, pensionPaidAmount: 6674 },
    requestedArbitrages: ["child_attachment_vs_detachment"],
  });

  assert.equal(result.comparisons[0].recommendation, "option_b");
});

test("child_attachment_vs_detachment: donnees manquantes -> insufficient_data", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 1,
    incomeTypes: ["none"],
    adultChild: { childAge: 19 },
    requestedArbitrages: ["child_attachment_vs_detachment"],
  });

  assert.equal(result.comparisons[0].recommendation, "insufficient_data");
  assert.ok(result.comparisons[0].missingData.includes("estimatedTmi"));
  assert.ok(result.comparisons[0].missingData.includes("adultChild.pensionPaidAmount"));
});

test("child_attachment_vs_detachment: gain rattachement fourni prioritaire", () => {
  const useCase = createUseCase();
  const result = useCase.execute({
    householdStatus: "celibataire",
    dependentsCount: 1,
    incomeTypes: ["none"],
    estimatedTmi: 0.41,
    adultChild: {
      childAge: 19,
      pensionPaidAmount: 6674,
      estimatedAttachmentTaxSaving: 4000,
    },
    requestedArbitrages: ["child_attachment_vs_detachment"],
  });

  assert.equal(result.comparisons[0].optionA.amount, 4000);
  assert.equal(result.comparisons[0].recommendation, "option_a");
});
