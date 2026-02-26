const STORAGE_KEY = "retirementPlanner.v1";
const BACKUP_VERSION = 1;
const UI_MODE_KEY = "retirementPlanner.uiMode.v1";

const RISK_PRESETS = {
  conservative: { growthRate: 4.0, retirementReturn: 3.0, label: "Conservative" },
  balanced: { growthRate: 5.5, retirementReturn: 4.0, label: "Balanced" },
  aggressive: { growthRate: 7.0, retirementReturn: 5.0, label: "Aggressive" },
};

// CRA payroll deduction tables (January 1, 2026), Newfoundland and Labrador (NL).
const TAX_2026 = {
  federal: [
    [58523, 0.14],
    [117045, 0.205],
    [181440, 0.26],
    [258482, 0.29],
    [Infinity, 0.33],
  ],
};

// CRA T4127 Table 8.1 (effective January 1, 2026) provincial/territorial rates and thresholds.
// Quebec provincial tax is administered by Revenu Quebec and is added separately below.
const PROVINCE_TAX_2026 = {
  AB: { name: "Alberta", brackets: [[151234, 0.08], [181481, 0.12], [241974, 0.13], [362961, 0.14], [Infinity, 0.15]] },
  BC: { name: "British Columbia", brackets: [[49279, 0.0506], [98560, 0.077], [113159, 0.105], [137407, 0.1229], [186306, 0.147], [259830, 0.168], [Infinity, 0.205]] },
  MB: { name: "Manitoba", brackets: [[47000, 0.108], [100000, 0.1275], [Infinity, 0.174]], },
  NB: { name: "New Brunswick", brackets: [[51306, 0.094], [102614, 0.14], [190060, 0.16], [Infinity, 0.195]] },
  NL: { name: "Newfoundland and Labrador", brackets: [[44192, 0.087], [88382, 0.145], [157792, 0.158], [220910, 0.178], [282214, 0.198], [564429, 0.208], [1128858, 0.213], [Infinity, 0.218]] },
  NS: { name: "Nova Scotia", brackets: [[30507, 0.0879], [61015, 0.1495], [95883, 0.1667], [154650, 0.175], [Infinity, 0.21]] },
  ON: { name: "Ontario", brackets: [[52886, 0.0505], [105775, 0.0915], [150000, 0.1116], [220000, 0.1216], [Infinity, 0.1316]] },
  PE: { name: "Prince Edward Island", brackets: [[35388, 0.095], [70676, 0.1347], [Infinity, 0.167]] },
  QC: { name: "Quebec", source: "RQ", brackets: [[54345, 0.14], [108680, 0.19], [132245, 0.24], [Infinity, 0.2575]] },
  SK: { name: "Saskatchewan", brackets: [[56473, 0.105], [161922, 0.125], [Infinity, 0.145]] },
  YT: { name: "Yukon", brackets: [[57375, 0.064], [114750, 0.09], [177882, 0.109], [500000, 0.128], [Infinity, 0.15]] },
  NT: { name: "Northwest Territories", brackets: [[51964, 0.059], [103930, 0.086], [168967, 0.122], [Infinity, 0.1405]] },
  NU: { name: "Nunavut", brackets: [[54707, 0.04], [109413, 0.07], [177881, 0.09], [288816, 0.115], [Infinity, 0.12]] },
};

const INPUT_RISK_RULES = {
  plannerTitle: { kind: "info", label: "Info" },
  provinceCode: { kind: "info", label: "Info" },
  birthYear: { kind: "info", label: "Info" },
  currentYear: { kind: "info", label: "Info" },
  retirementAge: { kind: "numeric", direction: "higher_conservative", baseline: 55, deltaType: "abs", delta: 3 },
  lifeExpectancy: { kind: "numeric", direction: "higher_conservative", baseline: 90, deltaType: "abs", delta: 3 },
  currentSavings: { kind: "numeric", direction: "higher_conservative", baseline: 268797, deltaType: "pct", delta: 0.2 },
  annualContribution: { kind: "numeric", direction: "higher_conservative", baseline: 21000, deltaType: "pct", delta: 0.2 },
  contributionIncrease: { kind: "numeric", direction: "higher_conservative", baseline: 3.0, deltaType: "abs", delta: 0.8 },
  inflationRate: { kind: "numeric", direction: "higher_conservative", baseline: 2.5, deltaType: "abs", delta: 0.7 },
  riskProfile: { kind: "profile" },
  growthRate: { kind: "numeric", direction: "lower_conservative", baseline: 5.5, deltaType: "abs", delta: 1.0 },
  retirementReturn: { kind: "numeric", direction: "lower_conservative", baseline: 4.0, deltaType: "abs", delta: 0.8 },
  desiredIncome: { kind: "numeric", direction: "higher_conservative", baseline: 84000, deltaType: "pct", delta: 0.12 },
  returnVolatility: { kind: "info", label: "Info" },
  scenarioMethod: { kind: "info", label: "Info" },
  privatePensionName: { kind: "info", label: "Info" },
  privatePensionAnnual: { kind: "numeric", direction: "higher_conservative", baseline: 18500, deltaType: "pct", delta: 0.25 },
  privatePensionStartAge: { kind: "info", label: "Info" },
  privatePensionIncrease: { kind: "numeric", direction: "higher_conservative", baseline: 0, deltaType: "abs", delta: 0.5 },
  spouseEnabled: { kind: "info", label: "Info" },
  spousePrivatePensionName: { kind: "info", label: "Info" },
  spousePrivatePensionAnnual: { kind: "numeric", direction: "higher_conservative", baseline: 12000, deltaType: "pct", delta: 0.3 },
  spousePrivatePensionStartAge: { kind: "info", label: "Info" },
  spousePrivatePensionIncrease: { kind: "numeric", direction: "higher_conservative", baseline: 0, deltaType: "abs", delta: 0.5 },
  cppAt65: { kind: "numeric", direction: "lower_conservative", baseline: 9696, deltaType: "pct", delta: 0.12 },
  cppStartAge: { kind: "numeric", direction: "higher_conservative", baseline: 65, deltaType: "abs", delta: 2 },
  oasAt65: { kind: "numeric", direction: "lower_conservative", baseline: 8732, deltaType: "pct", delta: 0.12 },
  oasStartAge: { kind: "numeric", direction: "higher_conservative", baseline: 65, deltaType: "abs", delta: 2 },
  spouseCppAt65: { kind: "numeric", direction: "lower_conservative", baseline: 8000, deltaType: "pct", delta: 0.15 },
  spouseCppStartAge: { kind: "numeric", direction: "higher_conservative", baseline: 65, deltaType: "abs", delta: 2 },
  spouseOasAt65: { kind: "numeric", direction: "lower_conservative", baseline: 8732, deltaType: "pct", delta: 0.12 },
  spouseOasStartAge: { kind: "numeric", direction: "higher_conservative", baseline: 65, deltaType: "abs", delta: 2 },
  oasClawbackEnabled: { kind: "info", label: "Info" },
  oasClawbackThreshold: { kind: "info", label: "Info" },
  oasClawbackRate: { kind: "info", label: "Info" },
  rrspBalance: { kind: "info", label: "Info" },
  tfsaBalance: { kind: "info", label: "Info" },
  nonRegisteredBalance: { kind: "info", label: "Info" },
  rrspContributionPct: { kind: "info", label: "Info" },
  tfsaContributionPct: { kind: "info", label: "Info" },
  withdrawalStrategy: { kind: "info", label: "Info" },
  stressTestEnabled: { kind: "info", label: "Info" },
  escalateBrackets: { kind: "boolean", conservativeWhenTrue: true },
};

const FIELD_HELP_TEXT = {
  plannerTitle: "Display title for this planner. Rename it for yourself, a client, or a household.",
  provinceCode: "Select the province or territory used for the estimated combined federal + provincial tax calculation.",
  birthYear: "Your birth year helps calculate your current age and how many years you have until retirement.",
  currentYear: "Reference year used for tax table timing and age calculations.",
  retirementAge: "The age you want employment income to stop and retirement withdrawals to begin.",
  lifeExpectancy: "How long you want your plan to last. Many people test age 90-95 to stress-test the plan.",
  currentSavings: "Total retirement savings you have today (RRSP, TFSA, pensions, and other retirement-focused assets).",
  annualContribution: "How much you expect to add each year before retirement.",
  contributionIncrease: "If you expect your annual savings to grow over time, enter the yearly increase here.",
  inflationRate: "Used to increase retirement spending over time so your plan reflects rising costs.",
  riskProfile: "Quick preset that adjusts return assumptions to conservative, balanced, or aggressive.",
  growthRate: "Average annual investment return assumption before retirement.",
  retirementReturn: "Average annual investment return assumption after retirement begins.",
  desiredIncome: "How much you want to spend each year in retirement after tax, in today's dollars.",
  returnVolatility: "Scenario range input used for best/base/worst deterministic comparisons and stress testing (not a Monte Carlo percentile).",
  scenarioMethod: "Choose how scenario spreads are calculated for the scenario table (fast deterministic methods).",
  privatePensionName: "Optional label for an employer or private pension source (for example, ACME Private Pension).",
  privatePensionAnnual: "Estimated annual amount from your employer/private pension when it starts.",
  privatePensionStartAge: "Age when your private pension payments begin.",
  privatePensionIncrease: "Optional annual increase for your private pension (COLA/indexing).",
  spouseEnabled: "Turn this on to include spouse private pension and spouse CPP/OAS estimates in the household plan.",
  spousePrivatePensionName: "Optional label for the spouse employer/private pension source.",
  spousePrivatePensionAnnual: "Estimated annual spouse employer/private pension amount when it starts.",
  spousePrivatePensionStartAge: "Household plan age when the spouse private pension starts (use the same timeline as the chart).",
  spousePrivatePensionIncrease: "Optional annual increase for the spouse private pension (COLA/indexing).",
  cppAt65: "Your estimated annual CPP amount if started at age 65.",
  cppStartAge: "When you plan to start CPP (60-70). Later start increases the annual amount.",
  oasAt65: "Your estimated annual OAS amount if started at age 65.",
  oasStartAge: "When you plan to start OAS (65-70). Later start increases the annual amount.",
  spouseCppAt65: "Estimated annual spouse CPP amount if started at age 65.",
  spouseCppStartAge: "Household plan age when spouse CPP starts (60-70).",
  spouseOasAt65: "Estimated annual spouse OAS amount if started at age 65.",
  spouseOasStartAge: "Household plan age when spouse OAS starts (65-70).",
  oasClawbackEnabled: "Enable an estimated OAS clawback (recovery tax) planning assumption in retirement years.",
  oasClawbackThreshold: "Annual income threshold per OAS recipient used for the clawback estimate. This planner applies a household approximation.",
  oasClawbackRate: "Estimated clawback rate applied above the threshold. Default is 15%.",
  rrspBalance: "Optional RRSP/RRIF balance used for tax-smart withdrawal guidance (does not yet replace total savings modeling).",
  tfsaBalance: "Optional TFSA balance used for tax-smart withdrawal guidance and top-up suggestions.",
  nonRegisteredBalance: "Optional non-registered account balance used for withdrawal sequencing guidance.",
  rrspContributionPct: "Guidance-only contribution split into RRSP (combined with TFSA percentage and remainder to non-registered).",
  tfsaContributionPct: "Guidance-only contribution split into TFSA.",
  withdrawalStrategy: "Comparison lens for guidance recommendations (heuristic only; not a tax advice engine).",
  stressTestEnabled: "Shows a matrix of outcomes for multiple return and inflation assumptions using the same planner logic.",
  escalateBrackets: "Inflation-adjusts tax brackets for future-year planning scenarios.",
};

