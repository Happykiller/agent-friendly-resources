# Lot 1 - Validation manuelle (simulateur officiel)

Date: 2026-04-06
Objectif: valider manuellement 5 cas representatifs pour `compare_tax_options` avant passage du lot 1 en `DONE`.

## Protocole de verification

1. Fixer les memes hypotheses dans les deux environnements (annee revenus, foyer, montants).
2. Obtenir le resultat du tool `compare_tax_options`.
3. Rejouer le cas sur le simulateur officiel DGFiP (ou parcours de reference equivalent).
4. Noter: recommendation, ecart chiffre, warnings attendus/non attendus.
5. Si ecart materiel: classer `A_CORRIGER` et ouvrir action corrective.

## Cas M1 - PFU vs bareme (dividendes eligibles, TMI 11%)

- Arbitrage: `pfu_vs_bareme`
- Entree:
  - householdStatus: `celibataire`
  - dependentsCount: `0`
  - incomeYear: `2025`
  - estimatedTmi: `0.11`
  - capitalIncome: `{ interests: 0, dividends: 10000, eligibleDividendsAmount: 10000, deductibleFees: 0 }`
- Attendu metier:
  - tendance recommendation: `option_b` (bareme) ou quasi-neutral selon parametrage simulateur
  - warning present: option 2OP globale

## Cas M2 - PFU vs bareme (interets purs, TMI 30%)

- Arbitrage: `pfu_vs_bareme`
- Entree:
  - householdStatus: `celibataire`
  - dependentsCount: `0`
  - incomeYear: `2025`
  - estimatedTmi: `0.30`
  - capitalIncome: `{ interests: 10000, dividends: 0, deductibleFees: 0 }`
- Attendu metier:
  - recommendation: `option_a` (PFU)
  - justification: interets sans abattement 40% au bareme

## Cas M3 - Frais reels vs 10% (couple, verification "par declarant")

- Arbitrage: `real_expenses_vs_10pct`
- Entree:
  - householdStatus: `marie_pacse`
  - dependentsCount: `0`
  - salary: `{ grossAnnual: 60000, taxableAnnual: 60000 }`
  - realExpenses: `{ totalAmount: 7000 }`
- Attendu metier:
  - recommendation probable: `option_b` (frais reels)
  - warning present: choix a verifier par declarant (pas uniquement agrege foyer)

## Cas M4 - Micro-foncier vs reel (charges elevees)

- Arbitrage: `micro_vs_real_rental`
- Entree:
  - householdStatus: `celibataire`
  - dependentsCount: `0`
  - rentalIncome: `{ grossRevenue: 12000, totalCharges: 5000 }`
- Attendu metier:
  - recommendation: `option_b` (reel)
  - warning present: seuil 30% = heuristique, verification 2044 conseillee

## Cas M5 - Rattachement vs pension (TMI elevee)

- Arbitrage: `child_attachment_vs_detachment`
- Entree:
  - householdStatus: `celibataire`
  - dependentsCount: `1`
  - estimatedTmi: `0.41`
  - adultChild: `{ childAge: 19, pensionPaidAmount: 6674 }`
- Attendu metier:
  - recommendation: souvent `option_b` (detachement + pension)
  - warning present: validation foyer complete necessaire (plafonnement QF)

## Grille de resultat a remplir

Pour chaque cas (M1..M5):
- Resultat tool: recommendation + optionA/optionB + difference
- Resultat simulateur: option la plus favorable + ecart estime
- Verdict: `OK` | `A_CORRIGER`
- Notes: cause d'ecart (arrondis, hypothese TMI, non prise en compte globale, etc.)
