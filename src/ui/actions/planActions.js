function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildPortableUiState(uiState = {}) {
  return {
    hasStarted: Boolean(uiState.hasStarted),
    experienceMode: uiState.experienceMode === "advanced" ? "advanced" : "beginner",
    wizardStep: Number.isFinite(Number(uiState.wizardStep)) ? Number(uiState.wizardStep) : 1,
    showAdvancedControls: Boolean(uiState.showAdvancedControls),
    showScenarioCompare: Boolean(uiState.showScenarioCompare),
    showGrossWithdrawals: Boolean(uiState.showGrossWithdrawals ?? true),
    emphasizeTaxes: Boolean(uiState.emphasizeTaxes ?? true),
    timelineSelectedAge: Number.isFinite(Number(uiState.timelineSelectedAge)) ? Number(uiState.timelineSelectedAge) : null,
    incomeMap: cloneJson(uiState.incomeMap || {}),
    timingSim: cloneJson(uiState.timingSim || {}),
    clientSummary: cloneJson(uiState.clientSummary || {}),
    learn: cloneJson(uiState.learn || {}),
    learningProgress: cloneJson(uiState.learningProgress || {}),
    unlocked: cloneJson(uiState.unlocked || {}),
  };
}

function buildPortablePlan(state) {
  return {
    version: state.version,
    profile: cloneJson(state.profile || {}),
    assumptions: cloneJson(state.assumptions || {}),
    savings: cloneJson(state.savings || {}),
    income: cloneJson(state.income || {}),
    accounts: cloneJson(state.accounts || {}),
    strategy: cloneJson(state.strategy || {}),
    uiState: buildPortableUiState(state.uiState || {}),
    notes: typeof state.notes === "string" ? state.notes : "",
  };
}

function sanitizeImportedPlan(parsed) {
  if (!parsed || typeof parsed !== "object") return parsed;
  const sanitized = buildPortablePlan(parsed);
  sanitized.uiState = {
    ...sanitized.uiState,
    firstRun: false,
    hasStarted: true,
    activeNav: "dashboard",
    dashboardScenario: "base",
    advancedSearch: "",
    justCompletedWizard: false,
    selectedScenarioLabel: "",
    lastChangeSummary: null,
    scenarios: [],
    supportShownEvents: {
      wizardComplete: false,
      firstGrossUp: false,
      firstClawback: false,
      reportGenerated: false,
    },
  };
  return sanitized;
}

export function exportPlanJson(state, toast) {
  const exportObject = {
    ...buildPortablePlan(state),
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `retirement-plan-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  if (typeof toast === "function") toast("Plan exported.");
}

export async function importPlanFromFileInput({
  fileInput,
  normalizePlan,
  onPlanLoaded,
  toast,
}) {
  const file = fileInput?.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizePlan(sanitizeImportedPlan(parsed));
    onPlanLoaded(normalized);
    if (typeof toast === "function") toast("Plan imported.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    if (typeof toast === "function") toast(`Import error: ${message}`);
  } finally {
    if (fileInput) fileInput.value = "";
  }
}
