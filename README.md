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
  - Start (Guided setup)
  - Dashboard
  - Plan Inputs (summary row editors)
  - Learn the Basics
  - Tools (stress test, notes, save/load, glossary)
  - Advanced Settings (desktop nav, hidden controls by default)
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
- `assets/css/styles.css` - GitHub Pages-safe stylesheet entry that imports the shared planner styles
- `assets/js/app.js` - GitHub Pages-safe module entry that boots the planner from a repo subpath
- Hash navigation supports direct section tabs (example: `#learn`)
- Mobile-first bottom tab navigation: Start / Dashboard / Plan / Learn / Tools
- Floating support button wired from `SUPPORT_URL` constant
- `styles.css` - Template-based tokens/utilities and component styling
- `app.js` - App bootstrap, state wiring, event binding, view orchestration
- `src/model/*` - Calculation engine, projection logic, schema normalization, storage helpers
- `src/ui/*` - Charts, formatters, navigation, tooltips, field builders, dashboard helpers
- `src/ui/views/*` - Guided setup, learn page, and plan-input view builders
- `src/content/*` - Tooltips, glossary, references, content constants
- `app.classic.js` - Classic non-module fallback bundle for `file://` and strict browser contexts
- `tools/build-classic.sh` - Rebuilds `app.classic.js` from modular source without Node
- `sw.js` - App shell caching for offline usage
- `manifest.webmanifest` - PWA metadata
- `docs/audit.md` - UX/model audit and rebuild mapping

## Run Locally

1. Quick open: open `index.html` in a browser.
2. Recommended for service worker behavior:
   - `python3 -m http.server 8080`
   - Open `http://localhost:8080`
3. After editing modular JS files, rebuild classic fallback:
   - `./tools/build-classic.sh`
4. Run the smoke checklist:
   - `docs/smoke-test-checklist.md`

## Required JS Edit Workflow

For every JS change:
1. Edit modular source files in `src/*` or `app.js`.
2. Rebuild classic fallback: `./tools/build-classic.sh` (required).
3. Run the smoke checklist in `docs/smoke-test-checklist.md`.

## GitHub Pages Deploy

1. Push repository to GitHub.
2. Go to `Settings -> Pages`.
3. Under `Build and deployment`:
   - Source: `Deploy from a branch`
   - Branch: `main` (or default), folder `/ (root)`
4. Save and wait for deployment.
5. Open the published Pages URL.

### GitHub Pages Pathing Notes

- The published entry uses `./assets/css/styles.css` and `./assets/js/app.js` so the planner renders correctly from `https://ashleysnl.github.io/RetirementPlanner/`.
- Shared SimpleKit shell resources stay absolute:
  - `https://core.simplekit.app/core.css`
  - `https://core.simplekit.app/core.js`
- Repo-owned icons, manifests, and local HTML links should stay relative with `./...` paths.

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
