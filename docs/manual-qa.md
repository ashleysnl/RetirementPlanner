# Manual QA Checklist

## Startup reliability
- Fresh load: no startup issue text shown.
- View source: no hardcoded startup failure banner text.
- Private window load works.
- iPhone Safari load works.

## Dashboard clarity
- Retirement Insight sentence appears above charts.
- Retirement Gap summary updates with age picker.
- Tax wedge is clearly visible in coverage chart and gross-vs-net card.
- High tax drag badge appears when tax wedge is large.
- Retirement Timeline markers render and clicking a marker updates selected age.
- Key Retirement Risks module shows Low/Medium/High rows with action buttons.
- Plan Health Score shows 0-100 plus five sub-scores (coverage, longevity, tax drag, clawback, RRIF shock).

## Change explanations
- Apply CPP/OAS timing preview and confirm What changed panel appears.
- Undo last change restores previous plan.
- Dismiss hides the panel.
- What changed includes clawback, gross withdrawal, tax wedge, RRIF minimum at 71, coverage delta, and depletion delta.

## Scenario compare
- Open Compare scenarios modal.
- Save current as scenario.
- Rename and delete saved scenario.
- Table shows Base and strategy variants.

## Printable summary
- Open Download retirement summary.
- Print/Save PDF works.
- Copy summary text works.

## SEO preset pages
- `oas-clawback-calculator.html` loads with title/meta and CTA links.
- `rrif-withdrawal-calculator.html` loads with title/meta and CTA links.
- Opening `index.html?preset=oas-clawback` shows preset banner and does not auto-overwrite plan.
- Opening `index.html?preset=rrif-withdrawal` shows preset banner and Apply works.

## Regression checks
- Export/import/demo/reset still work.
- Stress table still renders.
- Learn/Glossary/Methodology pages still render.