const GUIDED_STEPS = [
  {
    id: "you_today",
    title: "You today",
    description: "Start with where you are now. These inputs create the baseline for your plan.",
    fieldIds: ["plannerTitle", "provinceCode", "birthYear", "currentSavings"],
    summary: () => "Tip: You do not need to be exact on the first pass. A rough estimate is enough to get started.",
  },
  {
    id: "retirement_goal",
    title: "Retirement goal",
    description: "Set when you want to retire and how long the plan should support you.",
    fieldIds: ["retirementAge", "lifeExpectancy", "desiredIncome"],
    summary: () => "Start with a realistic spending goal, then refine after you see the first projection.",
  },
  {
    id: "saving_plan",
    title: "Saving plan",
    description: "Enter what you can save each year. This often has the biggest impact on outcomes.",
    fieldIds: ["annualContribution", "riskProfile"],
    summary: () => "If you are unsure, use the Balanced risk profile first and compare later.",
  },
  {
    id: "benefits",
    title: "Pensions & benefits",
    description: "Add your private pension (if any) and choose when you expect to start CPP and OAS.",
    fieldIds: ["privatePensionName", "privatePensionAnnual", "privatePensionStartAge", "spouseEnabled", "spousePrivatePensionAnnual", "cppStartAge", "oasStartAge", "spouseCppStartAge", "spouseOasStartAge"],
    summary: () => "Advanced mode lets you edit private pension increases, estimated CPP/OAS amounts, and compare more timing assumptions.",
  },
  {
    id: "results",
    title: "Results and next steps",
    description: "Review your forecast, then switch to Simple or Advanced mode if you want to fine-tune assumptions.",
    fieldIds: [],
    summary: (state, projection) => {
      const shortfall = projection.firstShortfallAge
        ? `Your plan may run short around age ${projection.firstShortfallAge}.`
        : "Your projected savings remain positive through your selected life expectancy.";
      return `${shortfall} Focus first on retirement age, annual savings, and desired retirement spending before changing advanced tax inputs.`;
    },
  },
];

const DEFAULT_STATE = {
  inputs: {
    plannerTitle: "Retirement Plan Title",
    provinceCode: "NL",
    birthYear: 1987,
    currentYear: new Date().getFullYear(),
    retirementAge: 55,
    lifeExpectancy: 90,
    currentSavings: 268797,
    annualContribution: 21000,
    contributionIncrease: 3.0,
    inflationRate: 2.5,
    riskProfile: "balanced",
    growthRate: 5.5,
    retirementReturn: 4.0,
    desiredIncome: 84000,
    returnVolatility: 3.0,
    scenarioMethod: "deterministic",
    privatePensionName: "ACME Private Pension",
    privatePensionAnnual: 18500,
    privatePensionStartAge: 55,
    privatePensionIncrease: 1.5,
    spouseEnabled: false,
    spousePrivatePensionName: "Spouse Pension",
    spousePrivatePensionAnnual: 0,
    spousePrivatePensionStartAge: 55,
    spousePrivatePensionIncrease: 0,
    cppAt65: 9696,
    cppStartAge: 65,
    oasAt65: 8732,
    oasStartAge: 65,
    spouseCppAt65: 0,
    spouseCppStartAge: 65,
    spouseOasAt65: 0,
    spouseOasStartAge: 65,
    oasClawbackEnabled: false,
    oasClawbackThreshold: 90977,
    oasClawbackRate: 15,
    rrspBalance: 150000,
    tfsaBalance: 90000,
    nonRegisteredBalance: 28797,
    rrspContributionPct: 50,
    tfsaContributionPct: 40,
    withdrawalStrategy: "taxSmart",
    stressTestEnabled: false,
    escalateBrackets: true,
  },
  notes:
    "Notes:\n- This planner is for scenario exploration, not tax filing or legal advice.\n- Validate tax assumptions, pension statements, and drawdown strategy with a professional.\n- Use the pension timing table to compare early vs deferred CPP/OAS start ages.\n- Revisit inflation and return assumptions annually.",
  meta: {
    lastSavedAt: null,
    version: BACKUP_VERSION,
  },
};

const el = {
  form: document.getElementById("plannerForm"),
  snapshotGrid: document.getElementById("snapshotGrid"),
  resultsGrid: document.getElementById("resultsGrid"),
  outcomeSummaryCard: document.getElementById("outcomeSummaryCard"),
  scenarioTableBody: document.getElementById("scenarioTableBody"),
  scenarioTableNote: document.getElementById("scenarioTableNote"),
  stressTestPanel: document.getElementById("stressTestPanel"),
  stressTestBody: document.getElementById("stressTestBody"),
  retirementBreakdownDetails: document.getElementById("retirementBreakdownDetails"),
  taxGuidanceBody: document.getElementById("taxGuidanceBody"),
  actionsList: document.getElementById("actionsList"),
  taxTableBody: document.getElementById("taxTableBody"),
  taxTitle: document.getElementById("taxTitle"),
  taxSubtitle: document.getElementById("taxSubtitle"),
  taxAssumptionsBtn: document.getElementById("taxAssumptionsBtn"),
  taxAssumptionsModal: document.getElementById("taxAssumptionsModal"),
  taxAssumptionsCloseBtn: document.getElementById("taxAssumptionsCloseBtn"),
  pensionScenarioBody: document.getElementById("pensionScenarioBody"),
  selectedPensionDetails: document.getElementById("selectedPensionDetails"),
  notes: document.getElementById("plannerNotes"),
  chart: document.getElementById("projectionChart"),
  saveBtn: document.getElementById("saveBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  resetBtn: document.getElementById("resetBtn"),
  demoBtn: document.getElementById("demoBtn"),
  importFile: document.getElementById("importFile"),
  toast: document.getElementById("toast"),
  heroTitle: document.getElementById("heroTitle"),
  storageStatus: document.getElementById("storageStatus"),
  riskBadge: document.getElementById("riskBadge"),
  riskKeyText: document.getElementById("riskKeyText"),
  guidedModeBtn: document.getElementById("guidedModeBtn"),
  simpleModeBtn: document.getElementById("simpleModeBtn"),
  advancedModeBtn: document.getElementById("advancedModeBtn"),
  modeHint: document.getElementById("modeHint"),
  advancedNodes: Array.from(document.querySelectorAll('[data-complexity="advanced"]')),
  plannerLabels: Array.from(document.querySelectorAll("#plannerForm label")),
  plannerSectionTitles: Array.from(document.querySelectorAll("#plannerForm .form-section-title")),
  guidedPanel: document.getElementById("guidedPanel"),
  guidedStepCount: document.getElementById("guidedStepCount"),
  guidedProgressFill: document.getElementById("guidedProgressFill"),
  guidedStepTitle: document.getElementById("guidedStepTitle"),
  guidedStepDescription: document.getElementById("guidedStepDescription"),
  guidedStepSummary: document.getElementById("guidedStepSummary"),
  guidedPrevBtn: document.getElementById("guidedPrevBtn"),
  guidedNextBtn: document.getElementById("guidedNextBtn"),
  spouseNodes: Array.from(document.querySelectorAll("[data-spouse-field]")),
};

let state = loadState();
let ui = {
  dirty: false,
  toastTimer: null,
  lastProjection: null,
  mode: loadUiMode(),
  guideStepIndex: 0,
};
const fieldIndicatorRefs = new Map();

init();

function init() {
  setupInputRiskIndicators();
  setupFieldHelpText();
  bindEvents();
  hydrateForm();
  applyUiMode();
  renderAll();
  markDirty(false);
}

function bindEvents() {
  el.form?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    syncFormToState(target.id);

    if (target.id === "riskProfile") {
      applyRiskPreset(target.value);
      hydrateForm();
    }

    renderAll();
    markDirty(true);
  });

  el.notes?.addEventListener("input", () => {
    state.notes = el.notes.value;
    markDirty(true);
  });

  el.saveBtn?.addEventListener("click", saveState);
  el.exportBtn?.addEventListener("click", exportJson);
  el.importBtn?.addEventListener("click", () => el.importFile?.click());
  el.importFile?.addEventListener("change", handleImportFile);
  el.demoBtn?.addEventListener("click", loadDemoScenario);
  el.resetBtn?.addEventListener("click", resetDemo);
  el.guidedModeBtn?.addEventListener("click", () => setUiMode("guided"));
  el.simpleModeBtn?.addEventListener("click", () => setUiMode("simple"));
  el.advancedModeBtn?.addEventListener("click", () => setUiMode("advanced"));
  el.guidedPrevBtn?.addEventListener("click", () => moveGuidedStep(-1));
  el.guidedNextBtn?.addEventListener("click", () => moveGuidedStep(1));
  el.taxAssumptionsBtn?.addEventListener("click", openTaxAssumptionsModal);
  el.taxAssumptionsCloseBtn?.addEventListener("click", closeTaxAssumptionsModal);
  el.taxAssumptionsModal?.addEventListener("click", (event) => {
    if (event.target === el.taxAssumptionsModal) closeTaxAssumptionsModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTaxAssumptionsModal();
  });
  window.addEventListener("resize", debounce(() => renderChart(ui.lastProjection), 80));
}

