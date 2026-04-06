# Lot 1 - Compare Tax Options - Research Notes

Date: 2026-04-06
Scope: arbitrages `pfu_vs_bareme`, `real_expenses_vs_10pct`, `micro_vs_real_rental`, `child_attachment_vs_detachment`.

## Decision rules (condensed)

### 1) PFU vs bareme (`pfu_vs_bareme`)
- PFU default for incomes perceived in 2025: 12.8% IR + 17.2% PS (total 30%) for interests/dividends.
- Option 2OP is global for RCM in scope; no line-by-line choice between PFU and bareme.
- Dividends under bareme can benefit from 40% allowance when eligible.
- Interests under bareme do not benefit from 40% allowance.
- Temporal rate handling is required:
  - income year 2025: 30% default on standard interests/dividends.
  - income year 2026+: use updated rates by income type when applicable.

### 2) Salary 10% allowance vs real expenses (`real_expenses_vs_10pct`)
- Option A: 10% allowance with floor/cap campaign parameters.
- Option B: declared real expenses total.
- Core comparison: if real expenses > allowance, option B is generally preferable.

### 3) Micro-foncier vs reel (`micro_vs_real_rental`)
- Micro-foncier eligibility bound by gross receipts threshold (15,000 EUR in current ruleset).
- Option A micro-foncier taxable base: gross x 70%.
- Option B reel taxable base: gross - deductible charges.
- If charges exceed 30% of gross, reel is generally preferable.
- If threshold exceeded, micro-foncier is not eligible.

### 4) Adult child attachment vs detachment + alimony (`child_attachment_vs_detachment`)
- Attachment and alimony deduction are mutually exclusive for the same child.
- Comparison requires scenario-level estimation:
  - attachment gain via quotient familial effect (capped effects apply),
  - detachment gain via deductible alimony (campaign cap applies).

## Case codes to track

- PFU/bareme: `2OP`, `2DC`, `2TR`, `2CK`, `2CA`.
- Real expenses salaries: `1AK`, `1BK`, `1CK`, `1DK`.
- Rental micro/reel: `4BE`, `4BA`, `4BB`, `4BC`, `2044`.
- Adult child/alimony: `6EL`, `6EM` (+ attachment related household fields per profile context).

## Exclusions and warnings

- `2OP` globality must always be surfaced in output warnings.
- Real expenses require proof; no detailed IK/meal engine in lot 1 (handled in lot 1b).
- Rental reel may imply multi-year commitment.
- Family arbitrage is sensitive to profile details; if missing, return insufficient data.

## Sources used

- CGI art. 200 A (PFU and option framework).
- CGI art. 158, 3-2 deg (40% allowance on eligible dividends).
- CGI art. 83 (professional expenses framework for salaries).
- CGI art. 156-II-2 deg (alimony deductibility framework).
- BOI-RPPM-RCM-30-20 (RCM and PFU framework).
- BOI-IR-BASE-10-10-10 (salary deductions / real expenses framework).
- BOI-RFPI-DECLA (rental declaration framework).
- Brochure pratique IR and official impots.gouv.fr references for campaign field mapping.

## Notes for implementation

- Keep deterministic logic in DB + code only; no rule invention in LLM layer.
- Preserve explicit separation between display labels and technical values/case codes.
- Keep temporal parameterization for PFU rates (`incomeYear` + rate set).
- Current implementation baseline is in `mcp-server/src/data/compare-tax-options.db.json` and must be updated if sources evolve.
