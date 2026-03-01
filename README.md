# Canadian Retirement Planner (NL Default Province)

Static, local-first retirement planning web app built with the existing template style tokens and components.

## What This App Includes

- Progressive first-run UX with guided 5-step setup
- Simple dashboard with key KPIs and projection chart
- Advanced model (tax estimate, account mix, withdrawal strategies, OAS clawback toggle)
- Deterministic scenarios (best/base/worst) and stress test matrix
- Reusable `ⓘ` tooltip system and global glossary modal
- LocalStorage plan persistence with versioned JSON model
- JSON export/import with schema validation
- Demo plan loader and full reset
- Offline-friendly service worker (`sw.js`)

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- No backend
- No login

## File Structure

- `index.html` - App layout, wizard container, dashboard, advanced/stress/notes panels, glossary modal
- `styles.css` - Template-aligned design tokens + component styles
- `app.js` - State model, progressive UX rendering, calculation engine, tooltips, import/export, storage
- `sw.js` - Offline cache strategy for app shell files
- `manifest.webmanifest` - PWA metadata
- `icons/` - App icons

## Local Run Instructions

1. Open `index.html` directly in a browser for quick local use.
2. For best service-worker behavior, serve with a local static server (example: `python3 -m http.server 8080`) and open `http://localhost:8080`.

## GitHub Pages Deploy

1. Push this project to a GitHub repository.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main` (or your default) and `/ (root)`
4. Save, then wait for Pages publish.
5. Open the published URL shown in the Pages settings.

## Data Model

The app stores one plan object in LocalStorage (`retirementPlanner.plan.v2`) with:

- `version`
- `profile`
- `assumptions`
- `savings`
- `income`
- `accounts`
- `strategy`
- `uiState`
- `notes`

Import validates and normalizes this schema. Older versions are migrated where possible.

## Planning Disclaimer

This tool provides planning-level educational estimates only. It is not financial, legal, or tax advice.