function openTaxAssumptionsModal() {
  if (!el.taxAssumptionsModal) return;
  el.taxAssumptionsModal.hidden = false;
  el.taxAssumptionsModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeTaxAssumptionsModal() {
  if (!el.taxAssumptionsModal || el.taxAssumptionsModal.hidden) return;
  el.taxAssumptionsModal.hidden = true;
  el.taxAssumptionsModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function loadUiMode() {
  try {
    const raw = localStorage.getItem(UI_MODE_KEY);
    return raw === "advanced" || raw === "simple" || raw === "guided" ? raw : "guided";
  } catch {
    return "guided";
  }
}

function setUiMode(mode) {
  ui.mode = mode === "advanced" || mode === "simple" ? mode : "guided";
  try {
    localStorage.setItem(UI_MODE_KEY, ui.mode);
  } catch {}
  applyUiMode();
  renderAll();
}

function applyUiMode() {
  const isGuided = ui.mode === "guided";
  const isAdvanced = ui.mode === "advanced";
  const isSimple = ui.mode === "simple";

  el.guidedModeBtn?.classList.toggle("active", isGuided);
  el.guidedModeBtn?.setAttribute("aria-pressed", String(isGuided));
  el.simpleModeBtn?.classList.toggle("active", isSimple);
  el.advancedModeBtn?.classList.toggle("active", isAdvanced);
  el.simpleModeBtn?.setAttribute("aria-pressed", String(isSimple));
  el.advancedModeBtn?.setAttribute("aria-pressed", String(isAdvanced));
  if (el.guidedPanel) el.guidedPanel.hidden = !isGuided;

  if (el.modeHint) {
    el.modeHint.textContent = isGuided
      ? "Step-by-step mode with plain-language guidance."
      : isAdvanced
      ? "Showing detailed assumptions, tax tables, and pension timing inputs."
      : "Showing core assumptions only.";
  }

  el.advancedNodes.forEach((node) => {
    node.hidden = !isAdvanced;
  });

  applyGuidedStepVisibility();
}

function getGuidedStep() {
  ui.guideStepIndex = Math.min(Math.max(ui.guideStepIndex, 0), GUIDED_STEPS.length - 1);
  return GUIDED_STEPS[ui.guideStepIndex];
}

function moveGuidedStep(direction) {
  const nextIndex = Math.min(Math.max(ui.guideStepIndex + direction, 0), GUIDED_STEPS.length - 1);
  if (nextIndex === ui.guideStepIndex && ui.guideStepIndex === GUIDED_STEPS.length - 1 && direction > 0) {
    ui.guideStepIndex = 0;
  } else {
    ui.guideStepIndex = nextIndex;
  }
  applyGuidedStepVisibility();
  renderGuidedPanel(ui.lastProjection);
}

function applyGuidedStepVisibility() {
  const guided = ui.mode === "guided";
  document.body.classList.toggle("guided-mode", guided);
  const step = getGuidedStep();
  const visibleFieldIds = new Set(step.fieldIds);

  el.plannerLabels.forEach((label) => {
    const control = label.querySelector("input, select, textarea");
    const id = control?.id || "";
    const shouldShow = guided ? visibleFieldIds.has(id) : true;
    label.dataset.guidedHidden = String(!shouldShow);
  });

  el.plannerSectionTitles.forEach((title) => {
    let shouldShow = true;
    if (guided) {
      shouldShow = false;
      let cursor = title.nextElementSibling;
      while (cursor && !cursor.classList.contains("form-section-title")) {
        if (
          cursor.tagName === "LABEL" &&
          cursor.dataset.guidedHidden !== "true" &&
          !(cursor.hidden)
        ) {
          shouldShow = true;
          break;
        }
        cursor = cursor.nextElementSibling;
      }
    }
    title.dataset.guidedHidden = String(!shouldShow);
  });
}

function renderGuidedPanel(projection) {
  if (ui.mode !== "guided") return;
  const step = getGuidedStep();
  const stepNumber = ui.guideStepIndex + 1;

  if (el.guidedStepCount) el.guidedStepCount.textContent = `Step ${stepNumber} of ${GUIDED_STEPS.length}`;
  if (el.guidedProgressFill) el.guidedProgressFill.style.width = `${(stepNumber / GUIDED_STEPS.length) * 100}%`;
  if (el.guidedStepTitle) el.guidedStepTitle.textContent = step.title;
  if (el.guidedStepDescription) el.guidedStepDescription.textContent = step.description;

  if (el.guidedStepSummary) {
    const text = typeof step.summary === "function" ? step.summary(state.inputs, projection || ui.lastProjection || {}) : "";
    el.guidedStepSummary.textContent = text || "";
  }

  if (el.guidedPrevBtn) el.guidedPrevBtn.disabled = ui.guideStepIndex === 0;
  if (el.guidedNextBtn) {
    el.guidedNextBtn.textContent = ui.guideStepIndex === GUIDED_STEPS.length - 1 ? "Start over" : "Next";
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function normalizeState(input) {
  const base = clone(DEFAULT_STATE);
  if (!input || typeof input !== "object") return base;

  const nextInputs = input.inputs && typeof input.inputs === "object" ? input.inputs : {};
  base.inputs = { ...base.inputs, ...nextInputs };
  base.notes = typeof input.notes === "string" ? input.notes : base.notes;
  base.meta = {
    ...base.meta,
    ...(input.meta && typeof input.meta === "object" ? input.meta : {}),
    version: BACKUP_VERSION,
  };

  sanitizeInputs(base.inputs);
  return base;
}

function clone(value) {
  if (globalThis.structuredClone) return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function hydrateForm() {
  Object.entries(state.inputs).forEach(([key, value]) => {
    const node = document.getElementById(key);
    if (!node) return;
    if (node.type === "checkbox") node.checked = Boolean(value);
    else node.value = String(value);
  });
  if (el.notes) el.notes.value = state.notes;
}

function syncFormToState(changedId) {
  if (!changedId || !(changedId in state.inputs)) return;
  const node = document.getElementById(changedId);
  if (!node) return;

  if (node.type === "checkbox") {
    state.inputs[changedId] = node.checked;
  } else if (node.tagName === "SELECT") {
    state.inputs[changedId] = node.value;
  } else if (node.type === "text") {
    state.inputs[changedId] = node.value;
  } else {
    const parsed = Number(node.value);
    if (!Number.isNaN(parsed)) state.inputs[changedId] = parsed;
  }

  sanitizeInputs(state.inputs);
}

function sanitizeInputs(inputs) {
  inputs.plannerTitle = typeof inputs.plannerTitle === "string"
    ? (inputs.plannerTitle.slice(0, 80).trim() || "Retirement Plan Title")
    : "Retirement Plan Title";
  inputs.provinceCode = typeof inputs.provinceCode === "string" && PROVINCE_TAX_2026[inputs.provinceCode]
    ? inputs.provinceCode
    : DEFAULT_STATE.inputs.provinceCode;
  inputs.birthYear = clampInt(inputs.birthYear, 1900, 2100, DEFAULT_STATE.inputs.birthYear);
  inputs.currentYear = clampInt(inputs.currentYear, 2000, 2100, new Date().getFullYear());
  inputs.retirementAge = clampInt(inputs.retirementAge, 40, 80, DEFAULT_STATE.inputs.retirementAge);
  inputs.lifeExpectancy = clampInt(inputs.lifeExpectancy, Math.max(60, inputs.retirementAge + 1), 110, DEFAULT_STATE.inputs.lifeExpectancy);

  [
    "currentSavings",
    "annualContribution",
    "desiredIncome",
    "returnVolatility",
    "privatePensionAnnual",
    "spousePrivatePensionAnnual",
    "cppAt65",
    "oasAt65",
    "spouseCppAt65",
    "spouseOasAt65",
    "oasClawbackThreshold",
    "rrspBalance",
    "tfsaBalance",
    "nonRegisteredBalance",
  ].forEach((k) => {
    inputs[k] = clampNumber(inputs[k], 0, 1_000_000_000, DEFAULT_STATE.inputs[k]);
  });

  ["contributionIncrease", "inflationRate", "growthRate", "retirementReturn", "privatePensionIncrease", "spousePrivatePensionIncrease"].forEach((k) => {
    inputs[k] = clampNumber(inputs[k], 0, 25, DEFAULT_STATE.inputs[k]);
  });
  inputs.oasClawbackRate = clampNumber(inputs.oasClawbackRate, 0, 100, DEFAULT_STATE.inputs.oasClawbackRate);
  inputs.returnVolatility = clampNumber(inputs.returnVolatility, 0, 30, DEFAULT_STATE.inputs.returnVolatility);
  inputs.rrspContributionPct = clampInt(inputs.rrspContributionPct, 0, 100, DEFAULT_STATE.inputs.rrspContributionPct);
  inputs.tfsaContributionPct = clampInt(inputs.tfsaContributionPct, 0, 100, DEFAULT_STATE.inputs.tfsaContributionPct);

  inputs.privatePensionName = typeof inputs.privatePensionName === "string" ? inputs.privatePensionName.slice(0, 80) : DEFAULT_STATE.inputs.privatePensionName;
  inputs.spousePrivatePensionName = typeof inputs.spousePrivatePensionName === "string" ? inputs.spousePrivatePensionName.slice(0, 80) : DEFAULT_STATE.inputs.spousePrivatePensionName;
  inputs.privatePensionStartAge = clampInt(inputs.privatePensionStartAge, 40, 80, DEFAULT_STATE.inputs.privatePensionStartAge);
  inputs.spousePrivatePensionStartAge = clampInt(inputs.spousePrivatePensionStartAge, 40, 80, DEFAULT_STATE.inputs.spousePrivatePensionStartAge);
  inputs.cppStartAge = clampInt(inputs.cppStartAge, 60, 70, DEFAULT_STATE.inputs.cppStartAge);
  inputs.oasStartAge = clampInt(inputs.oasStartAge, 65, 70, DEFAULT_STATE.inputs.oasStartAge);
  inputs.spouseCppStartAge = clampInt(inputs.spouseCppStartAge, 60, 70, DEFAULT_STATE.inputs.spouseCppStartAge);
  inputs.spouseOasStartAge = clampInt(inputs.spouseOasStartAge, 65, 70, DEFAULT_STATE.inputs.spouseOasStartAge);

  if (!RISK_PRESETS[inputs.riskProfile]) inputs.riskProfile = DEFAULT_STATE.inputs.riskProfile;
  if (!["deterministic", "deterministicWide"].includes(inputs.scenarioMethod)) inputs.scenarioMethod = DEFAULT_STATE.inputs.scenarioMethod;
  if (!["taxSmart", "rrspFirst", "tfsaFirst"].includes(inputs.withdrawalStrategy)) inputs.withdrawalStrategy = DEFAULT_STATE.inputs.withdrawalStrategy;
  inputs.spouseEnabled = Boolean(inputs.spouseEnabled);
  inputs.oasClawbackEnabled = Boolean(inputs.oasClawbackEnabled);
  inputs.stressTestEnabled = Boolean(inputs.stressTestEnabled);
  inputs.escalateBrackets = Boolean(inputs.escalateBrackets);
}

function applyRiskPreset(riskProfile) {
  const preset = RISK_PRESETS[riskProfile];
  if (!preset) return;
  state.inputs.riskProfile = riskProfile;
  state.inputs.growthRate = preset.growthRate;
  state.inputs.retirementReturn = preset.retirementReturn;
}

function renderAll() {
  sanitizeInputs(state.inputs);
  applySpouseVisibility();
  applyGuidedStepVisibility();
  const projection = buildProjection(state.inputs);
  const analytics = buildPlannerAnalytics(state.inputs, projection);
  ui.lastProjection = projection;

  renderPlannerTitle();
  renderGuidedPanel(projection);
  renderInputRiskIndicators();
  renderRiskBadge();
  renderSnapshot(projection);
  renderOutcomeSummary(analytics);
  renderScenarioTable(analytics);
  renderStressTest(analytics);
  renderResults(projection, analytics);
  renderRetirementBreakdown(projection, analytics);
  renderTaxTable(state.inputs);
  renderPensionScenarios(state.inputs);
  renderSelectedPension(state.inputs, projection);
  renderTaxGuidance(state.inputs, projection, analytics);
  renderActions(state.inputs, projection, analytics);
  renderChart(projection);
}

function applySpouseVisibility() {
  const enabled = Boolean(state.inputs.spouseEnabled);
  el.spouseNodes?.forEach((node) => {
    node.hidden = !enabled;
    const controls = node.querySelectorAll("input, select, textarea");
    controls.forEach((control) => {
      control.disabled = !enabled;
    });
  });
}

function renderPlannerTitle() {
  const title = state.inputs.plannerTitle || "Retirement Plan Title";
  if (el.heroTitle) el.heroTitle.textContent = title;
  document.title = `${title} | Canadian Retirement Planner`;
}

function setupFieldHelpText() {
  Object.entries(FIELD_HELP_TEXT).forEach(([id, text]) => {
    const control = document.getElementById(id);
    const label = control?.closest("label");
    if (!control || !label || label.querySelector(".field-help")) return;
    const help = document.createElement("span");
    help.className = "field-help";
    help.textContent = text;
    label.append(help);
  });
}

function setupInputRiskIndicators() {
  Object.keys(INPUT_RISK_RULES).forEach((id) => {
    const control = document.getElementById(id);
    if (!control || fieldIndicatorRefs.has(id)) return;
    const label = control.closest("label");
    if (!label) return;

    const wrap = document.createElement("span");
    wrap.className = "field-control-wrap is-info";

    const indicator = document.createElement("span");
    indicator.className = "input-risk-indicator is-info";
    indicator.setAttribute("tabindex", "0");
    indicator.setAttribute("role", "img");
    indicator.setAttribute("aria-label", "Assumption indicator");
    indicator.textContent = "Info";
    indicator.addEventListener("click", () => {
      indicator.focus();
    });

    control.replaceWith(wrap);
    wrap.append(control, indicator);
    fieldIndicatorRefs.set(id, { wrap, indicator, control });
  });
}

function renderInputRiskIndicators() {
  fieldIndicatorRefs.forEach(({ wrap, indicator, control }, id) => {
    const stateForField = classifyInputRisk(id, control);
    wrap.classList.remove("is-conservative", "is-balanced", "is-aggressive", "is-info");
    indicator.classList.remove("is-conservative", "is-balanced", "is-aggressive", "is-info");
    wrap.classList.add(`is-${stateForField.tone}`);
    indicator.classList.add(`is-${stateForField.tone}`);
    indicator.textContent = "";
    const tooltip = indicatorTooltipForTone(stateForField.tone);
    indicator.title = tooltip;
    indicator.dataset.tooltip = tooltip;
    indicator.setAttribute("aria-label", tooltip);
    wrap.title = tooltip;
  });
}

function indicatorTooltipForTone(tone) {
  if (tone === "conservative") return "Conservative Assumption";
  if (tone === "balanced") return "Balanced Assumption";
  if (tone === "aggressive") return "Aggressive Assumption";
  return "Reference / Strategy-Dependent Input";
}

function classifyInputRisk(id, control) {
  const rule = INPUT_RISK_RULES[id];
  if (!rule) return { tone: "info", label: "Info", title: "No indicator rule configured." };

  if (rule.kind === "info") {
    return { tone: "info", label: "Info", title: "Reference or strategy-dependent field." };
  }

  if (rule.kind === "profile") {
    const value = String(state.inputs[id] || "");
    if (value === "conservative") {
      return { tone: "conservative", label: "Conservative", title: "Selected conservative risk profile." };
    }
    if (value === "aggressive") {
      return { tone: "aggressive", label: "Aggressive", title: "Selected aggressive risk profile (higher-return assumption caution)." };
    }
    return { tone: "balanced", label: "Balanced", title: "Selected balanced risk profile." };
  }

  if (rule.kind === "boolean") {
    const on = Boolean(state.inputs[id]);
    if (on === Boolean(rule.conservativeWhenTrue)) {
      return { tone: "conservative", label: "Conservative", title: "This setting uses a more conservative planning assumption." };
    }
    return { tone: "aggressive", label: "Aggressive", title: "This setting is less conservative (caution)." };
  }

  if (rule.kind === "numeric") {
    const raw = Number(state.inputs[id]);
    if (!Number.isFinite(raw)) {
      return { tone: "info", label: "Info", title: "Enter a number to classify this assumption." };
    }

    const baseline = rule.baseline;
    const delta = rule.deltaType === "pct" ? Math.abs(baseline) * rule.delta : rule.delta;
    const low = baseline - delta;
    const high = baseline + delta;
    const direction = rule.direction;

    if (direction === "higher_conservative") {
      if (raw >= high) return { tone: "conservative", label: "Conservative", title: "Entered value is on the conservative side of the baseline assumption." };
      if (raw <= low) return { tone: "aggressive", label: "Aggressive", title: "Entered value is on the aggressive side of the baseline assumption (caution)." };
      return { tone: "balanced", label: "Balanced", title: "Entered value is near the baseline assumption." };
    }

    if (direction === "lower_conservative") {
      if (raw <= low) return { tone: "conservative", label: "Conservative", title: "Entered value is on the conservative side of the baseline assumption." };
      if (raw >= high) return { tone: "aggressive", label: "Aggressive", title: "Entered value is on the aggressive side of the baseline assumption (caution)." };
      return { tone: "balanced", label: "Balanced", title: "Entered value is near the baseline assumption." };
    }
  }

  return { tone: "info", label: "Info", title: "Reference or strategy-dependent field." };
}

function renderRiskBadge() {
  const preset = RISK_PRESETS[state.inputs.riskProfile] || RISK_PRESETS.balanced;
  if (el.riskBadge) el.riskBadge.textContent = preset.label;
  if (el.riskKeyText) {
    const riskBinary = state.inputs.riskProfile === "aggressive" ? 1 : 0;
    el.riskKeyText.textContent = `Conservative 0 • Aggressive 1 • Current ${riskBinary}`;
  }
}

function buildProjection(inputs) {
  const currentAge = Math.max(0, inputs.currentYear - inputs.birthYear);
  const yearsToRetirement = Math.max(0, inputs.retirementAge - currentAge);
  const maxAge = Math.max(inputs.lifeExpectancy, currentAge + 1);
  const growth = inputs.growthRate / 100;
  const retireGrowth = inputs.retirementReturn / 100;
  const inflation = inputs.inflationRate / 100;
  const contribGrowth = inputs.contributionIncrease / 100;

  let balance = inputs.currentSavings;
  let lowerBalance = inputs.currentSavings;
  let upperBalance = inputs.currentSavings;
  let contribution = inputs.annualContribution;
  // `desiredIncome` is entered in today's dollars, so inflate it to the first
  // retirement year before starting retirement withdrawals.
  let targetSpend = inputs.desiredIncome * Math.pow(1 + inflation, yearsToRetirement);
  let privatePensionAnnual = inputs.privatePensionAnnual;
  let spousePrivatePensionAnnual = inputs.spousePrivatePensionAnnual;
  const privatePensionGrowth = inputs.privatePensionIncrease / 100;
  const spousePrivatePensionGrowth = inputs.spousePrivatePensionIncrease / 100;
  const uncertainty = getUncertaintyReturnAdjustments(inputs.riskProfile);
  const spouseEnabled = Boolean(inputs.spouseEnabled);

  const rows = [];
  let projectedAtRetirement = balance;
  let firstShortfallAge = null;

  for (let age = currentAge; age <= maxAge; age += 1) {
    const taxYear = inputs.birthYear + age;
    const inRetirement = age >= inputs.retirementAge;
    const cpp = age >= inputs.cppStartAge ? cppAnnualAtAge(inputs.cppAt65, inputs.cppStartAge) : 0;
    const oas = age >= inputs.oasStartAge ? oasAnnualAtAge(inputs.oasAt65, inputs.oasStartAge) : 0;
    const privatePensionIncome = age >= inputs.privatePensionStartAge ? privatePensionAnnual : 0;
    const spouseCpp = spouseEnabled && age >= inputs.spouseCppStartAge ? cppAnnualAtAge(inputs.spouseCppAt65, inputs.spouseCppStartAge) : 0;
    const spouseOas = spouseEnabled && age >= inputs.spouseOasStartAge ? oasAnnualAtAge(inputs.spouseOasAt65, inputs.spouseOasStartAge) : 0;
    const spouseGovBenefitIncome = spouseCpp + spouseOas;
    const oasIncome = oas + spouseOas;
    const oasRecipientCount = (oas > 0 ? 1 : 0) + (spouseOas > 0 ? 1 : 0);
    const spousePrivatePensionIncome = spouseEnabled && age >= inputs.spousePrivatePensionStartAge ? spousePrivatePensionAnnual : 0;
    const govBenefitIncome = cpp + oas + spouseGovBenefitIncome;
    const totalPrivatePensionIncome = privatePensionIncome + spousePrivatePensionIncome;
    const pensionIncome = govBenefitIncome + totalPrivatePensionIncome;
    const spending = inRetirement ? targetSpend : 0; // after-tax target spending
    let withdrawal = 0;
    let totalTax = 0;
    let taxOnWithdrawal = 0;
    let oasClawback = 0;
    let oasClawbackOnWithdrawal = 0;
    let netIncome = pensionIncome;

    if (inRetirement) {
      const withdrawalPlan = solveWithdrawalForAfterTaxTarget({
        netTarget: spending,
        pensionIncome,
        oasIncome,
        oasRecipientCount,
        inputs,
        taxYear,
      });
      withdrawal = withdrawalPlan.withdrawal;
      totalTax = withdrawalPlan.totalTax;
      taxOnWithdrawal = withdrawalPlan.taxOnWithdrawal;
      oasClawback = withdrawalPlan.oasClawback;
      oasClawbackOnWithdrawal = withdrawalPlan.oasClawbackOnWithdrawal;
      netIncome = withdrawalPlan.netIncome;
    }

    rows.push({
      age,
      taxYear,
      balance,
      lowerBalance,
      upperBalance,
      spending,
      govBenefitIncome,
      privatePensionIncome,
      spouseGovBenefitIncome,
      spousePrivatePensionIncome,
      oasIncome,
      pensionIncome,
      withdrawal,
      totalTax,
      taxOnWithdrawal,
      oasClawback,
      oasClawbackOnWithdrawal,
      netIncome,
      inRetirement,
    });

    if (age === inputs.retirementAge) projectedAtRetirement = balance;
    if (inRetirement && firstShortfallAge === null && balance <= 0) firstShortfallAge = age;

    const annualReturn = inRetirement ? retireGrowth : growth;
    const annualReturnLow = Math.max(0, annualReturn - (inRetirement ? uncertainty.retire : uncertainty.preretire));
    const annualReturnHigh = annualReturn + (inRetirement ? uncertainty.retire : uncertainty.preretire);
    balance = Math.max(0, balance * (1 + annualReturn));
    lowerBalance = Math.max(0, lowerBalance * (1 + annualReturnLow));
    upperBalance = Math.max(0, upperBalance * (1 + annualReturnHigh));
    if (!inRetirement) {
      balance += contribution;
      lowerBalance += contribution;
      upperBalance += contribution;
      contribution *= 1 + contribGrowth;
    } else {
      balance = Math.max(0, balance - withdrawal);
      lowerBalance = Math.max(0, lowerBalance - withdrawal);
      upperBalance = Math.max(0, upperBalance - withdrawal);
      targetSpend *= 1 + inflation;
    }

    if (age >= inputs.privatePensionStartAge) {
      privatePensionAnnual *= 1 + privatePensionGrowth;
    }
    if (spouseEnabled && age >= inputs.spousePrivatePensionStartAge) {
      spousePrivatePensionAnnual *= 1 + spousePrivatePensionGrowth;
    }
  }

  const retirementRow =
    rows.find((r) => r.age === inputs.retirementAge) ||
    rows.find((r) => r.inRetirement) ||
    rows[rows.length - 1];
  const lastRow = rows[rows.length - 1];
  const selectedGovBenefitAnnual = retirementRow?.govBenefitIncome || 0;
  const selectedPrivatePensionAnnual = retirementRow?.privatePensionIncome || 0;
  const selectedSpouseGovBenefitAnnual = retirementRow?.spouseGovBenefitIncome || 0;
  const selectedSpousePrivatePensionAnnual = retirementRow?.spousePrivatePensionIncome || 0;
  const selectedPensionAnnual = retirementRow?.pensionIncome || 0;
  const fundedRatio = retirementRow && retirementRow.spending > 0
    ? Math.min(999, ((selectedPensionAnnual + estimateSafeIncome(retirementRow.balance)) / retirementRow.spending) * 100)
    : 0;

  return {
    rows,
    currentAge,
    yearsToRetirement,
    projectedAtRetirement,
    finalBalance: lastRow?.balance || 0,
    firstShortfallAge,
    selectedGovBenefitAnnual,
    selectedPrivatePensionAnnual,
    selectedSpouseGovBenefitAnnual,
    selectedSpousePrivatePensionAnnual,
    selectedPensionAnnual,
    retirementGrossIncome: (retirementRow?.pensionIncome || 0) + (retirementRow?.withdrawal || 0),
    retirementNetIncome: retirementRow?.netIncome || 0,
    retirementTaxTotal: retirementRow?.totalTax || 0,
    retirementTaxOnWithdrawal: retirementRow?.taxOnWithdrawal || 0,
    retirementOasClawback: retirementRow?.oasClawback || 0,
    retirementOasClawbackOnWithdrawal: retirementRow?.oasClawbackOnWithdrawal || 0,
    retirementTaxOnPensions: Math.max(0, (retirementRow?.totalTax || 0) - (retirementRow?.taxOnWithdrawal || 0)),
    retirementPensionIncome: retirementRow?.pensionIncome || 0,
    retirementPensionNetIncome: Math.max(0, (retirementRow?.pensionIncome || 0) - Math.max(0, (retirementRow?.totalTax || 0) - (retirementRow?.taxOnWithdrawal || 0))),
    retirementSpending: retirementRow?.spending || inputs.desiredIncome,
    retirementWithdrawalNeed: retirementRow?.withdrawal || 0,
    retirementWithdrawalNetCash: Math.max(0, (retirementRow?.withdrawal || 0) - (retirementRow?.taxOnWithdrawal || 0)),
    retirementAfterTaxGapAfterPensions: Math.max(
      0,
      (retirementRow?.spending || inputs.desiredIncome) - Math.max(0, (retirementRow?.pensionIncome || 0) - Math.max(0, (retirementRow?.totalTax || 0) - (retirementRow?.taxOnWithdrawal || 0)))
    ),
    safeIncomeAtRetirement: estimateSafeIncome(retirementRow?.balance || 0),
    fundedRatio,
  };
}

function estimateSafeIncome(balance) {
  return balance * 0.04;
}

function cppAnnualAtAge(baseAt65, startAge) {
  const ageDelta = startAge - 65;
  if (ageDelta < 0) {
    return baseAt65 * (1 - Math.abs(ageDelta) * 0.072);
  }
  return baseAt65 * (1 + ageDelta * 0.084);
}

function oasAnnualAtAge(baseAt65, startAge) {
  const ageDelta = Math.max(0, startAge - 65);
  return baseAt65 * (1 + ageDelta * 0.072);
}

function buildPlannerAnalytics(inputs, projection) {
  const baseDiag = buildScenarioDiagnostics(inputs);
  const scenarios = getScenarioSpecList(inputs).map((spec) => ({
    ...spec,
    diagnostics: buildScenarioDiagnostics(inputs, spec.overrides),
  }));

  const currentAge = Math.max(0, inputs.currentYear - inputs.birthYear);
  const earliestRetirementAge = findEarliestRetirementAge(inputs, currentAge);
  const status = classifyOutcomeStatus(baseDiag, inputs, earliestRetirementAge);

  const retireCoverage = estimateGuaranteedCoverageAtAge(inputs, inputs.retirementAge, baseDiag);
  const age65Coverage = estimateGuaranteedCoverageAtAge(inputs, 65, baseDiag);

  const stressReturns = [
    Math.max(0, inputs.growthRate - 1),
    inputs.growthRate,
    inputs.growthRate + 1,
  ].map((v) => Number(v.toFixed(1)));
  const stressInflations = [2, 3];
  const stressMatrix = stressReturns.map((growthRate) => ({
    growthRate,
    cells: stressInflations.map((inflationRate) => {
      const diagnostics = buildScenarioDiagnostics(inputs, {
        growthRate,
        retirementReturn: Math.max(0, inputs.retirementReturn + (growthRate - inputs.growthRate)),
        inflationRate,
      });
      const earliest = findEarliestRetirementAge(inputs, currentAge, {
        growthRate,
        retirementReturn: Math.max(0, inputs.retirementReturn + (growthRate - inputs.growthRate)),
        inflationRate,
      });
      const cellStatus = classifyOutcomeStatus(diagnostics, { ...inputs, inflationRate, growthRate }, earliest);
      return { inflationRate, diagnostics, earliestRetirementAge: earliest, status: cellStatus };
    }),
  }));

  const scenarioMethodNote = inputs.scenarioMethod === "deterministicWide"
    ? `Deterministic wide scenarios use your expected return plus/minus ${inputs.returnVolatility.toFixed(1)}%.`
    : `Deterministic scenarios use expected return plus/minus ${Math.max(2, Math.min(4, inputs.returnVolatility || 2)).toFixed(1)}% (fast comparison, not Monte Carlo percentiles).`;

  const explanation = status.key === "onTrack"
    ? "Your current assumptions suggest your retirement target is sustainable through your selected planning age in the base scenario."
    : status.key === "close"
    ? "Your plan is close, but it becomes sensitive to return and inflation assumptions. Review the scenario table and stress test results before relying on this plan."
    : "Your current assumptions likely need changes to retire on your target timeline. Use the suggested actions below to test the biggest levers first.";

  return {
    baseDiag,
    scenarios,
    earliestRetirementAge,
    status,
    retireCoverage,
    age65Coverage,
    stressMatrix,
    scenarioMethodNote,
    explanation,
  };
}

function getScenarioSpecList(inputs) {
  const defaultSpread = Math.max(2, Math.min(4, inputs.returnVolatility || 2));
  const spread = inputs.scenarioMethod === "deterministicWide"
    ? Math.max(0.5, inputs.returnVolatility || 3)
    : defaultSpread;
  const retirementSpread = Math.max(0.5, Math.min(spread, Math.max(1, spread * 0.75)));
  return [
    {
      key: "conservative",
      label: "Conservative",
      overrides: {
        growthRate: Math.max(0, inputs.growthRate - spread),
        retirementReturn: Math.max(0, inputs.retirementReturn - retirementSpread),
      },
    },
    {
      key: "base",
      label: "Base",
      overrides: {
        growthRate: inputs.growthRate,
        retirementReturn: inputs.retirementReturn,
      },
    },
    {
      key: "optimistic",
      label: "Optimistic",
      overrides: {
        growthRate: inputs.growthRate + spread,
        retirementReturn: inputs.retirementReturn + retirementSpread,
      },
    },
  ];
}

function buildScenarioDiagnostics(inputs, overrides = {}) {
  const simInputs = { ...inputs, ...overrides };
  sanitizeInputs(simInputs);

  const currentAge = Math.max(0, simInputs.currentYear - simInputs.birthYear);
  const maxAge = Math.max(simInputs.lifeExpectancy, currentAge + 1);
  const yearsToRetirement = Math.max(0, simInputs.retirementAge - currentAge);
  const growth = simInputs.growthRate / 100;
  const retireGrowth = simInputs.retirementReturn / 100;
  const inflation = simInputs.inflationRate / 100;
  const contribGrowth = simInputs.contributionIncrease / 100;
  const spouseEnabled = Boolean(simInputs.spouseEnabled);

  let balance = simInputs.currentSavings;
  let contribution = simInputs.annualContribution;
  let targetSpend = simInputs.desiredIncome * Math.pow(1 + inflation, yearsToRetirement);
  let privatePensionAnnual = simInputs.privatePensionAnnual;
  let spousePrivatePensionAnnual = simInputs.spousePrivatePensionAnnual;
  const privatePensionGrowth = simInputs.privatePensionIncrease / 100;
  const spousePrivatePensionGrowth = simInputs.spousePrivatePensionIncrease / 100;

  const rows = [];
  let depletionAge = null;
  let peakShortfall = 0;
  let shortfallAtTargetRetirement = 0;

  for (let age = currentAge; age <= maxAge; age += 1) {
    const taxYear = simInputs.birthYear + age;
    const inRetirement = age >= simInputs.retirementAge;
    const annualReturn = inRetirement ? retireGrowth : growth;
    const startingBalance = balance;

    const cpp = age >= simInputs.cppStartAge ? cppAnnualAtAge(simInputs.cppAt65, simInputs.cppStartAge) : 0;
    const oas = age >= simInputs.oasStartAge ? oasAnnualAtAge(simInputs.oasAt65, simInputs.oasStartAge) : 0;
    const spouseCpp = spouseEnabled && age >= simInputs.spouseCppStartAge ? cppAnnualAtAge(simInputs.spouseCppAt65, simInputs.spouseCppStartAge) : 0;
    const spouseOas = spouseEnabled && age >= simInputs.spouseOasStartAge ? oasAnnualAtAge(simInputs.spouseOasAt65, simInputs.spouseOasStartAge) : 0;
    const privatePensionIncome = age >= simInputs.privatePensionStartAge ? privatePensionAnnual : 0;
    const spousePrivatePensionIncome = spouseEnabled && age >= simInputs.spousePrivatePensionStartAge ? spousePrivatePensionAnnual : 0;
    const pensionIncome = cpp + oas + spouseCpp + spouseOas + privatePensionIncome + spousePrivatePensionIncome;
    const oasIncome = oas + spouseOas;
    const oasRecipientCount = (oas > 0 ? 1 : 0) + (spouseOas > 0 ? 1 : 0);
    const spending = inRetirement ? targetSpend : 0;

    let requiredWithdrawal = 0;
    let actualWithdrawal = 0;
    let netIncome = pensionIncome;
    let shortfall = 0;
    let totalTax = 0;

    const preWithdrawalBalance = Math.max(0, startingBalance * (1 + annualReturn));

    if (!inRetirement) {
      balance = preWithdrawalBalance + contribution;
      contribution *= 1 + contribGrowth;
    } else {
      const solved = solveWithdrawalForAfterTaxTarget({
        netTarget: spending,
        pensionIncome,
        oasIncome,
        oasRecipientCount,
        inputs: simInputs,
        taxYear,
      });
      requiredWithdrawal = solved.withdrawal;
      totalTax = solved.totalTax;

      actualWithdrawal = Math.min(requiredWithdrawal, preWithdrawalBalance);
      const actualNet = afterTaxIncomeForWithdrawal(
        actualWithdrawal,
        pensionIncome,
        oasIncome,
        oasRecipientCount,
        simInputs,
        taxYear
      );
      netIncome = actualNet.netIncome;
      shortfall = Math.max(0, spending - netIncome);
      peakShortfall = Math.max(peakShortfall, shortfall);
      if (age === simInputs.retirementAge) shortfallAtTargetRetirement = shortfall;
      balance = Math.max(0, preWithdrawalBalance - actualWithdrawal);
      if (depletionAge === null && balance <= 0 && (requiredWithdrawal > 0 || actualWithdrawal > 0)) {
        depletionAge = age;
      }
      targetSpend *= 1 + inflation;
    }

    rows.push({
      age,
      taxYear,
      inRetirement,
      startingBalance,
      endingBalance: balance,
      spending,
      pensionIncome,
      oasIncome,
      oasRecipientCount,
      requiredWithdrawal,
      actualWithdrawal,
      netIncome,
      totalTax,
      shortfall,
    });

    if (age >= simInputs.privatePensionStartAge) privatePensionAnnual *= 1 + privatePensionGrowth;
    if (spouseEnabled && age >= simInputs.spousePrivatePensionStartAge) spousePrivatePensionAnnual *= 1 + spousePrivatePensionGrowth;
  }

  const retirementRow = rows.find((r) => r.age === simInputs.retirementAge) || rows.find((r) => r.inRetirement) || rows[rows.length - 1];
  const age65Row = rows.find((r) => r.age === 65) || rows[rows.length - 1];
  const age90Row = rows.find((r) => r.age === 90) || rows[rows.length - 1];

  return {
    rows,
    currentAge,
    retirementAge: simInputs.retirementAge,
    lifeExpectancy: simInputs.lifeExpectancy,
    depletionAge,
    peakShortfall,
    shortfallAtTargetRetirement,
    onTrack: peakShortfall < 1 && (!depletionAge || depletionAge > simInputs.lifeExpectancy),
    retirementRow,
    age65Row,
    age90Row,
    balanceAtRetirement: retirementRow?.startingBalance || 0,
    balanceAt65: age65Row?.startingBalance || 0,
    balanceAt90: age90Row?.startingBalance || 0,
  };
}

function findEarliestRetirementAge(inputs, currentAge, baseOverrides = {}) {
  for (let age = Math.max(currentAge, 45); age <= 70; age += 1) {
    const diagnostics = buildScenarioDiagnostics({ ...inputs, retirementAge: age }, baseOverrides);
    if (diagnostics.onTrack) return age;
  }
  return null;
}

function classifyOutcomeStatus(diagnostics, inputs, earliestRetirementAge) {
  if (diagnostics.onTrack) {
    return { key: "onTrack", icon: "🟢", label: "On track" };
  }

  const spendingTarget = diagnostics.retirementRow?.spending || inputs.desiredIncome || 1;
  const shortfallRatio = diagnostics.shortfallAtTargetRetirement / Math.max(1, spendingTarget);
  if (
    (diagnostics.depletionAge && diagnostics.depletionAge >= inputs.lifeExpectancy - 5) ||
    shortfallRatio <= 0.1 ||
    (Number.isFinite(earliestRetirementAge) && earliestRetirementAge <= inputs.retirementAge + 2)
  ) {
    return { key: "close", icon: "🟡", label: "Close" };
  }

  return { key: "notOnTrack", icon: "🔴", label: "Not on track" };
}

function estimateGuaranteedCoverageAtAge(inputs, age, baseDiag) {
  const row = baseDiag.rows.find((r) => r.age === age) || baseDiag.rows[baseDiag.rows.length - 1];
  if (!row) return { age, coverage: 0, guaranteedNet: 0, spending: 0 };
  const afterTaxGuaranteed = afterTaxIncomeForWithdrawal(
    0,
    row.pensionIncome || 0,
    row.oasIncome || 0,
    row.oasRecipientCount || 0,
    inputs,
    row.taxYear || inputs.currentYear
  ).netIncome;
  return {
    age,
    coverage: row.spending > 0 ? afterTaxGuaranteed / row.spending : 0,
    guaranteedNet: afterTaxGuaranteed,
    guaranteedGross: row.pensionIncome || 0,
    spending: row.spending || 0,
  };
}

function renderOutcomeSummary(analytics) {
  if (!el.outcomeSummaryCard) return;
  const { status, earliestRetirementAge, baseDiag, retireCoverage, age65Coverage, explanation } = analytics;
  const depletionText = baseDiag.depletionAge ? `Portfolio depletes around age ${baseDiag.depletionAge}` : "No portfolio depletion before your selected life expectancy";
  const shortfallText = baseDiag.shortfallAtTargetRetirement > 0
    ? `${money(baseDiag.shortfallAtTargetRetirement)} / yr after-tax shortfall at target retirement age`
    : "No first-year after-tax shortfall at your target retirement age in the base scenario";

  el.outcomeSummaryCard.innerHTML = `
    <div class="outcome-status-pill status-${escapeHtml(status.key)}" role="status" aria-live="polite">
      <span class="status-icon" aria-hidden="true">${escapeHtml(status.icon)}</span>
      <span>${escapeHtml(status.label)}</span>
    </div>
    <div class="outcome-metrics-grid">
      <div class="outcome-metric">
        <span class="label">Earliest retirement age that meets target</span>
        <strong>${earliestRetirementAge === null ? "Not found (<= 70)" : escapeHtml(String(earliestRetirementAge))}</strong>
      </div>
      <div class="outcome-metric">
        <span class="label">Shortfall at target retirement age</span>
        <strong>${escapeHtml(shortfallText)}</strong>
      </div>
      <div class="outcome-metric">
        <span class="label">Guaranteed income coverage at retirement age</span>
        <strong>${escapeHtml(pct(Math.max(0, retireCoverage.coverage)))} (${escapeHtml(money(retireCoverage.guaranteedNet))} net est.)</strong>
      </div>
      <div class="outcome-metric">
        <span class="label">Guaranteed income coverage at age 65</span>
        <strong>${escapeHtml(pct(Math.max(0, age65Coverage.coverage)))} (${escapeHtml(money(age65Coverage.guaranteedNet))} net est.)</strong>
      </div>
    </div>
    <p class="outcome-explainer">${escapeHtml(explanation)}</p>
    <p class="muted small-copy">${escapeHtml(depletionText)}</p>
  `;
}

function renderScenarioTable(analytics) {
  if (!el.scenarioTableBody) return;
  if (el.scenarioTableNote) el.scenarioTableNote.textContent = analytics.scenarioMethodNote;

  el.scenarioTableBody.innerHTML = analytics.scenarios
    .map((row) => {
      const d = row.diagnostics;
      const returnLabel = `${row.overrides.growthRate.toFixed(1)}% / ${row.overrides.retirementReturn.toFixed(1)}% retire`;
      const inflationLabel = `${state.inputs.inflationRate.toFixed(1)}% infl.`;
      return `
        <tr>
          <td>${escapeHtml(row.label)}</td>
          <td>${escapeHtml(returnLabel)} • ${escapeHtml(inflationLabel)}</td>
          <td>${money(d.balanceAtRetirement)}</td>
          <td>${money(d.balanceAt65)}</td>
          <td>${money(d.balanceAt90)}</td>
          <td>${d.depletionAge ? `Age ${d.depletionAge}` : "Never"}</td>
          <td>${d.peakShortfall > 0 ? money(d.peakShortfall) : "None"}</td>
        </tr>`;
    })
    .join("");
}

function renderStressTest(analytics) {
  if (el.stressTestPanel) el.stressTestPanel.hidden = !(ui.mode === "advanced" && state.inputs.stressTestEnabled);
  if (!el.stressTestBody || !state.inputs.stressTestEnabled) return;

  el.stressTestBody.innerHTML = analytics.stressMatrix
    .map((row) => {
      const cells = row.cells
        .map((cell) => `
          <td>
            <div class="stress-cell">
              <span class="stress-badge status-${escapeHtml(cell.status.key)}">${escapeHtml(cell.status.icon)} ${escapeHtml(cell.status.label)}</span>
              <span>Earliest: ${cell.earliestRetirementAge ?? "n/a"}</span>
              <span>Depletion: ${cell.diagnostics.depletionAge ? `Age ${cell.diagnostics.depletionAge}` : "Never"}</span>
              <span>Shortfall: ${cell.diagnostics.shortfallAtTargetRetirement > 0 ? money(cell.diagnostics.shortfallAtTargetRetirement) : "None"}</span>
            </div>
          </td>`)
        .join("");
      return `<tr><th>${row.growthRate.toFixed(1)}%</th>${cells}</tr>`;
    })
    .join("");
}

function renderTaxGuidance(inputs, projection, analytics) {
  if (!el.taxGuidanceBody) return;

  const bucketSum = inputs.rrspBalance + inputs.tfsaBalance + inputs.nonRegisteredBalance;
  const bucketGap = Math.abs(bucketSum - inputs.currentSavings);
  const bridgeTargetBracket = TAX_2026.federal[1][0];
  const oasClawbackThreshold = inputs.oasClawbackEnabled ? inputs.oasClawbackThreshold : null;

  const bridgeItems = [];
  if (inputs.withdrawalStrategy === "rrspFirst") {
    bridgeItems.push("Simple comparison mode: draw RRSP/RRIF first, then non-registered, and preserve TFSA for later top-ups and shocks.");
  } else if (inputs.withdrawalStrategy === "tfsaFirst") {
    bridgeItems.push("TFSA-first comparison mode: use TFSA for early top-ups to reduce taxable income, then non-registered, with RRSP/RRIF deferred.");
  } else {
    bridgeItems.push(`Tax-smart heuristic: before age 65, consider filling lower tax brackets with RRSP withdrawals (for example up to roughly ${money(bridgeTargetBracket)} taxable income federally, before province-specific effects).`);
    bridgeItems.push("Use non-registered accounts next for flexibility, and preserve TFSA room/value for later tax-free top-ups or market shocks where possible.");
  }
  if (inputs.tfsaBalance > 0) bridgeItems.push("TFSA withdrawals do not increase taxable income in this planner, so they can be useful for one-time spending or gap years.");

  const age65Items = [];
  age65Items.push("After age 65, aim for a steadier taxable income level year-to-year instead of large RRSP/RRIF spikes when possible.");
  if (oasClawbackThreshold) {
    age65Items.push(`If OAS clawback is enabled, try to keep taxable income near or below the estimated threshold (${money(oasClawbackThreshold)} per OAS recipient, planning estimate) and use TFSA for top-ups.`);
  } else {
    age65Items.push("Consider enabling OAS clawback estimation in Advanced mode if your retirement income could approach the OAS recovery threshold.");
  }
  age65Items.push("Use TFSA withdrawals for discretionary spending, health costs, or large purchases without increasing taxable income.");

  const whyItems = [
    "Smoother taxable income can reduce lifetime taxes and avoid higher marginal brackets in later years.",
    "Preserving TFSA flexibility can improve resilience if returns or inflation are worse than expected.",
    "RRSP/RRIF drawdown planning matters more when guaranteed income (CPP/OAS/private pensions) already covers a large share of spending.",
  ];
  if (bucketGap > 5_000) {
    whyItems.push(`Your account buckets differ from total current savings by about ${money(bucketGap)}. Update the optional bucket balances for more accurate withdrawal guidance.`);
  }

  el.taxGuidanceBody.innerHTML = `
    <section class="guidance-card" aria-labelledby="guidanceBridgeTitle">
      <h4 id="guidanceBridgeTitle">Bridge period (retirement to 65)</h4>
      <ul>${bridgeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <section class="guidance-card" aria-labelledby="guidance65Title">
      <h4 id="guidance65Title">Age 65+</h4>
      <ul>${age65Items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <section class="guidance-card" aria-labelledby="guidanceWhyTitle">
      <h4 id="guidanceWhyTitle">Why this may help (heuristic)</h4>
      <ul>${whyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <p class="muted small-copy">Current strategy view: <strong>${escapeHtml(
        inputs.withdrawalStrategy === "taxSmart" ? "Tax-smart (heuristic)" : inputs.withdrawalStrategy === "rrspFirst" ? "Simple (RRSP first)" : "TFSA first (comparison)"
      )}</strong></p>
    </section>
  `;
}

function renderActions(inputs, projection, analytics) {
  if (!el.actionsList) return;

  const actions = [];
  const earliest = analytics.earliestRetirementAge;
  const targetRetireAge = inputs.retirementAge;
  const yearsToRetire = Math.max(0, projection.yearsToRetirement);

  if (earliest !== null && earliest > targetRetireAge) {
    const ageGap = earliest - targetRetireAge;
    const extraSavingsEstimate = Math.max(1_000, Math.round((analytics.baseDiag.shortfallAtTargetRetirement * 0.45) / 500) * 500);
    actions.push(`To retire at ${targetRetireAge} instead of ${earliest}, test increasing annual savings by about ${money(extraSavingsEstimate)} and rerun the plan.`);
    actions.push(`If retiring at ${targetRetireAge} is non-negotiable, test reducing after-tax retirement spending by ${money(Math.round(analytics.baseDiag.shortfallAtTargetRetirement / 100) * 100)} to see the impact on sustainability.`);
    if (ageGap > 0) actions.push(`Delaying retirement by ${ageGap} year${ageGap === 1 ? "" : "s"} (to age ${earliest}) is the earliest on-track age under your current base assumptions.`);
  } else if (analytics.baseDiag.onTrack) {
    actions.push(`Your base plan is on track. Save a comparison scenario with retirement returns reduced by 1-2% to see how much cushion you have.`);
  }

  if (inputs.cppStartAge < 70) {
    const cppIncreaseAnnual = Math.max(0, cppAnnualAtAge(inputs.cppAt65, 70) - cppAnnualAtAge(inputs.cppAt65, inputs.cppStartAge));
    if (cppIncreaseAnnual > 0) {
      actions.push(`If you delay CPP from age ${inputs.cppStartAge} to age 70, your estimated CPP increases by about ${money(cppIncreaseAnnual / 12)}/month (planning estimate).`);
    }
  }

  if (inputs.oasClawbackEnabled && projection.retirementOasClawback > 0) {
    actions.push(`Your year-1 retirement estimate includes about ${money(projection.retirementOasClawback)} of OAS clawback. Test lower taxable withdrawals (or more TFSA top-ups) to reduce clawback risk.`);
  }

  const worstScenario = analytics.scenarios.find((s) => s.key === "conservative")?.diagnostics;
  if (analytics.baseDiag.onTrack && worstScenario && !worstScenario.onTrack) {
    actions.push("Your plan works in the base scenario but not in the conservative scenario. Review the stress test and consider a lower return assumption for planning.");
  }

  const bucketSum = inputs.rrspBalance + inputs.tfsaBalance + inputs.nonRegisteredBalance;
  if (bucketSum > 0) {
    const taxableWeight = bucketSum > 0 ? (inputs.rrspBalance + inputs.nonRegisteredBalance) / bucketSum : 0;
    if (taxableWeight > 0.75 && inputs.tfsaBalance < inputs.rrspBalance) {
      actions.push("Most of your optional account buckets are taxable (RRSP/non-registered). Consider prioritizing TFSA contributions for future flexibility if your room allows.");
    }
  }

  if (actions.length < 3) {
    actions.push(`Stress test your plan at ${Math.max(0, inputs.growthRate - 1).toFixed(1)}% to ${inputs.growthRate.toFixed(1)}% returns and 2-3% inflation before relying on a single forecast.`);
    actions.push("Review private pension and CPP/OAS estimates annually using official statements and update this planner when your assumptions change.");
  }

  el.actionsList.innerHTML = actions.slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderSnapshot(projection) {
  const items = [
    { label: "Current age", value: String(projection.currentAge), sub: `Birth year ${state.inputs.birthYear}` },
    { label: "Years to retire", value: String(projection.yearsToRetirement), sub: `Retire at age ${state.inputs.retirementAge}` },
    { label: "Nest egg at retirement", value: money(projection.projectedAtRetirement), sub: "Projected balance when retirement starts" },
    { label: "Pensions & benefits / yr", value: money(projection.selectedPensionAnnual), sub: "Private pension + selected CPP/OAS timing" },
    { label: "Funding ratio", value: pct(projection.fundedRatio / 100), sub: projection.firstShortfallAge ? `Shortfall estimate at age ${projection.firstShortfallAge}` : "No shortfall before life expectancy" },
  ];

  if (!el.snapshotGrid) return;
  el.snapshotGrid.innerHTML = items
    .map(
      (item) => `
        <article class="snapshot-item">
          <span class="label">${escapeHtml(item.label)}</span>
          <strong class="value">${escapeHtml(item.value)}</strong>
          <span class="sub">${escapeHtml(item.sub)}</span>
        </article>`
    )
    .join("");
}

function renderResults(projection, analytics) {
  const cards = [
    {
      label: "Retirement spending target (year 1, after tax)",
      value: money(projection.retirementSpending),
      detail:
        projection.yearsToRetirement > 0
          ? `Inflation-adjusted from today's ${money(state.inputs.desiredIncome)}`
          : "Inflation-adjusted in later retirement years",
    },
    {
      label: "Portfolio withdrawal need (year 1)",
      value: money(projection.retirementWithdrawalNeed),
      detail: `Grossed up from after-tax gap of ${money(projection.retirementAfterTaxGapAfterPensions)} after pensions/benefits`,
    },
    {
      label: "4% income estimate at retirement",
      value: money(projection.safeIncomeAtRetirement),
      detail: "Simple rule-of-thumb based on projected nest egg",
    },
    {
      label: "Estimated taxes (year 1 retirement)",
      value: money(projection.retirementTaxTotal),
      detail:
        state.inputs.oasClawbackEnabled && projection.retirementOasClawback > 0
          ? `${money(projection.retirementOasClawback)} includes estimated OAS clawback`
          : `${money(projection.retirementTaxOnWithdrawal)} attributable to savings withdrawal`,
    },
    {
      label: "Balance at life expectancy",
      value: money(projection.finalBalance),
      detail: projection.firstShortfallAge ? `Depletes around age ${projection.firstShortfallAge}` : "Projected balance remains positive",
    },
  ];

  if (!el.resultsGrid) return;
  el.resultsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="result-card">
          <span class="result-label">${escapeHtml(card.label)}</span>
          <strong class="result-value">${escapeHtml(card.value)}</strong>
          <span class="result-detail">${escapeHtml(card.detail)}</span>
        </article>`
    )
    .join("");
}

function renderRetirementBreakdown(projection, analytics) {
  if (!el.retirementBreakdownDetails) return;

  const pensionLabel = (state.inputs.privatePensionName || "Private pension").trim() || "Private pension";
  const spousePensionLabel = (state.inputs.spousePrivatePensionName || "Spouse pension").trim() || "Spouse pension";
  const spouseEnabled = Boolean(state.inputs.spouseEnabled);
  const rows = [
    ["After-tax spending target", money(projection.retirementSpending)],
    ["Pensions & benefits (gross)", money(projection.retirementPensionIncome)],
    [`${pensionLabel} (included above)`, money(projection.selectedPrivatePensionAnnual)],
    ...(spouseEnabled ? [[`${spousePensionLabel} (included above)`, money(projection.selectedSpousePrivatePensionAnnual)]] : []),
    ["Your CPP + OAS (included above)", money(Math.max(0, projection.selectedGovBenefitAnnual - projection.selectedSpouseGovBenefitAnnual))],
    ...(spouseEnabled ? [["Spouse CPP + OAS (included above)", money(projection.selectedSpouseGovBenefitAnnual)]] : []),
    ["CPP + OAS household total (included above)", money(projection.selectedGovBenefitAnnual)],
    ["Tax on pensions & benefits (est.)", money(projection.retirementTaxOnPensions)],
    ...(state.inputs.oasClawbackEnabled
      ? [["OAS clawback (est., included in tax)", money(projection.retirementOasClawback)]]
      : []),
    ...(state.inputs.oasClawbackEnabled
      ? [["OAS clawback from savings withdrawal impact (est.)", money(projection.retirementOasClawbackOnWithdrawal)]]
      : []),
    ["Pensions & benefits (net after tax)", money(projection.retirementPensionNetIncome)],
    ["Remaining after-tax need from savings", money(projection.retirementAfterTaxGapAfterPensions)],
    ["Savings withdrawal (gross, excludes pension income)", money(projection.retirementWithdrawalNeed)],
    ["Tax on savings withdrawal only (est.)", money(projection.retirementTaxOnWithdrawal)],
    ["Savings withdrawal net cash", money(projection.retirementWithdrawalNetCash)],
    ...(analytics?.baseDiag?.shortfallAtTargetRetirement > 0
      ? [["Unfunded spending (year 1, after tax)", money(analytics.baseDiag.shortfallAtTargetRetirement)]]
      : []),
    ["Total retirement tax (est.)", money(projection.retirementTaxTotal)],
    ["Net income after tax", money(projection.retirementNetIncome)],
    ["Gross income before tax", money(projection.retirementGrossIncome)],
  ];

  el.retirementBreakdownDetails.innerHTML = rows
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
}

function renderTaxTable(inputs) {
  const incomes = [50_000, 100_000, 150_000, 200_000, 250_000];
  if (!el.taxTableBody) return;
  const province = PROVINCE_TAX_2026[inputs.provinceCode] || PROVINCE_TAX_2026.NL;

  if (el.taxTitle) {
    el.taxTitle.textContent = `2026 Effective Tax Rate (${province.name} Estimate)`;
  }
  if (el.taxSubtitle) {
    el.taxSubtitle.textContent = province.source === "RQ"
      ? `Uses CRA 2026 federal + Revenu Québec 2026 Quebec thresholds/rates (planning estimate, not filing; excludes credits and surtaxes).`
      : `Uses CRA 2026 federal + ${province.name} thresholds/rates (planning estimate, not filing; excludes credits and surtaxes).`;
  }

  el.taxTableBody.innerHTML = incomes
    .map((income) => {
      const tax = estimateCombinedTax(income, inputs);
      return `
        <tr>
          <td>${money(income)}</td>
          <td>${money(tax.federal)}</td>
          <td>${money(tax.provincial)}</td>
          <td>${money(tax.total)}</td>
          <td>${pct(tax.total / income)}</td>
        </tr>`;
    })
    .join("");
}

function estimateCombinedTax(income, inputs, taxYear = inputs.currentYear) {
  const factor = bracketScaleFactor(inputs, taxYear);
  const federalBrackets = scaleBrackets(TAX_2026.federal, factor);
  const provincialSource = PROVINCE_TAX_2026[inputs.provinceCode] || PROVINCE_TAX_2026.NL;
  const provincialBrackets = scaleBrackets(provincialSource.brackets, factor);

  const federal = marginalTax(income, federalBrackets);
  const provincial = marginalTax(income, provincialBrackets);
  return { federal, provincial, total: federal + provincial };
}

function bracketScaleFactor(inputs, taxYear = inputs.currentYear) {
  if (!inputs.escalateBrackets) return 1;
  if (taxYear <= 2026) return 1;
  return Math.pow(1 + inputs.inflationRate / 100, taxYear - 2026);
}

function scaleBrackets(brackets, factor) {
  if (factor === 1) return brackets;
  return brackets.map(([limit, rate]) => [Number.isFinite(limit) ? limit * factor : Infinity, rate]);
}

function marginalTax(income, brackets) {
  let taxed = 0;
  let prev = 0;
  let remaining = income;

  for (const [limit, rate] of brackets) {
    if (remaining <= 0) break;
    const span = Math.min(limit - prev, remaining);
    taxed += Math.max(0, span) * rate;
    remaining -= span;
    prev = limit;
  }
  return taxed;
}

function solveWithdrawalForAfterTaxTarget({ netTarget, pensionIncome, oasIncome, oasRecipientCount, inputs, taxYear }) {
  const base = afterTaxIncomeForWithdrawal(0, pensionIncome, oasIncome, oasRecipientCount, inputs, taxYear);
  const baseTax = base.totalTax;
  const baseNet = base.netIncome;
  if (baseNet >= netTarget) {
    return {
      withdrawal: 0,
      totalTax: baseTax,
      taxOnWithdrawal: 0,
      oasClawback: base.oasClawback,
      oasClawbackOnWithdrawal: 0,
      netIncome: baseNet,
    };
  }

  let low = 0;
  let high = Math.max(10_000, netTarget * 2);
  let highNet = afterTaxIncomeForWithdrawal(high, pensionIncome, oasIncome, oasRecipientCount, inputs, taxYear).netIncome;

  // Expand the search bound until the net target is reachable.
  let guard = 0;
  while (highNet < netTarget && guard < 24) {
    high *= 2;
    highNet = afterTaxIncomeForWithdrawal(high, pensionIncome, oasIncome, oasRecipientCount, inputs, taxYear).netIncome;
    guard += 1;
  }

  for (let i = 0; i < 28; i += 1) {
    const mid = (low + high) / 2;
    const probe = afterTaxIncomeForWithdrawal(mid, pensionIncome, oasIncome, oasRecipientCount, inputs, taxYear);
    if (probe.netIncome >= netTarget) high = mid;
    else low = mid;
  }

  const result = afterTaxIncomeForWithdrawal(high, pensionIncome, oasIncome, oasRecipientCount, inputs, taxYear);
  return {
    withdrawal: high,
    totalTax: result.totalTax,
    taxOnWithdrawal: Math.max(0, result.totalTax - baseTax),
    oasClawback: result.oasClawback,
    oasClawbackOnWithdrawal: Math.max(0, result.oasClawback - base.oasClawback),
    netIncome: result.netIncome,
  };
}

function afterTaxIncomeForWithdrawal(withdrawal, pensionIncome, oasIncome, oasRecipientCount, inputs, taxYear) {
  const gross = pensionIncome + withdrawal;
  const incomeTax = estimateCombinedTax(gross, inputs, taxYear).total;
  const oasClawback = estimateOasClawback(gross, oasIncome, oasRecipientCount, inputs, taxYear);
  const tax = incomeTax + oasClawback;
  return {
    grossIncome: gross,
    incomeTax,
    oasClawback,
    totalTax: tax,
    netIncome: gross - tax,
  };
}

function estimateOasClawback(grossIncome, oasIncome, oasRecipientCount, inputs, taxYear) {
  if (!inputs.oasClawbackEnabled) return 0;
  if (!Number.isFinite(oasIncome) || oasIncome <= 0) return 0;
  const recipients = Math.max(0, Math.floor(oasRecipientCount || 0));
  if (recipients <= 0) return 0;

  const thresholdPerRecipient = inputs.oasClawbackThreshold * bracketScaleFactor(inputs, taxYear);
  const threshold = thresholdPerRecipient * recipients;
  const excess = Math.max(0, grossIncome - threshold);
  const recovery = excess * (inputs.oasClawbackRate / 100);
  return Math.max(0, Math.min(oasIncome, recovery));
}

function renderPensionScenarios(inputs) {
  if (!el.pensionScenarioBody) return;
  const rows = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]
    .filter((age) => age >= 60 && age <= 70)
    .map((age) => {
      const cpp = age >= 60 ? cppAnnualAtAge(inputs.cppAt65, age) : 0;
      const oas = age >= 65 ? oasAnnualAtAge(inputs.oasAt65, age) : 0;
      return { age, cpp, oas, total: cpp + oas };
    });

  el.pensionScenarioBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.age}</td>
          <td>${money(row.cpp)}</td>
          <td>${row.age < 65 ? "-" : money(row.oas)}</td>
          <td>${money(row.total)}</td>
        </tr>`
    )
    .join("");
}

function renderSelectedPension(inputs, projection) {
  if (!el.selectedPensionDetails) return;
  const cppSelected = cppAnnualAtAge(inputs.cppAt65, inputs.cppStartAge);
  const oasSelected = oasAnnualAtAge(inputs.oasAt65, inputs.oasStartAge);
  const spouseCppSelected = cppAnnualAtAge(inputs.spouseCppAt65, inputs.spouseCppStartAge);
  const spouseOasSelected = oasAnnualAtAge(inputs.spouseOasAt65, inputs.spouseOasStartAge);
  const privatePensionLabel = (inputs.privatePensionName || "Private pension").trim() || "Private pension";
  const spousePrivatePensionLabel = (inputs.spousePrivatePensionName || "Spouse pension").trim() || "Spouse pension";
  const details = [
    [privatePensionLabel, money(projection.selectedPrivatePensionAnnual)],
    ["Private pension start age", String(inputs.privatePensionStartAge)],
    ["Private pension increase", `${inputs.privatePensionIncrease.toFixed(1)}% / yr`],
    ["Spouse mode", inputs.spouseEnabled ? "On" : "Off"],
    ...(inputs.spouseEnabled
      ? [
          [spousePrivatePensionLabel, money(projection.selectedSpousePrivatePensionAnnual)],
          ["Spouse private pension start age", String(inputs.spousePrivatePensionStartAge)],
          ["Spouse private pension increase", `${inputs.spousePrivatePensionIncrease.toFixed(1)}% / yr`],
        ]
      : []),
    ["CPP start age", String(inputs.cppStartAge)],
    ["CPP annual estimate", money(cppSelected)],
    ["OAS start age", String(inputs.oasStartAge)],
    ["OAS annual estimate", money(oasSelected)],
    ...(inputs.spouseEnabled
      ? [
          ["Spouse CPP start age", String(inputs.spouseCppStartAge)],
          ["Spouse CPP annual estimate", money(spouseCppSelected)],
          ["Spouse OAS start age", String(inputs.spouseOasStartAge)],
          ["Spouse OAS annual estimate", money(spouseOasSelected)],
        ]
      : []),
    ["Gov benefits annual total", money(projection.selectedGovBenefitAnnual)],
    ["OAS clawback estimate", inputs.oasClawbackEnabled ? "On (household approximation)" : "Off"],
    ...(inputs.oasClawbackEnabled
      ? [
          ["Clawback threshold (per recipient)", money(inputs.oasClawbackThreshold)],
          ["Clawback rate", `${inputs.oasClawbackRate.toFixed(1)}%`],
        ]
      : []),
    ["Combined annual pensions/benefits", money(projection.selectedPensionAnnual)],
    ["First-year portfolio draw", money(projection.retirementWithdrawalNeed)],
    ["Tax brackets escalate", inputs.escalateBrackets ? "Yes" : "No"],
    ["Risk profile", RISK_PRESETS[inputs.riskProfile]?.label || inputs.riskProfile],
  ];

  el.selectedPensionDetails.innerHTML = details
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
}

function renderChart(projection) {
  const canvas = el.chart;
  if (!canvas || !projection) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width || canvas.width));
  const height = 420;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const rows = projection.rows;
  const pad = { top: 18, right: 16, bottom: 44, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);

  const maxY = Math.max(
    1,
    ...rows.map((r) => r.balance),
    ...rows.map((r) => r.lowerBalance || 0),
    ...rows.map((r) => r.upperBalance || 0),
    ...rows.map((r) => r.spending),
    ...rows.map((r) => r.pensionIncome)
  );

  const x = (idx) => pad.left + (idx / Math.max(1, rows.length - 1)) * innerW;
  const y = (value) => pad.top + innerH - (value / maxY) * innerH;

  drawChartBackground(ctx, width, height, pad, innerW, innerH, maxY);

  drawUncertaintyBand(ctx, rows, x, y);

  const balancePoints = rows.map((row, i) => ({ x: x(i), y: y(row.balance) }));
  ctx.beginPath();
  traceSmoothPath(ctx, balancePoints);
  ctx.lineTo(x(rows.length - 1), y(0));
  ctx.lineTo(x(0), y(0));
  ctx.closePath();
  const areaGradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + innerH);
  areaGradient.addColorStop(0, "rgba(15,106,191,0.9)");
  areaGradient.addColorStop(1, "rgba(15,106,191,0.18)");
  ctx.fillStyle = areaGradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(15,106,191,0.95)";
  ctx.lineWidth = 2.25;
  ctx.beginPath();
  traceSmoothPath(ctx, balancePoints);
  ctx.stroke();

  drawSeriesLine(ctx, rows, x, y, "spending", "#2f3542", 2.5);
  drawSeriesLine(ctx, rows, x, y, "pensionIncome", "#0ea5a8", 2.25, [6, 5]);

  const retireIdx = rows.findIndex((r) => r.age === state.inputs.retirementAge);
  if (retireIdx >= 0) {
    const rx = x(retireIdx);
    ctx.strokeStyle = "rgba(23,32,51,0.35)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(rx, pad.top);
    ctx.lineTo(rx, pad.top + innerH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#172033";
    ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText("Retirement", Math.min(rx + 6, width - 72), pad.top + 14);
  }

  ctx.fillStyle = "#506176";
  ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
  rows.forEach((row, i) => {
    if (i % Math.ceil(rows.length / 14) !== 0 && i !== rows.length - 1) return;
    const px = x(i);
    ctx.fillText(String(row.age), px - 8, height - 14);
  });
}

function drawChartBackground(ctx, width, height, pad, innerW, innerH, maxY) {
  const gridLines = 4;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#eaf0f8";
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridLines; i += 1) {
    const yPos = pad.top + (i / gridLines) * innerH;
    ctx.beginPath();
    ctx.moveTo(pad.left, yPos);
    ctx.lineTo(pad.left + innerW, yPos);
    ctx.stroke();

    const labelValue = ((gridLines - i) / gridLines) * maxY;
    ctx.fillStyle = "#64748b";
    ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(shortMoney(labelValue), 6, yPos + 4);
  }

  ctx.strokeStyle = "#dce6f3";
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + innerH);
  ctx.lineTo(pad.left + innerW, pad.top + innerH);
  ctx.stroke();
}

function drawSeriesLine(ctx, rows, x, y, key, color, width, dash = []) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  const points = rows.map((row, i) => ({ x: x(i), y: y(row[key]) }));
  traceSmoothPath(ctx, points);
  ctx.stroke();
  ctx.restore();
}

