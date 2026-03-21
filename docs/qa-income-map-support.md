# QA Checklist: Income Map + Support Moments

## Income Map rendering
- Dashboard shows `Retirement Income Map` directly below Retirement Insight and support card region.
- Chart renders on desktop and iPhone Safari.
- Bars show Pension, CPP, OAS, RRSP/RRIF, and Tax wedge.
- Spending target line overlays correctly.
- Toggle `Show withdrawals as gross` updates chart/table values.
- Toggle `Highlight key ages` shows/hides key-age marker references.
- Start age + window sliders update displayed range.
- `View as table` values match chart values for visible years.

## Income Map interactions
- Hover tooltip shows full year breakdown and coverage %.
- Clicking a bar updates selected age used by dashboard insight modules.
- Key-age markers reflect plan settings (Pension/CPP/OAS/RRIF start).

## Support card triggers
- Appears after guided setup completion (first time).
- Appears first time gross-up is non-zero.
- Appears first time clawback is non-zero.
- Appears after opening/printing retirement summary.
- Displays between Retirement Insight and Income Map.

## Support card controls
- `Not now` dismisses and starts 14-day cooldown.
- `I supported` suppresses future support prompts.
- Card does not show more than once per session.
- After 3 dismissals total, auto-prompts stop.

## Regression checks
- Export/import/demo/reset still function.
- OAS clawback, RRIF minimums, tax-aware withdrawals, and scenarios still compute.
- Works offline after service worker cache refresh.
