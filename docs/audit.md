# Canadian Retirement Planner Audit (Pre-Rebuild)

## What Is Confusing Today

- The dashboard mixed long-horizon portfolio scale with annual income/spending context in adjacent sections, which made the income story harder to follow.
- Users could reach advanced tax/withdrawal concepts before understanding the base retirement cashflow narrative (guaranteed income -> net gap -> gross taxable withdrawal).
- Guided setup was short (5 steps) and jumped quickly from basics to advanced controls.
- RRIF minimum withdrawals were referenced educationally but not clearly modeled and surfaced in year-by-year dashboard outputs.
- OAS clawback was available in advanced strategy mode, but users had limited visibility of clawback impact in the main retirement-year story.
- Advanced controls were broad and powerful, but a dedicated intermediate “Plan Inputs” layer was missing.

## Feature Inventory (Must Keep)

All features below are preserved in the rebuilt IA:

- Local-first plan persistence in LocalStorage (`retirementPlanner.plan.v2`), JSON export/import, demo load, reset.
- First-run landing with Start simple / Demo / Import.
- Guided wizard flow and rerunnable setup.
- Dashboard projection chart with optional stress band.
- Deterministic scenarios (best/base/worst).
- Stress matrix view.
- Province-aware planning tax model (federal + provincial brackets, NL default).
- Pension, CPP, OAS inputs with timing adjustments.
- Spousal income toggles/inputs.
- OAS clawback modeling toggle.
- Withdrawal strategy comparison (tax-smart, RRSP-first, TFSA-first).
- Accounts + capital injection inputs.
- Notes panel.
- Reusable tooltip system and glossary modal.
- Official reference links.

## Assumption Inventory (Must Keep)

- Return assumptions by risk profile (conservative/balanced/aggressive) and user-editable rates.
- Inflation-based spending growth and optional tax-bracket inflation.
- Deterministic stress/scenario mechanics (return/inflation shifts).
- Province-specific progressive tax estimate (planning level).
- CPP/OAS timing adjustment factors.
- OAS clawback estimate using planning threshold and 15% recovery rate.
- Gross-up withdrawal logic for taxable withdrawals.
- Capital injections at selected ages.
- Registered-account dominant retirement draw modeling for dashboard narrative.
- Strategy-based account order comparisons in Advanced mode.

## Rebuild Mapping (Old -> New IA)

- **Landing**: unchanged concept, clearer quick-start trust copy.
- **Guided setup**: expanded to 7 progressive steps:
  1. Timeline
  2. Spending target
  3. Savings
  4. Guaranteed income
  5. Reality check (coverage + gap)
  6. Taxes/withdrawal intro (gross vs net, clawback, RRIF controls)
  7. Advanced unlock actions
- **Dashboard**: rebuilt around one clear narrative:
  - At-a-glance KPIs
  - Portfolio balance chart (scale-safe)
  - Income coverage + tax wedge chart
  - Explain-it strip
  - Key age cards (retirement year, 65, 71)
- **Plan Inputs (new intermediate layer)**: dedicated basics panel for core assumptions.
- **Advanced**: all existing capabilities retained and reorganized; added explicit RRIF rules section with schedule table.
- **Stress / Notes / Export-Import**: preserved and exposed in top-level nav.

## What Was Redesigned

- Information architecture: added intermediate “Plan Inputs” and explicit Export/Import top-level section.
- Dashboard storytelling: separated portfolio scale from income/tax wedge scale; added age scrubber and clear educational strip.
- Modeling visibility: surfaced OAS clawback and RRIF minimum effects in key-year cards and tax drag narrative.
- Progressive disclosure: advanced concepts moved later in guided flow and unlocked intentionally.