function drawUncertaintyBand(ctx, rows, x, y) {
  const upper = rows.map((row, i) => ({ x: x(i), y: y(row.upperBalance ?? row.balance) }));
  const lower = rows.map((row, i) => ({ x: x(i), y: y(row.lowerBalance ?? row.balance) }));
  if (upper.length < 2 || lower.length < 2) return;

  ctx.save();
  ctx.beginPath();
  traceSmoothPath(ctx, upper);
  const lowerRev = [...lower].reverse();
  traceSmoothPath(ctx, lowerRev, { moveToStart: false });
  ctx.closePath();
  ctx.fillStyle = "rgba(15, 106, 191, 0.10)";
  ctx.fill();

  ctx.strokeStyle = "rgba(15, 106, 191, 0.18)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  traceSmoothPath(ctx, upper);
  ctx.stroke();
  ctx.beginPath();
  traceSmoothPath(ctx, lower);
  ctx.stroke();
  ctx.restore();
}

function traceSmoothPath(ctx, points, options = {}) {
  const { moveToStart = true } = options;
  if (!points.length) return;
  if (points.length === 1) {
    if (moveToStart) ctx.moveTo(points[0].x, points[0].y);
    else ctx.lineTo(points[0].x, points[0].y);
    return;
  }

  if (moveToStart) ctx.moveTo(points[0].x, points[0].y);
  else ctx.lineTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    if (i === 0) {
      ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
    } else {
      ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
    }
    if (i === points.length - 2) {
      ctx.quadraticCurveTo(p1.x, p1.y, p1.x, p1.y);
    }
  }
}

