# Smoke Test Checklist

Run this after any JavaScript or view-layer change.

## 1) Startup
- Open `index.html` from local server.
- Confirm no startup error panel.
- Confirm landing CTA buttons respond.

## 2) Guided Setup
- Click `Start Simple Plan (60 seconds)`.
- Move through wizard steps 1-7.
- Confirm `Finish` unlocks Advanced Settings.
- Confirm numeric inputs are editable without sticky focus issues.

## 3) Dashboard
- Confirm KPI row renders and values update when age scrubber moves.
- Confirm projection chart renders with stress band toggle.
- Confirm coverage chart renders with table toggle.
- Confirm `Explain It` updates headline to selected age.
- Confirm tooltips open/close correctly (click + Escape).

## 4) Plan Inputs
- Open `Plan Inputs`.
- Edit province, retirement age, spending, inflation, contribution growth.
- Confirm values persist after section change.

## 5) Advanced Settings
- Enable `Show Advanced Controls`.
- Search in advanced search box and verify filtering.
- Toggle key controls: OAS clawback, RRIF minimums, spouse toggle.
- Confirm accordion sections do not collapse unexpectedly while editing.

## 6) Tools / Stress
- Confirm stress summary and table render.
- Confirm notes are editable and persist.

## 7) Storage + Data
- `Save plan` downloads JSON.
- `Load plan` imports valid JSON.
- `Load Demo` works.
- `Reset` returns defaults.
- Refresh page and confirm auto-persisted state.

## 8) Mobile (iOS Safari + Home Screen)
- Confirm bottom tabs stay fixed at bottom.
- Confirm desktop sidebar/tabs do not overlay content.
- Confirm support button is clickable.
- Confirm tooltip popovers are visible and centered on mobile.
