# Canadian Retirement Planner (GitHub Pages / Local-First)

A local-first, static retirement planning web app for Canadian users.

Features include:
- tax-aware retirement withdrawals (after-tax spending target)
- CPP / OAS timing estimates
- private pension + spouse pension/benefits inputs
- OAS clawback estimate (optional)
- outcome summary scorecard
- deterministic best/base/worst scenario table
- stress test matrix (returns x inflation)
- tax-smart withdrawal guidance (heuristic)
- suggested next steps (data-driven)
- JSON import/export + localStorage save

## Run Locally

No build step is required.

### Option 1 (simplest)
1. Open `index.html` directly in a browser.

### Option 2 (recommended for testing links/manifest)
1. Serve the folder with any static file server.
2. Example (Python):
   - `python3 -m http.server 8000`
3. Open `http://localhost:8000/`

## Deploy to GitHub Pages (Project Site)

This project is set up for a GitHub Pages project site at:
- `https://ashleysnl.github.io/RetirementPlanner/`

### Deploy steps
1. Push this folder to the `RetirementPlanner` repository.
2. In GitHub repo settings, enable GitHub Pages.
3. Set source to the branch/folder you use (commonly `main` / root).
4. Confirm the site loads at:
   - `https://ashleysnl.github.io/RetirementPlanner/`

## What Changed (Conversion + Product Upgrades)

### New conversion-focused results UX
- **Outcome Summary** scorecard with:
  - status badge (`On track`, `Close`, `Not on track`)
  - earliest retirement age that meets target spending (scan to age 70)
  - shortfall at target retirement age (after-tax)
  - guaranteed income coverage at retirement age and age 65
  - plain-language explanation

### Scenario View (Best / Base / Worst)
- Deterministic scenario table (fast, mobile-safe)
- Shows balances at retirement age, age 65, age 90 (or end age)
- Shows depletion age and peak shortfall
- In-app note documents deterministic assumption (not Monte Carlo percentile)

### Stress Test Mode
- Advanced toggle: `Stress test mode`
- Matrix view for return and inflation combinations
- Per-cell outcome badge, earliest retirement age, depletion age, shortfall

### Tax-Smart Withdrawal Guidance (Canadian-focused heuristic)
- New guidance section for:
  - bridge period (retirement to 65)
  - age 65+
  - OAS clawback awareness
- Disclaimer included in-app (guidance only, not tax advice)

### Optional Account Buckets (Guidance inputs)
Added advanced inputs (guidance-only for now):
- RRSP / RRIF balance
- TFSA balance
- Non-registered balance
- contribution allocation (RRSP % / TFSA %)
- withdrawal strategy selector (`Tax-smart`, `RRSP first`, `TFSA first`)

Note: the core projection still uses `Current savings ($)` as the main modeled portfolio balance. The account buckets support tax-sequencing guidance and action suggestions.

### Suggested Next Steps (Actionable recommendations)
- Data-driven action list based on forecast outputs and scenarios
- Examples include retirement age tradeoffs, savings changes, CPP timing, OAS clawback risk, and stress testing

### Buy Me a Coffee conversion improvements
- Added a support CTA near the summary and another near the references/footer area
- Value-based copy:
  - “If this tool saved you time or gave you clarity…”
- Includes micro-copy:
  - `No ads. No tracking. Local-first.`

### Mobile / iOS improvements
- 16px form controls on mobile to avoid iOS zoom-on-focus
- Better safe-area padding for iPhone
- More compact two-column mobile forms where possible
- Indicator dots kept beside inputs (not forced below)

### Branding / SEO improvements
- Rebranded as **Canadian Retirement Planner**
- Updated metadata (description, keywords, OG/Twitter, canonical)
- Added JSON-LD `SoftwareApplication` structured data
- Updated `robots.txt`, `sitemap.xml`, and `manifest.webmanifest` for GitHub Pages project deployment

## Computation Assumptions (Documented in-app)

### Scenario table / stress test
- Uses **deterministic scenarios** (fast) rather than Monte Carlo percentiles
- Scenario spreads are based on expected return +/- a configured spread/volatility input
- The scenario note in the UI documents this assumption

### OAS clawback (optional)
- OAS clawback is a planning estimate (heuristic)
- Household approximation is used when spouse OAS is enabled
- Per-recipient threshold x number of OAS recipients

### Tax-smart withdrawal guidance
- Guidance is heuristic and educational
- Not tax/legal/financial advice
- Intended to help compare planning directions, not produce filing-grade tax results

## How to Test (Manual Checklist)

### 1) Core planner still works
- Open app
- Change retirement age, savings, and spending
- Confirm chart and result cards update
- Confirm no console errors

### 2) Local save / import / export
- Change a few fields
- Click `Save now`
- Refresh page and confirm values persist
- Export JSON
- Change values again
- Import exported JSON and confirm values restore (including new fields)

### 3) Demo scenario button
- Change multiple inputs
- Click `Load demo scenario`
- Confirm defaults repopulate (including `ACME Private Pension`)

### 4) Outcome Summary scorecard
- Confirm status badge appears with text + icon
- Confirm earliest retirement age is shown (or “Not found <= 70”)
- Confirm guaranteed income coverage metrics display

### 5) Scenario table
- Switch to `Advanced`
- Change `Return volatility` and `Scenario method`
- Confirm table values and scenario note update

### 6) Stress Test Mode
- In `Advanced`, enable `Stress test mode`
- Confirm matrix appears
- Change return / inflation assumptions and verify matrix updates

### 7) Tax-smart withdrawal guidance
- In `Advanced`, enter RRSP/TFSA/non-registered balances
- Toggle OAS clawback on/off
- Confirm guidance text updates and references thresholds/TFSA use appropriately

### 8) Suggested Next Steps
- Increase spending or lower returns to create a weaker plan
- Confirm actions recommend changes (savings, retirement age, stress testing, etc.)
- Improve inputs and confirm recommendations change

### 9) Mobile / iOS layout
- Test on iPhone Safari (or device emulator)
- Confirm form fields are compact and mostly side-by-side
- Confirm assumption indicator dots appear beside inputs
- Confirm page width does not exceed viewport in Advanced mode

## Files Changed
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `robots.txt`
- `sitemap.xml`
- `README.md`

## Notes
- This app is local-first and does not send planner data to a server.
- The Buy Me a Coffee links point to the existing configured URL.
- No analytics scripts are included in the app code.
