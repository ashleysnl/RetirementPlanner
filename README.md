# Canadian Retirement Planner (NL Default Province)

Static, local-first retirement planning app built with the existing template theme/tokens.

## What This Rebuild Includes

- First-run **Quick Start** flow for a usable forecast in under a minute.
- Progressive **7-step Guided Setup** (basic -> intermediate -> advanced unlock).
- Rebuilt dashboard narrative:
  - At-a-glance KPI row
  - Portfolio balance chart (optional stress band)
  - Income coverage + tax wedge chart
  - Explain-it strip
  - Key age cards (retirement year, age 65, age 71/RRIF year)
- Top-level IA sections:
  - Dashboard
  - Learn
  - Guided setup
  - Plan inputs
  - Advanced inputs
  - Stress test
  - Notes
  - Save/Load
- New **Learn** educational page with sticky table of contents and 7 mini calculators:
  - Inflation spending growth
  - Indexed vs non-indexed income
  - Tax gross-up
  - RRIF minimum withdrawal
  - OAS clawback
  - Spousal pension split
  - Go-Go / Slow-Go / No-Go spending phases
- LocalStorage persistence with JSON export/import, demo, and reset.
- Tooltip/glossary education system.
- OAS clawback modeling and RRIF rule controls/schedule display.
- Offline-friendly service worker.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- No backend
- No login

## File Structure

- `index.html` - Main layout, navigation, wizard, dashboard sections, modals
- Hash navigation supports direct section tabs (example: `#learn`)
- `styles.css` - Template-based tokens/utilities and component styling
- `app.js` - State, rendering, model calculations, tooltip system, storage and import/export
- `sw.js` - App shell caching for offline usage
- `manifest.webmanifest` - PWA metadata
- `docs/audit.md` - UX/model audit and rebuild mapping

## Run Locally

1. Quick open: open `index.html` in a browser.
2. Recommended for service worker behavior:
   - `python3 -m http.server 8080`
   - Open `http://localhost:8080`

## GitHub Pages Deploy

1. Push repository to GitHub.
2. Go to `Settings -> Pages`.
3. Under `Build and deployment`:
   - Source: `Deploy from a branch`
   - Branch: `main` (or default), folder `/ (root)`
4. Save and wait for deployment.
5. Open the published Pages URL.

## Data Model

Stored under LocalStorage key `retirementPlanner.plan.v2` with:

- `version`
- `profile`
- `assumptions`
- `savings`
- `income`
- `accounts`
- `strategy`
- `uiState`
- `notes`

Import validates and normalizes schema with backward-compatible migration.

## Disclaimer

Planning-level estimate only. Not financial, legal, or tax advice.
