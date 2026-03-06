# QA Checklist: Phases, Peak Tax, Strategy Presets, Scenario Sharing, SEO Pages

## Income Map phases
- Income Map shows phase chips when applicable: Early Retirement, CPP + OAS Phase, RRIF Minimum Phase.
- Clicking a phase chip moves selected age to phase start.
- Phase labels are visible on chart background in desktop view.
- In table mode, each age row includes a phase label.

## Peak Tax Year
- Peak Tax Year card appears near At a glance.
- Displays age, total tax, cause, federal/provincial split, clawback.
- "Try strategies to reduce this" scrolls to Strategies to explore section.

## Strategies to explore
- Four strategy cards appear:
  - Delay CPP to 70
  - Try RRSP meltdown
  - Reduce retirement spending by 10%
  - Retire 2 years later
- Preview strategy shows What changed? deltas.
- Apply commits preview and Undo preview clears pending preview.

## Scenario share links
- Share section includes:
  - Share this scenario
  - Copy scenario summary
- Shared scenario banner includes Preview, Apply, Dismiss.
- Scenario compare table saved rows include Preview and Share actions.
- Copy/clipboard works on desktop + iPhone Safari fallback path.

## SEO pages
- New pages load with title/meta/canonical/og tags:
  - cpp-timing-calculator-canada.html
  - rrsp-withdrawal-strategy-canada.html
  - retirement-tax-calculator-canada.html
  - rrif-minimum-withdrawal-calculator.html
  - canadian-retirement-income-calculator.html
- Each page has CTA to open calculator with preset.
- Preset banner appears and apply requires confirmation when plan exists.

## Regression checks
- Guided setup, dashboard, advanced, tools, learn, methodology still render.
- Compare scenarios, print summary, export/import/demo/reset still work.
- Local-first persistence remains intact after reload.