function getUncertaintyReturnAdjustments(riskProfile) {
  if (riskProfile === "conservative") return { preretire: 0.0125, retire: 0.01 };
  if (riskProfile === "aggressive") return { preretire: 0.035, retire: 0.025 };
  return { preretire: 0.0225, retire: 0.0175 };
}

function saveState() {
  try {
    state.meta.lastSavedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    markDirty(false);
    showToast("Saved to this browser");
  } catch {
    showToast("Save failed (storage unavailable)");
  }
}

function exportJson() {
  try {
    const payload = { ...state, meta: { ...state.meta, version: BACKUP_VERSION } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retirement-planner-${dateStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Exported planner JSON");
  } catch {
    showToast("Export failed");
  }
}

function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state = normalizeState(parsed);
      hydrateForm();
      renderAll();
      markDirty(true);
      showToast("Imported planner JSON");
    } catch {
      showToast("Import failed: invalid JSON");
    } finally {
      if (el.importFile) el.importFile.value = "";
    }
  };
  reader.readAsText(file);
}

function loadDemoScenario() {
  state = clone(DEFAULT_STATE);
  hydrateForm();
  applyUiMode();
  renderAll();
  markDirty(true);
  showToast("Loaded demo scenario");
}

function resetDemo() {
  state = clone(DEFAULT_STATE);
  if (el.notes) {
    state.notes = "";
  }
  hydrateForm();
  applyUiMode();
  renderAll();
  markDirty(true);
  showToast("Reset app");
}

function markDirty(isDirty) {
  ui.dirty = isDirty;
  if (!el.storageStatus) return;
  if (isDirty) {
    el.storageStatus.textContent = "Unsaved changes";
    return;
  }

  if (state.meta.lastSavedAt) {
    el.storageStatus.textContent = `Saved ${formatDateTime(state.meta.lastSavedAt)}`;
  } else {
    el.storageStatus.textContent = "Ready";
  }
}

function showToast(message) {
  if (!el.toast) return;
  el.toast.textContent = message;
  el.toast.hidden = false;
  clearTimeout(ui.toastTimer);
  ui.toastTimer = setTimeout(() => {
    if (el.toast) el.toast.hidden = true;
  }, 1800);
}

function money(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function shortMoney(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${Math.round(value)}`;
}

function pct(value) {
  return `${(Math.max(0, value) * 100).toFixed(0)}%`;
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "recently";
  }
}

function dateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
