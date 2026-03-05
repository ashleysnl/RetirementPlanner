# Deploy Checklist

## Boot reliability
- Hard refresh on production URL and confirm no startup error banner.
- Verify `src/main.js` and `app.classic.js` return 200 (not HTML fallback).
- Verify service worker updated and old caches are removed.

## Browser matrix
- Desktop Chrome: cold load + reload.
- Desktop Firefox: cold load + reload.
- iPhone Safari: normal tab load.
- iPhone Safari private mode: load + copy summary.
- iOS Home Screen app: launch + navigate tabs.

## Core flows
- Start guided setup and finish.
- Dashboard charts render and age controls sync.
- Copy share link, copy minimal link, copy summary all show copied toast.
- Methodology references are visible and open.
- Export, import, demo, reset all work.

## Recovery checks
- Trigger startup error intentionally (bad script path in local test) and confirm:
  - hard refresh instructions button works
  - clear site data button works
  - copy diagnostics button copies payload

