export function buildStartupDiagnostics({ error, failingResources = [] }) {
  return {
    userAgent: navigator.userAgent,
    url: location.href,
    error: error ? String(error?.stack || error?.message || error) : "",
    failingResources: Array.isArray(failingResources) ? failingResources : [],
    stage: globalThis.__RETIREMENT_APP_STAGE || "",
  };
}

