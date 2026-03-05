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

## 9) Iteration 2 (Holy Quartet / Share / Methodology)
- Confirm `Holy Quartet` results strip is visible above charts on Dashboard.
- Move `Pick age` in the strip and confirm scrubber/chart context updates to same age.
- Confirm mini-bar shows Guaranteed | Net withdrawal | Tax wedge.
- Confirm support moment card appears at first aha event and `Not now` hides it.
- Confirm `Copy share link`, `Copy minimal link`, and `Copy summary` work.
- Open a `?share=` link and confirm `Loaded shared scenario` banner appears without auto-overwrite.
- Click `Apply to my plan` and confirm plan updates and banner clears.
- Open `Methodology` tab and confirm sections + reference links render.

## 10) Iteration 3 (Gap / Score / Timing / Meltdown)
- Confirm `Retirement Gap` headline appears above charts and updates with age picker.
- Confirm edge-state text:
  - Surplus when guaranteed income exceeds spending.
  - Depletion warning when depletion age exists.
- Confirm `Why gross withdrawal > what you spend` mini bar renders with visible tax wedge.
- Toggle `Show gross withdrawals` and confirm coverage chart tax segment behavior changes.
- Confirm `Retirement Coverage Score` module renders total + sub-scores + method details.
- In `CPP & OAS Start Age Simulator`, change ages and confirm deltas update.
- Click `Apply timing` and confirm CPP/OAS start ages update in plan.
- In `RRSP Meltdown Strategy`, enable + set amount/range and confirm before/after deltas update.
- Confirm existing exports/imports/demo/reset still function and app reloads cleanly.
