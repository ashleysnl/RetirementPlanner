function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function shouldUseBlockingImportMessage() {
  try {
    return typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia("(max-width: 1100px)").matches;
  } catch {
    return false;
  }
}

function stripBom(text) {
  return typeof text === "string" ? text.replace(/^\uFEFF/, "") : "";
}

function readFileAsText(file) {
  if (!file) return Promise.resolve("");
  if (typeof file.text === "function") {
    return file.text().then(stripBom);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = () => resolve(stripBom(String(reader.result || "")));
    reader.readAsText(file);
  });
}

function hasOwnPath(obj, path) {
  const keys = path.split(".");
  let ref = obj;
  for (const key of keys) {
    if (!ref || typeof ref !== "object" || !Object.prototype.hasOwnProperty.call(ref, key)) return false;
    ref = ref[key];
  }
  return true;
}

function getByPath(obj, path) {
  const keys = path.split(".");
  let ref = obj;
  for (const key of keys) {
    if (!ref || typeof ref !== "object") return undefined;
    ref = ref[key];
  }
  return ref;
}

function verifyImportedCoreFields(parsed, normalized) {
  const mismatches = [];
  const checks = [
    ["profile.retirementAge", (value) => Number(value), (value) => Number(value)],
    ["profile.lifeExpectancy", (value) => Number(value), (value) => Number(value)],
    ["profile.desiredSpending", (value) => Number(value), (value) => Number(value)],
    ["savings.currentTotal", (value) => Number(value), (value) => Number(value)],
    ["savings.annualContribution", (value) => Number(value), (value) => Number(value)],
    ["income.pension.enabled", (value) => Boolean(value), (value) => Boolean(value)],
    ["income.pension.amount", (value) => Number(value), (value) => Number(value)],
  ];

  checks.forEach(([path, parseExpected, parseActual]) => {
    if (!hasOwnPath(parsed, path)) return;
    const expected = parseExpected(getByPath(parsed, path));
    const actual = parseActual(getByPath(normalized, path));
    if (Number.isNaN(expected) || Number.isNaN(actual)) return;
    if (expected !== actual) mismatches.push(`${path}: expected ${expected}, got ${actual}`);
  });

  if (mismatches.length) {
    throw new Error(`Imported file did not round-trip cleanly. ${mismatches.slice(0, 3).join(" • ")}`);
  }
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

async function importPlanFromFile({
  file,
  normalizePlan,
  onPlanLoaded,
  toast,
  onImportError,
}) {
  if (!file) return;

  try {
    const text = await readFileAsText(file);
    const parsed = JSON.parse(text);
    const normalized = normalizePlan(sanitizeImportedPlan(parsed));
    verifyImportedCoreFields(parsed, normalized);
    onPlanLoaded(normalized);
    if (typeof toast === "function") toast("Plan imported.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    if (typeof toast === "function") toast(`Import error: ${message}`);
    if (typeof onImportError === "function") onImportError(message);
    else if (shouldUseBlockingImportMessage()) alert(`Import error:\n${message}`);
  }
}

export async function importPlanFromFileInput({
  fileInput,
  normalizePlan,
  onPlanLoaded,
  toast,
  onImportError,
}) {
  const file = fileInput?.files?.[0];
  try {
    await importPlanFromFile({
      file,
      normalizePlan,
      onPlanLoaded,
      toast,
      onImportError,
    });
  } finally {
    if (fileInput) fileInput.value = "";
  }
}

export function promptImportPlan(options) {
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "application/json,.json";
  picker.style.position = "fixed";
  picker.style.left = "-9999px";
  picker.style.opacity = "0";
  document.body.appendChild(picker);

  const cleanup = () => {
    picker.value = "";
    picker.remove();
  };

  picker.addEventListener("change", async () => {
    const file = picker.files?.[0];
    try {
      await importPlanFromFile({
        file,
        normalizePlan: options.normalizePlan,
        onPlanLoaded: options.onPlanLoaded,
        toast: options.toast,
        onImportError: options.onImportError,
      });
    } finally {
      cleanup();
    }
  }, { once: true });

  picker.click();
}
