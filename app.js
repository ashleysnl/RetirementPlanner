const APP = {
  storageKey: "retirementPlanner.plan.v2",
  version: 2,
  currentYear: new Date().getFullYear(),
  defaultProvince: "NL",
};

const PROVINCES = {
  NL: "Newfoundland and Labrador",
  PE: "Prince Edward Island",
  NS: "Nova Scotia",
  NB: "New Brunswick",
  QC: "Quebec",
  ON: "Ontario",
  MB: "Manitoba",
  SK: "Saskatchewan",
  AB: "Alberta",
  BC: "British Columbia",
};

const RISK_RETURNS = {
  conservative: 0.04,
  balanced: 0.055,
  aggressive: 0.07,
};

const TOOLTIPS = {
  province: {
    term: "Province",
    plain: "Your province changes estimated provincial tax and benefit context.",
    why: "Taxes can materially change retirement income needs.",
    range: "All Canadian provinces are available. Default: NL.",
    example: "A plan in NL may estimate a different tax burden than the same income in ON.",
  },
  birthYear: {
    term: "Year of birth",
    plain: "Used to estimate your age each year in the projection.",
    why: "Age controls CPP/OAS start timing and retirement duration.",
    range: "Typical range: 1940-2008.",
    example: "Born in 1985 means age 65 in 2050.",
  },
  retirementAge: {
    term: "Retirement age",
    plain: "Age when your plan switches from saving to drawing income.",
    why: "Earlier retirement means fewer saving years and longer drawdown years.",
    range: "Typical range: 55-70.",
    example: "Retiring at 60 instead of 65 increases years your savings must support.",
  },
  lifeExpectancy: {
    term: "Life expectancy",
    plain: "How long the model projects your retirement spending.",
    why: "Longer horizon requires more assets or lower annual spending.",
    range: "Typical planning range: 85-100.",
    example: "Planning to age 95 tests longevity risk.",
  },
  desiredSpending: {
    term: "Desired retirement spending",
    plain: "Your annual after-tax spending goal in today’s dollars.",
    why: "This is the target your income sources and savings must cover.",
    range: "Varies by household and location.",
    example: "$60,000 today at 2% inflation is about $73,000 in 10 years.",
  },
  inflation: {
    term: "Inflation",
    plain: "Annual increase applied to future spending and optionally tax brackets.",
    why: "Higher inflation can raise the long-term draw required from savings.",
    range: "Typical long-term assumption: 1.5%-3.0%.",
    example: "At 2%, costs roughly double in about 36 years.",
  },
  currentSavings: {
    term: "Current total savings",
    plain: "Your starting investable balance across all accounts.",
    why: "Starting balance is a major driver of retirement readiness.",
    range: "Any non-negative value.",
    example: "$200,000 today compounds over your remaining working years.",
  },
  annualContribution: {
    term: "Annual contribution",
    plain: "How much you add to savings each year before retirement.",
    why: "Regular contributions can significantly increase retirement assets.",
    range: "Any non-negative value.",
    example: "$8,000 per year for 20 years adds $160,000 before growth.",
  },
  contributionIncrease: {
    term: "Contribution increase (%/year)",
    plain: "Annual percentage increase applied to your savings contribution before retirement.",
    why: "Gradually increasing contributions can materially improve retirement readiness.",
    range: "Typical range: 0%-5% per year.",
    example: "A $10,000 contribution growing 3% yearly becomes about $13,439 in year 10.",
  },
  capitalInjectAmount: {
    term: "Lump-sum amount",
    plain: "A one-time amount added to investable assets at a specific age.",
    why: "Large one-time proceeds can materially improve retirement sustainability.",
    range: "Any non-negative value.",
    example: "Downsizing a home might add a $150,000 one-time injection at age 67.",
  },
  capitalInjectAge: {
    term: "Lump-sum age",
    plain: "The age when the one-time capital injection is received.",
    why: "Timing changes compounding and how long the capital supports spending.",
    range: "Typical planning range: 50-95.",
    example: "A lump sum at 60 has more time to compound than the same amount at 75.",
  },
  riskProfile: {
    term: "Risk profile",
    plain: "Maps to default long-term return assumptions.",
    why: "Expected returns directly affect projected balances.",
    range: "Conservative, Balanced, Aggressive.",
    example: "Balanced defaults near 5.5% nominal annual return.",
  },
  pensionAmount: {
    term: "Workplace pension amount",
    plain: "Annual pension income before tax once it starts.",
    why: "Guaranteed income reduces withdrawal pressure on savings.",
    range: "Depends on pension plan terms.",
    example: "$18,000/year pension can cover a meaningful baseline of spending.",
  },
  pensionStartAge: {
    term: "Pension start age",
    plain: "Age pension payments begin.",
    why: "Later starts create more early-retirement funding needs.",
    range: "Typical range: 55-70.",
    example: "If pension starts at 65 but retirement is 60, savings bridge 5 years.",
  },
  cppAmount65: {
    term: "CPP estimate at 65",
    plain: "Estimated annual CPP amount if started at age 65.",
    why: "CPP is a core retirement income source for many Canadians.",
    range: "Personal estimate from Service Canada statements.",
    example: "$12,000/year at 65 can change with early or late start.",
  },
  cppStartAge: {
    term: "CPP start age",
    plain: "Age you plan to start CPP (60-70).",
    why: "Starting earlier lowers annual amount; delaying raises it.",
    range: "Allowed range: 60-70.",
    example: "Starting at 70 can materially increase annual CPP versus 65.",
  },
  oasAmount65: {
    term: "OAS estimate at 65",
    plain: "Estimated annual OAS amount if started at 65.",
    why: "OAS contributes to baseline retirement income after 65.",
    range: "Based on residency and eligibility.",
    example: "Delaying OAS can increase annual benefit.",
  },
  oasStartAge: {
    term: "OAS start age",
    plain: "Age you plan to start OAS (65-70).",
    why: "Start timing changes annual OAS amount and clawback exposure.",
    range: "Allowed range: 65-70.",
    example: "Starting at 68 increases annual OAS versus 65.",
  },
  spousePensionAmount: {
    term: "Spouse pension amount",
    plain: "Annual workplace/private pension income for spouse before tax.",
    why: "Spousal guaranteed income can reduce household savings withdrawals.",
    range: "Any non-negative value.",
    example: "A spouse pension of $10,000/year lowers portfolio draw needs.",
  },
  spousePensionStartAge: {
    term: "Spouse pension start age",
    plain: "Age when spouse pension starts.",
    why: "Timing determines how much early-retirement gap remains.",
    range: "Typical range: 55-70.",
    example: "If spouse pension starts at 65, years before 65 need other funding.",
  },
  spouseCppAmount65: {
    term: "Spouse CPP estimate at 65",
    plain: "Estimated annual spouse CPP at age 65.",
    why: "Adds household guaranteed income in retirement.",
    range: "Personal estimate from Service Canada statements.",
    example: "Spouse CPP can materially improve first-year retirement coverage.",
  },
  spouseCppStartAge: {
    term: "Spouse CPP start age",
    plain: "Age spouse plans to start CPP (60-70).",
    why: "Earlier or later start changes annual spouse CPP amount.",
    range: "Allowed range: 60-70.",
    example: "Delaying spouse CPP can increase late-retirement guaranteed income.",
  },
  spouseOasAmount65: {
    term: "Spouse OAS estimate at 65",
    plain: "Estimated annual spouse OAS at age 65.",
    why: "Adds to household baseline retirement income.",
    range: "Based on eligibility and residency history.",
    example: "Spouse OAS can reduce total required account withdrawals.",
  },
  spouseOasStartAge: {
    term: "Spouse OAS start age",
    plain: "Age spouse plans to start OAS (65-70).",
    why: "Start timing affects annual benefit and clawback exposure.",
    range: "Allowed range: 65-70.",
    example: "Starting at 67 gives higher annual OAS than 65.",
  },
  scenarioSpread: {
    term: "Scenario spread",
    plain: "Difference used to create best/base/worst deterministic return scenarios.",
    why: "Helps compare sensitivity to return assumptions.",
    range: "Typical range: 1%-3%.",
    example: "Base 5.5% with spread 2% gives 3.5% worst and 7.5% best.",
  },
  volatility: {
    term: "Volatility",
    plain: "Planning volatility input for education and stress framing.",
    why: "Higher volatility means wider range of possible outcomes.",
    range: "Typical long-term annualized range: 6%-15%.",
    example: "A more volatile portfolio may deviate further from base projections.",
  },
  rrsp: {
    term: "RRSP/RRIF account",
    plain: "Tax-deferred account; withdrawals are generally taxable.",
    why: "Withdrawal order affects taxes and government benefit interactions.",
    range: "Any non-negative value.",
    example: "Large RRSP withdrawals can raise taxable income and clawback risk.",
  },
  tfsa: {
    term: "TFSA account",
    plain: "Tax-free savings account; eligible withdrawals are tax-free.",
    why: "Useful for flexible, tax-efficient retirement cash flow.",
    range: "Any non-negative value.",
    example: "Using TFSA withdrawals can reduce taxable income in high-tax years.",
  },
  nonRegistered: {
    term: "Non-registered account",
    plain: "Taxable investment account outside RRSP/TFSA.",
    why: "Some withdrawal amounts may be taxable depending on gains/income type.",
    range: "Any non-negative value.",
    example: "Capital gains are typically taxed more favorably than full-income withdrawals.",
  },
  cash: {
    term: "Cash account",
    plain: "Liquid cash reserve for short-term spending needs.",
    why: "Can reduce forced selling during market stress.",
    range: "Any non-negative value.",
    example: "A cash buffer can help cover 1-2 years of spending gaps.",
  },
};

const TAX_BRACKETS = {
  federal: {
    thresholds: [0, 57375, 114750, 177882, 253414],
    rates: [0.15, 0.205, 0.26, 0.29, 0.33],
  },
  provincial: {
    NL: { thresholds: [0, 43198, 86395, 154244, 215943, 275870, 551739, 1103478], rates: [0.087, 0.145, 0.158, 0.178, 0.198, 0.208, 0.213, 0.218] },
    PE: { thresholds: [0, 32656, 64313, 105000, 140000], rates: [0.098, 0.138, 0.167, 0.176, 0.19] },
    NS: { thresholds: [0, 29590, 59180, 93000, 150000], rates: [0.0879, 0.1495, 0.1667, 0.175, 0.21] },
    NB: { thresholds: [0, 49958, 99916, 185064], rates: [0.094, 0.14, 0.16, 0.195] },
    QC: { thresholds: [0, 51780, 103545, 126000], rates: [0.14, 0.19, 0.24, 0.2575] },
    ON: { thresholds: [0, 52886, 105775, 150000, 220000], rates: [0.0505, 0.0915, 0.1116, 0.1216, 0.1316] },
    MB: { thresholds: [0, 47000, 100000], rates: [0.108, 0.1275, 0.174] },
    SK: { thresholds: [0, 52057, 148734], rates: [0.105, 0.125, 0.145] },
    AB: { thresholds: [0, 151234, 181481, 241974, 362961], rates: [0.1, 0.12, 0.13, 0.14, 0.15] },
    BC: { thresholds: [0, 47937, 95875, 110076, 133664, 181232, 252752], rates: [0.0506, 0.077, 0.105, 0.1229, 0.147, 0.168, 0.205] },
  },
};

const el = {
  landingPanel: document.getElementById("landingPanel"),
  appPanel: document.getElementById("appPanel"),
  startSimpleBtn: document.getElementById("startSimpleBtn"),
  landingDemoBtn: document.getElementById("landingDemoBtn"),
  landingImportBtn: document.getElementById("landingImportBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  loadDemoBtn: document.getElementById("loadDemoBtn"),
  resetBtn: document.getElementById("resetBtn"),
  openGlossaryBtn: document.getElementById("openGlossaryBtn"),
  importJsonFile: document.getElementById("importJsonFile"),

  tabButtons: Array.from(document.querySelectorAll(".tab-btn")),
  navPanels: Array.from(document.querySelectorAll(".nav-panel")),

  kpiGrid: document.getElementById("kpiGrid"),
  mainChart: document.getElementById("mainChart"),
  chartLegend: document.getElementById("chartLegend"),
  nextActions: document.getElementById("nextActions"),
  basicsSummary: document.getElementById("basicsSummary"),

  wizardProgressBar: document.getElementById("wizardProgressBar"),
  wizardStepLabel: document.getElementById("wizardStepLabel"),
  wizardBody: document.getElementById("wizardBody"),
  wizardBackBtn: document.getElementById("wizardBackBtn"),
  wizardNextBtn: document.getElementById("wizardNextBtn"),

  advancedAccordion: document.getElementById("advancedAccordion"),
  scenarioCompareToggle: document.getElementById("scenarioCompareToggle"),
  scenarioSummary: document.getElementById("scenarioSummary"),
  stressTable: document.getElementById("stressTable"),

  notesInput: document.getElementById("notesInput"),
  tooltipLayer: document.getElementById("tooltipLayer"),

  glossaryModal: document.getElementById("glossaryModal"),
  openGlossary: document.getElementById("openGlossaryBtn"),
  closeGlossaryBtn: document.getElementById("closeGlossaryBtn"),
  glossaryContent: document.getElementById("glossaryContent"),

  appToast: document.getElementById("appToast"),
};

let state = loadPlan();
let ui = {
  activeNav: state.uiState.activeNav || "dashboard",
  tooltipKey: "",
  toastTimer: null,
  lastModel: null,
  advancedOpen: {
    basics: true,
    assumptions: true,
    income: false,
    accounts: false,
    capitalInjects: false,
    withdrawal: false,
    tax: false,
    modules: false,
  },
};

init();

function init() {
  bindEvents();
  renderAll();
  registerServiceWorker();
}

function bindEvents() {
  el.startSimpleBtn?.addEventListener("click", () => {
    state.uiState.firstRun = false;
    state.uiState.hasStarted = true;
    state.uiState.activeNav = "guided";
    ui.activeNav = "guided";
    savePlan();
    renderAll();
  });

  el.landingDemoBtn?.addEventListener("click", () => {
    state = createDemoPlan();
    ui.activeNav = "dashboard";
    savePlan();
    renderAll();
    toast("Demo plan loaded.");
  });

  el.loadDemoBtn?.addEventListener("click", () => {
    state = createDemoPlan();
    ui.activeNav = "dashboard";
    savePlan();
    renderAll();
    toast("Demo plan loaded.");
  });

  el.exportJsonBtn?.addEventListener("click", exportJson);
  el.importJsonBtn?.addEventListener("click", () => el.importJsonFile?.click());
  el.landingImportBtn?.addEventListener("click", () => el.importJsonFile?.click());
  el.importJsonFile?.addEventListener("change", importJsonFromFile);

  el.resetBtn?.addEventListener("click", () => {
    const ok = confirm("Reset your local plan to defaults?");
    if (!ok) return;
    state = createDefaultPlan();
    ui.activeNav = "guided";
    savePlan();
    renderAll();
    toast("Plan reset.");
  });

  el.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.navTarget || "dashboard";
      setActiveNav(target);
    });
  });

  el.wizardBackBtn?.addEventListener("click", () => {
    state.uiState.wizardStep = Math.max(1, state.uiState.wizardStep - 1);
    savePlan();
    renderWizard();
  });

  el.wizardNextBtn?.addEventListener("click", () => {
    if (state.uiState.wizardStep >= 5) {
      state.uiState.wizardStep = 5;
      state.uiState.unlocked.advanced = true;
      state.uiState.activeNav = "dashboard";
      ui.activeNav = "dashboard";
      savePlan();
      renderAll();
      toast("Advanced features unlocked.");
      return;
    }

    state.uiState.wizardStep = Math.min(5, state.uiState.wizardStep + 1);
    if (state.uiState.wizardStep >= 5) state.uiState.unlocked.advanced = true;
    savePlan();
    renderAll();
  });

  el.notesInput?.addEventListener("input", () => {
    state.notes = el.notesInput.value;
    savePlan();
  });

  el.scenarioCompareToggle?.addEventListener("change", () => {
    state.uiState.showScenarioCompare = !!el.scenarioCompareToggle.checked;
    savePlan();
    renderStress();
  });

  document.addEventListener("input", handleBoundInput);
  document.addEventListener("change", handleBoundInput);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("toggle", handleDetailsToggle, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTooltip();
  });

  el.openGlossary?.addEventListener("click", openGlossary);
  el.closeGlossaryBtn?.addEventListener("click", () => el.glossaryModal?.close());
  el.glossaryModal?.addEventListener("click", (event) => {
    if (event.target === el.glossaryModal) el.glossaryModal.close();
  });
}

function handleDocumentClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const tooltipBtn = target.closest("[data-tooltip-key]");
  if (tooltipBtn) {
    event.preventDefault();
    const key = tooltipBtn.getAttribute("data-tooltip-key") || "";
    if (!key) return;
    if (ui.tooltipKey === key) {
      closeTooltip();
      return;
    }
    openTooltip(key, tooltipBtn);
    return;
  }

  const actionBtn = target.closest("[data-action]");
  if (actionBtn) {
    const action = actionBtn.getAttribute("data-action");
    if (action === "open-advanced") {
      state.uiState.unlocked.advanced = true;
      setActiveNav("advanced");
      savePlan();
      return;
    }
    if (action === "open-stress") {
      setActiveNav("stress");
      return;
    }
    if (action === "open-spouse") {
      state.profile.hasSpouse = true;
      state.uiState.unlocked.spouse = true;
      state.uiState.unlocked.advanced = true;
      setActiveNav("advanced");
      savePlan();
      renderAll();
      return;
    }
    if (action === "risk") {
      const value = actionBtn.getAttribute("data-value") || "balanced";
      state.assumptions.riskProfile = value;
      savePlan();
      renderAll();
      return;
    }
    if (action === "strategy") {
      const value = actionBtn.getAttribute("data-value") || "tax-smart";
      state.strategy.withdrawal = value;
      savePlan();
      renderAll();
      return;
    }
    if (action === "add-capital-inject") {
      state.savings.capitalInjects.push(createCapitalInjectItem());
      savePlan();
      renderAll();
      return;
    }
    if (action === "remove-capital-inject") {
      const id = actionBtn.getAttribute("data-value") || "";
      state.savings.capitalInjects = state.savings.capitalInjects.filter((item) => item.id !== id);
      savePlan();
      renderAll();
      return;
    }
    if (action === "tooltip-example") {
      const key = actionBtn.getAttribute("data-value") || "";
      const body = actionBtn.closest(".tooltip-popover")?.querySelector(".tooltip-example");
      const tip = TOOLTIPS[key];
      if (tip && body) body.textContent = tip.example || "No example available.";
      return;
    }
  }

  if (!target.closest(".tooltip-popover")) closeTooltip();
}

function handleBoundInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.matches("[data-bind]")) return;

  const path = target.getAttribute("data-bind");
  if (!path) return;

  captureAdvancedAccordionState();

  let value;
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    value = target.checked;
  } else {
    value = target.value;
  }

  const type = target.getAttribute("data-type") || "string";
  if (type === "number") {
    const parsed = Number(value);
    value = Number.isFinite(parsed) ? parsed : 0;
  }
  if (target.getAttribute("data-percent-input") === "1" && typeof value === "number") {
    value /= 100;
  }

  setByPath(state, path, value);

  if (path === "income.pension.enabled" && !value) state.income.pension.amount = 0;
  if (path === "profile.retirementAge") {
    state.income.pension.startAge = Math.max(state.income.pension.startAge, 40);
  }

  // Avoid re-rendering while the user is actively editing.
  // Full recalculation runs on committed change events.
  if (event.type === "input" && !(target instanceof HTMLInputElement && target.type === "checkbox")) {
    savePlan();
    return;
  }

  renderAll();
  savePlan();
}

function renderAll() {
  ensureValidState();
  ui.lastModel = buildPlanModel(state);

  const showLanding = state.uiState.firstRun;
  if (el.landingPanel) el.landingPanel.hidden = !showLanding;
  if (el.appPanel) el.appPanel.hidden = showLanding;

  renderNav();
  renderDashboard();
  renderWizard();
  renderAdvanced();
  renderStress();
  renderNotes();
}

function renderNav() {
  const nav = ui.activeNav;
  el.tabButtons.forEach((btn) => {
    const isActive = (btn.dataset.navTarget || "") === nav;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-current", isActive ? "page" : "false");
  });
  el.navPanels.forEach((panel) => {
    const isActive = panel.dataset.navPanel === nav;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function setActiveNav(next) {
  ui.activeNav = next;
  state.uiState.firstRun = false;
  state.uiState.activeNav = next;
  state.uiState.hasStarted = true;
  savePlan();
  renderAll();
}

function renderDashboard() {
  const model = ui.lastModel;
  if (!model) return;

  const cards = [
    {
      label: "Balance at retirement",
      value: formatCurrency(model.kpis.balanceAtRetirement),
      sub: `Age ${state.profile.retirementAge}`,
    },
    {
      label: "Income gap / surplus",
      value: formatSignedCurrency(model.kpis.firstYearGap),
      sub: model.kpis.firstYearGap >= 0 ? "Surplus in first retirement year" : "Gap in first retirement year",
    },
    {
      label: "Depletion age",
      value: model.kpis.depletionAge ? `Age ${model.kpis.depletionAge}` : "No depletion",
      sub: model.kpis.depletionAge ? "Savings projected to run out" : "Balance remains through plan horizon",
    },
  ];

  el.kpiGrid.innerHTML = cards.map((card) => `
    <article class="metric-card">
      <span class="label">${escapeHtml(card.label)}</span>
      <span class="value">${escapeHtml(card.value)}</span>
      <span class="sub">${escapeHtml(card.sub)}</span>
    </article>
  `).join("");

  renderLegend();
  drawMainChart(model.base.rows, model.best.rows, model.worst.rows);

  const actions = buildNextActions(model);
  el.nextActions.innerHTML = actions.map((text) => `<li>${escapeHtml(text)}</li>`).join("");

  el.basicsSummary.innerHTML = [
    `Province: <strong>${PROVINCES[state.profile.province]}</strong>`,
    `Retire at <strong>${state.profile.retirementAge}</strong>, plan through age <strong>${state.profile.lifeExpectancy}</strong>.`,
    `Risk profile: <strong>${capitalize(state.assumptions.riskProfile)}</strong> (${formatPct(model.base.returnRate)} return).`,
    `Estimated first retirement year guaranteed income: <strong>${formatCurrency(model.kpis.firstYearGuaranteed)}</strong>.`,
  ].join("<br>");
}

function renderLegend() {
  const items = [
    ["Balance", "#0f6abf"],
    ["Balance upper/lower (stress)", "#7aa7d8"],
    ["Spending", "#d9485f"],
    ["Pension", "#f59e0b"],
    ["CPP", "#16a34a"],
    ["OAS", "#0ea5a8"],
  ];

  el.chartLegend.innerHTML = items.map((item) => `
    <span class="legend-item">
      <span class="legend-chip" style="background:${item[1]};"></span>${item[0]}
    </span>
  `).join("");
}

function renderWizard() {
  const step = clamp(state.uiState.wizardStep || 1, 1, 5);
  state.uiState.wizardStep = step;
  const progress = (step / 5) * 100;
  el.wizardProgressBar.style.width = `${progress}%`;
  el.wizardStepLabel.textContent = `Step ${step} of 5`;
  el.wizardBackBtn.disabled = step === 1;
  el.wizardNextBtn.textContent = step === 5 ? "Finish" : "Next";

  const model = ui.lastModel;
  const stepHtml = {
    1: wizardStepTimeline(model),
    2: wizardStepGoal(model),
    3: wizardStepSavings(model),
    4: wizardStepIncome(model),
    5: wizardStepRefine(model),
  }[step];

  el.wizardBody.innerHTML = stepHtml;
}

function wizardStepTimeline(model) {
  const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
  const planYears = Math.max(1, state.profile.lifeExpectancy - state.profile.retirementAge);

  return `
    <h3>Your Timeline</h3>
    <div class="wizard-grid">
      ${selectField("Province", "profile.province", Object.entries(PROVINCES).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
      ${numberField("Year of birth", "profile.birthYear", state.profile.birthYear, { min: 1940, max: APP.currentYear - 18, step: 1 }, "birthYear")}
      ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge")}
      ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy")}
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>Your timeline sets saving years and retirement drawdown years.</li>
        <li>Longer life expectancy protects against longevity risk.</li>
        <li>Retiring earlier increases pressure on portfolio withdrawals.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Years to retirement</strong><span>${yearsToRetirement}</span></div>
        <div class="preview-kpi-item"><strong>Plan length</strong><span>${planYears} years</span></div>
      </div>
    </section>
  `;
}

function wizardStepGoal(model) {
  const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
  const spendAtRet = state.profile.desiredSpending * Math.pow(1 + state.assumptions.inflation, yearsToRetirement);
  const neutral = model.kpis.firstYearGap >= 0;

  return `
    <h3>Your Goal</h3>
    <div class="wizard-grid">
      ${numberField("Desired retirement spending (after-tax, today dollars)", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
      ${numberField("Inflation assumption", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true)}
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>Today’s dollars keep planning intuitive and comparable.</li>
        <li>Inflation-adjusted spending is the amount needed in future years.</li>
        <li>A funded indicator helps quickly gauge if assumptions are realistic.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Spending at retirement</strong><span>${formatCurrency(spendAtRet)}</span></div>
        <div class="preview-kpi-item"><strong>Neutral funded indicator</strong><span class="${neutral ? "status-good" : "status-bad"}">${neutral ? "On track" : "Needs improvement"}</span></div>
      </div>
    </section>
  `;
}

function wizardStepSavings(model) {
  const sustainable = model.kpis.sustainableIncome;

  return `
    <h3>Your Savings</h3>
    <div class="wizard-grid">
      ${numberField("Current total savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
      ${numberField("Annual contribution", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
      ${numberField("Contribution increase (% per year)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true)}
      <div class="form-span-full">
        <div class="label-row">Risk profile ${tooltipButton("riskProfile")}</div>
        <div class="inline-radio-row">
          ${riskButton("conservative")}
          ${riskButton("balanced")}
          ${riskButton("aggressive")}
        </div>
      </div>
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>Higher expected return assumptions can improve outcomes but include more uncertainty.</li>
        <li>Contribution consistency often matters as much as return assumptions.</li>
        <li>Use scenarios to test confidence in your plan.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Balance at retirement</strong><span>${formatCurrency(model.kpis.balanceAtRetirement)}</span></div>
        <div class="preview-kpi-item"><strong>Estimated sustainable income</strong><span>${formatCurrency(sustainable)}</span></div>
      </div>
    </section>
  `;
}

function wizardStepIncome(model) {
  const first = model.kpis.firstRetirementBreakdown;
  const total = Math.max(1, first.pension + first.cpp + first.oas + first.withdrawal);
  const pensionPct = (first.pension / total) * 100;
  const cppPct = (first.cpp / total) * 100;
  const oasPct = (first.oas / total) * 100;
  const drawPct = (first.withdrawal / total) * 100;
  return `
    <h3>Income Sources</h3>
    <div class="wizard-grid">
      <label class="form-span-full inline-check">
        <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
        Workplace pension?
      </label>
      ${numberField("Pension amount", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled)}
      ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled)}
      ${numberField("Estimated CPP at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 250 }, "cppAmount65")}
      ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge")}
      ${numberField("Estimated OAS at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65")}
      ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge")}
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>CPP and OAS timing affects annual income and gap coverage.</li>
        <li>Guaranteed income sources reduce pressure on portfolio withdrawals.</li>
        <li>Delaying CPP/OAS may improve late-retirement sustainability.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview: first retirement year coverage</h3>
      <div class="stacked-bar" aria-label="Stacked income coverage">
        <span style="width:${pensionPct.toFixed(1)}%; background:#f59e0b;" title="Pension"></span>
        <span style="width:${cppPct.toFixed(1)}%; background:#16a34a;" title="CPP"></span>
        <span style="width:${oasPct.toFixed(1)}%; background:#0ea5a8;" title="OAS"></span>
        <span style="width:${drawPct.toFixed(1)}%; background:#0f6abf;" title="Savings draw"></span>
      </div>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Pension</strong><span>${formatCurrency(first.pension)}</span></div>
        <div class="preview-kpi-item"><strong>CPP</strong><span>${formatCurrency(first.cpp)}</span></div>
        <div class="preview-kpi-item"><strong>OAS</strong><span>${formatCurrency(first.oas)}</span></div>
        <div class="preview-kpi-item"><strong>Savings draw</strong><span>${formatCurrency(first.withdrawal)}</span></div>
      </div>
    </section>
  `;
}

function wizardStepRefine() {
  return `
    <h3>Your first forecast is ready</h3>
    <p class="muted">You can stay with the simple dashboard or unlock deeper tax-aware planning.</p>
    <div class="landing-actions">
      <button class="btn btn-primary" type="button" data-action="open-advanced">Refine taxes & withdrawals</button>
      <button class="btn btn-secondary" type="button" data-action="open-spouse">Add spouse planning</button>
      <button class="btn btn-secondary" type="button" data-action="open-stress">Stress test my plan</button>
    </div>
    <section class="lesson-box">
      <h3>What unlocks next</h3>
      <ul>
        <li>Scenario comparison and tax estimate by province.</li>
        <li>Account-level withdrawal order and OAS clawback view.</li>
        <li>Educational modules for RRIF conversion and timing tradeoffs.</li>
      </ul>
    </section>
  `;
}

function renderAdvanced() {
  const model = ui.lastModel;
  const locked = !state.uiState.unlocked.advanced;
  if (locked) {
    el.advancedAccordion.innerHTML = `<div class="subsection"><strong>Locked</strong><p class="muted">Complete Guided Setup step 5 to unlock advanced inputs.</p></div>`;
    return;
  }

  const strategyRows = model.strategyComparisons.map((row) => `
    <tr>
      <td>${escapeHtml(row.label)}</td>
      <td>${formatCurrency(row.totalTax)}</td>
      <td>${formatCurrency(row.totalClawback)}</td>
      <td>${row.depletionAge ? `Age ${row.depletionAge}` : "No depletion"}</td>
    </tr>
  `).join("");

  const selectedStrategy = state.strategy.withdrawal;
  const selected = model.strategyComparisons.find((x) => x.key === selectedStrategy) || model.strategyComparisons[0];

  el.advancedAccordion.innerHTML = `
    ${accordionSection("basics", "Basics", "Changes timeline, spending target, and core savings assumptions used across all models.", `
      <div class="form-grid">
        ${selectField("Province", "profile.province", Object.entries(PROVINCES).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
        ${numberField("Year of birth", "profile.birthYear", state.profile.birthYear, { min: 1940, max: APP.currentYear - 18, step: 1 }, "birthYear")}
        ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge")}
        ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy")}
        ${numberField("Desired spending (today's dollars)", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
        ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true)}
        ${numberField("Current total savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
        ${numberField("Annual contribution", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
      </div>
    `, true)}

    ${accordionSection("assumptions", "Assumptions", "Changes growth, spending escalation, scenario dispersion, and tax estimate framing.", `
      <div class="form-grid">
        ${numberField("Conservative return", "assumptions.returns.conservative", toPct(state.assumptions.returns.conservative), { min: 1, max: 10, step: 0.1 }, "riskProfile", true)}
        ${numberField("Balanced return", "assumptions.returns.balanced", toPct(state.assumptions.returns.balanced), { min: 1, max: 12, step: 0.1 }, "riskProfile", true)}
        ${numberField("Aggressive return", "assumptions.returns.aggressive", toPct(state.assumptions.returns.aggressive), { min: 1, max: 14, step: 0.1 }, "riskProfile", true)}
        ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true)}
        ${numberField("Scenario spread", "assumptions.scenarioSpread", toPct(state.assumptions.scenarioSpread), { min: 0.5, max: 5, step: 0.1 }, "scenarioSpread", true)}
        ${numberField("Volatility", "assumptions.volatility", toPct(state.assumptions.volatility), { min: 3, max: 20, step: 0.5 }, "volatility", true)}
        ${numberField("Contribution increase (%/yr)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true)}
        <label class="form-span-full inline-check"><input type="checkbox" data-bind="assumptions.taxBracketInflation" ${state.assumptions.taxBracketInflation ? "checked" : ""} />Inflate tax brackets over time</label>
      </div>
    `)}

    ${accordionSection("income", "Income sources", "Changes non-portfolio income and timing dependencies.", `
      <div class="form-grid">
        <label class="inline-check form-span-full"><input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />Enable workplace pension</label>
        ${numberField("Pension amount", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount")}
        ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge")}
        ${numberField("CPP at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65")}
        ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge")}
        ${numberField("OAS at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65")}
        ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge")}
        <label class="inline-check form-span-full"><input type="checkbox" data-bind="profile.hasSpouse" ${state.profile.hasSpouse ? "checked" : ""} />Enable spousal income</label>
        ${state.profile.hasSpouse ? `
          <label class="inline-check form-span-full"><input type="checkbox" data-bind="income.spouse.enabled" ${state.income.spouse.enabled ? "checked" : ""} />Include spouse private pension / CPP / OAS</label>
          ${numberField("Spouse private pension", "income.spouse.pensionAmount", state.income.spouse.pensionAmount, { min: 0, max: 200000, step: 500 }, "spousePensionAmount", false, !state.income.spouse.enabled)}
          ${numberField("Spouse pension start age", "income.spouse.pensionStartAge", state.income.spouse.pensionStartAge, { min: 50, max: 75, step: 1 }, "spousePensionStartAge", false, !state.income.spouse.enabled)}
          ${numberField("Spouse CPP at 65", "income.spouse.cppAmountAt65", state.income.spouse.cppAmountAt65, { min: 0, max: 35000, step: 100 }, "spouseCppAmount65", false, !state.income.spouse.enabled)}
          ${numberField("Spouse CPP start age", "income.spouse.cppStartAge", state.income.spouse.cppStartAge, { min: 60, max: 70, step: 1 }, "spouseCppStartAge", false, !state.income.spouse.enabled)}
          ${numberField("Spouse OAS at 65", "income.spouse.oasAmountAt65", state.income.spouse.oasAmountAt65, { min: 0, max: 12000, step: 100 }, "spouseOasAmount65", false, !state.income.spouse.enabled)}
          ${numberField("Spouse OAS start age", "income.spouse.oasStartAge", state.income.spouse.oasStartAge, { min: 65, max: 70, step: 1 }, "spouseOasStartAge", false, !state.income.spouse.enabled)}
        ` : ""}
      </div>
    `)}

    ${accordionSection("accounts", "Accounts", "Changes withdrawal taxation and longevity under strategy comparisons.", `
      <div class="form-grid">
        ${numberField("RRSP / RRIF", "accounts.rrsp", state.accounts.rrsp, { min: 0, max: 5000000, step: 1000 }, "rrsp")}
        ${numberField("TFSA", "accounts.tfsa", state.accounts.tfsa, { min: 0, max: 5000000, step: 1000 }, "tfsa")}
        ${numberField("Non-registered", "accounts.nonRegistered", state.accounts.nonRegistered, { min: 0, max: 5000000, step: 1000 }, "nonRegistered")}
        ${numberField("Cash", "accounts.cash", state.accounts.cash, { min: 0, max: 5000000, step: 500 }, "cash")}
      </div>
    `)}

    ${accordionSection("capitalInjects", "Capital injects", "Adds one-time lump-sum proceeds (for example home downsizing) at chosen ages.", `
      <div class="subsection">
        <p class="muted small-copy">Each enabled row is a one-time injection added to plan assets at the selected age.</p>
        <button type="button" class="btn btn-secondary" data-action="add-capital-inject">Add lump-sum event</button>
      </div>
      <div class="form-grid">
        ${renderCapitalInjectRows()}
      </div>
    `)}

    ${accordionSection("withdrawal", "Withdrawal strategy", "Changes account draw order, taxes, and potential OAS clawback.", `
      <div class="form-span-full">
        <div class="inline-radio-row">
          ${strategyButton("tax-smart", "Tax-smart")}
          ${strategyButton("rrsp-first", "RRSP-first")}
          ${strategyButton("tfsa-first", "TFSA-first")}
        </div>
      </div>
      <label class="inline-check"><input type="checkbox" data-bind="strategy.oasClawbackModeling" ${state.strategy.oasClawbackModeling ? "checked" : ""} />Model OAS clawback</label>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Strategy</th><th>Estimated taxes</th><th>OAS clawback</th><th>Depletion</th></tr></thead>
          <tbody>${strategyRows}</tbody>
        </table>
      </div>
      <div class="subsection">
        <h3>Why this order?</h3>
        <ul class="plain-list">${selected.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
      </div>
    `)}

    ${accordionSection("tax", "Tax estimate", "Provides planning-level yearly tax estimates using federal + provincial brackets.", `
      <p class="muted">Planning estimate only. Uses province-aware bracket math and can escalate brackets with inflation.</p>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Current effective tax rate</strong><span>${formatPct(model.tax.currentEffectiveRate)}</span></div>
        <div class="preview-kpi-item"><strong>First retirement-year effective tax rate</strong><span>${formatPct(model.tax.firstRetirementEffectiveRate)}</span></div>
      </div>
    `)}

    ${accordionSection("modules", "Educational unlock modules", "Adds concept-level guidance. Some modules are educational-only if not fully modeled.", `
      <ul class="plain-list">
        <li>CPP timing tradeoffs: modeled in projection and strategy engine.</li>
        <li>OAS timing: modeled in projection and strategy engine.</li>
        <li>OAS clawback: modeled when toggle is enabled.</li>
        <li>RRSP to RRIF conversion and minimum withdrawals: educational only in this version.</li>
        <li>Pension income splitting: educational only in this version.</li>
        <li>TFSA vs RRSP vs non-registered tax differences: modeled with planning heuristics.</li>
        <li>Private pension bridge to 65: educational only in this version.</li>
      </ul>
    `)}
  `;
}

function renderStress() {
  const model = ui.lastModel;
  if (!model) return;

  el.scenarioCompareToggle.checked = !!state.uiState.showScenarioCompare;

  if (state.uiState.showScenarioCompare) {
    el.scenarioSummary.innerHTML = `
      <h3>Deterministic scenarios</h3>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Scenario</th><th>Return</th><th>Balance at retirement</th><th>Depletion age</th></tr></thead>
          <tbody>
            ${model.scenarioRows.map((row) => `
              <tr>
                <td>${row.label}</td>
                <td>${formatPct(row.returnRate)}</td>
                <td>${formatCurrency(row.balanceAtRetirement)}</td>
                <td>${row.depletionAge ? `Age ${row.depletionAge}` : "No depletion"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } else {
    el.scenarioSummary.innerHTML = "<p class='muted'>Enable scenario comparison to view best/base/worst outcomes.</p>";
  }

  const rows = model.stressMatrix;
  el.stressTable.innerHTML = `
    <thead>
      <tr>
        <th>Return shift</th>
        <th>Inflation shift</th>
        <th>Balance at retirement</th>
        <th>Depletion age</th>
        <th>First-year gap/surplus</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((row) => `
        <tr>
          <td>${formatSignedPct(row.returnShift)}</td>
          <td>${formatSignedPct(row.inflationShift)}</td>
          <td>${formatCurrency(row.balanceAtRetirement)}</td>
          <td>${row.depletionAge ? `Age ${row.depletionAge}` : "No depletion"}</td>
          <td>${formatSignedCurrency(row.firstYearGap)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function renderNotes() {
  el.notesInput.value = state.notes || "";
}

function buildPlanModel(plan) {
  const baseReturn = getReturnRate(plan);
  const base = runSimpleProjection(plan, { returnRate: baseReturn, inflationRate: plan.assumptions.inflation });

  const spread = plan.assumptions.scenarioSpread;
  const scenarioDefs = [
    { key: "best", label: "Best", returnRate: baseReturn + spread },
    { key: "base", label: "Base", returnRate: baseReturn },
    { key: "worst", label: "Worst", returnRate: Math.max(0.01, baseReturn - spread) },
  ];

  const scenarioRuns = scenarioDefs.map((def) => {
    const res = runSimpleProjection(plan, { returnRate: def.returnRate, inflationRate: plan.assumptions.inflation });
    return {
      key: def.key,
      label: def.label,
      returnRate: def.returnRate,
      balanceAtRetirement: res.kpis.balanceAtRetirement,
      depletionAge: res.kpis.depletionAge,
      rows: res.rows,
    };
  });
  const scenarioRows = scenarioRuns.map((row) => ({
    label: row.label,
    returnRate: row.returnRate,
    balanceAtRetirement: row.balanceAtRetirement,
    depletionAge: row.depletionAge,
  }));
  const best = scenarioRuns.find((x) => x.key === "best") || { rows: base.rows };
  const worst = scenarioRuns.find((x) => x.key === "worst") || { rows: base.rows };

  const stressMatrix = [];
  const returnShifts = [-0.02, 0, 0.02];
  const inflationShifts = [-0.01, 0, 0.01];
  for (const rShift of returnShifts) {
    for (const iShift of inflationShifts) {
      const r = Math.max(0.01, baseReturn + rShift);
      const inf = clamp(plan.assumptions.inflation + iShift, 0.005, 0.08);
      const res = runSimpleProjection(plan, { returnRate: r, inflationRate: inf });
      stressMatrix.push({
        returnShift: rShift,
        inflationShift: iShift,
        balanceAtRetirement: res.kpis.balanceAtRetirement,
        depletionAge: res.kpis.depletionAge,
        firstYearGap: res.kpis.firstYearGap,
      });
    }
  }

  const strategyComparisons = [
    runStrategyProjection(plan, base, "tax-smart"),
    runStrategyProjection(plan, base, "rrsp-first"),
    runStrategyProjection(plan, base, "tfsa-first"),
  ];

  const firstRet = base.rows.find((row) => row.age === plan.profile.retirementAge) || base.rows[0];
  const spouseCurrentIncome = plan.profile.hasSpouse && plan.income.spouse.enabled
    ? Math.max(0, plan.income.spouse.pensionAmount)
    : 0;
  const taxCurrentIncome = Math.max(0, plan.income.pension.enabled ? plan.income.pension.amount : 0) + spouseCurrentIncome;
  const taxRetIncome = Math.max(0, firstRet.taxableIncome);

  return {
    base,
    best,
    worst,
    scenarioRows,
    stressMatrix,
    strategyComparisons,
    tax: {
      currentEffectiveRate: estimateEffectiveTaxRate(plan, taxCurrentIncome, 0),
      firstRetirementEffectiveRate: estimateEffectiveTaxRate(plan, taxRetIncome, Math.max(0, plan.profile.retirementAge - ageNow())),
    },
    kpis: base.kpis,
  };
}

function runSimpleProjection(plan, options) {
  const startYear = APP.currentYear;
  const endYear = startYear + Math.max(1, plan.profile.lifeExpectancy - ageNow());
  const retireAge = plan.profile.retirementAge;
  const birthYear = plan.profile.birthYear;
  const returnRate = options.returnRate;
  const inflationRate = options.inflationRate;
  const contributionIncrease = plan.savings.contributionIncrease;

  let balance = plan.savings.currentTotal;
  let depletionAge = null;
  let balanceAtRetirement = plan.savings.currentTotal;

  const rows = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const age = year - birthYear;
    const retired = age >= retireAge;
    const yearsFromStart = Math.max(0, year - startYear);
    const capitalInject = getCapitalInjectAtAge(plan, age);
    const contribution = retired
      ? 0
      : plan.savings.annualContribution * Math.pow(1 + contributionIncrease, yearsFromStart);

    const pension = plan.income.pension.enabled && age >= plan.income.pension.startAge ? plan.income.pension.amount : 0;
    const cpp = age >= plan.income.cpp.startAge ? adjustedCPP(plan.income.cpp.amountAt65, plan.income.cpp.startAge) : 0;
    const oas = age >= plan.income.oas.startAge ? adjustedOAS(plan.income.oas.amountAt65, plan.income.oas.startAge) : 0;

    const spouseEnabled = plan.profile.hasSpouse && plan.income.spouse.enabled;
    const spousePension = spouseEnabled && age >= plan.income.spouse.pensionStartAge ? plan.income.spouse.pensionAmount : 0;
    const spouseCpp = spouseEnabled && age >= plan.income.spouse.cppStartAge ? adjustedCPP(plan.income.spouse.cppAmountAt65, plan.income.spouse.cppStartAge) : 0;
    const spouseOas = spouseEnabled && age >= plan.income.spouse.oasStartAge ? adjustedOAS(plan.income.spouse.oasAmountAt65, plan.income.spouse.oasStartAge) : 0;

    const guaranteedIncome = pension + cpp + oas + spousePension + spouseCpp + spouseOas;

    const yearsFromRetirementStart = Math.max(0, age - retireAge);
    const targetAfterTax = retired
      ? inflateAmountToRetirement(plan.profile.desiredSpending, inflationRate, Math.max(0, retireAge - ageNow())) * Math.pow(1 + inflationRate, yearsFromRetirementStart)
      : 0;

    let withdrawal = 0;
    let tax = 0;
    let taxableIncome = guaranteedIncome;
    let gap = 0;

    if (retired) {
      const netFromGuaranteed = guaranteedIncome * (1 - estimateEffectiveTaxRate(plan, guaranteedIncome, Math.max(0, year - startYear)));
      const netGap = Math.max(0, targetAfterTax - netFromGuaranteed);
      const effectiveOnCombined = estimateEffectiveTaxRate(plan, guaranteedIncome + netGap, Math.max(0, year - startYear));
      withdrawal = netGap / Math.max(0.45, 1 - effectiveOnCombined);
      taxableIncome = guaranteedIncome + withdrawal;
      tax = taxableIncome * estimateEffectiveTaxRate(plan, taxableIncome, Math.max(0, year - startYear));
      const netIncome = guaranteedIncome + withdrawal - tax;
      gap = netIncome - targetAfterTax;
    }

    const preGrowth = retired
      ? Math.max(0, balance + capitalInject - withdrawal)
      : balance + contribution + capitalInject;
    balance = preGrowth * (1 + returnRate);

    if (!depletionAge && retired && preGrowth <= 0) depletionAge = age;
    if (age === retireAge) balanceAtRetirement = preGrowth;

    rows.push({
      year,
      age,
      balance,
      balanceStart: retired ? Math.max(0, preGrowth + withdrawal) : balance - contribution,
      contribution,
      capitalInject,
      withdrawal,
      spending: targetAfterTax,
      tax,
      taxableIncome,
      pension,
      cpp,
      oas,
      spousePension,
      spouseCpp,
      spouseOas,
      guaranteedIncome,
      gap,
    });
  }

  const firstRet = rows.find((row) => row.age === retireAge) || rows[0];
  const sustainableIncome = estimateSustainableIncome(rows, retireAge);

  const kpis = {
    balanceAtRetirement,
    firstYearGap: firstRet ? firstRet.gap : 0,
    depletionAge,
    firstYearGuaranteed: firstRet ? firstRet.guaranteedIncome : 0,
    firstRetirementBreakdown: {
      pension: firstRet ? firstRet.pension : 0,
      cpp: firstRet ? firstRet.cpp : 0,
      oas: firstRet ? firstRet.oas : 0,
      withdrawal: firstRet ? firstRet.withdrawal : 0,
    },
    sustainableIncome,
  };

  return { rows, kpis, returnRate };
}

function runStrategyProjection(plan, baseProjection, strategyKey) {
  const retireAge = plan.profile.retirementAge;
  const deathAge = plan.profile.lifeExpectancy;
  const yearsToRetirement = Math.max(0, retireAge - ageNow());
  const returnRate = getReturnRate(plan);
  const inflationRate = plan.assumptions.inflation;

  const balances = growAccountsToRetirement(
    plan,
    plan.accounts,
    plan.savings.annualContribution,
    plan.savings.contributionIncrease,
    returnRate,
    yearsToRetirement
  );

  let totalTax = 0;
  let totalClawback = 0;
  let depletionAge = null;

  for (let age = retireAge; age <= deathAge; age += 1) {
    const yearOffset = Math.max(0, age - ageNow());
    const spend = inflateAmountToRetirement(plan.profile.desiredSpending, inflationRate, yearsToRetirement) * Math.pow(1 + inflationRate, Math.max(0, age - retireAge));

    const pension = plan.income.pension.enabled && age >= plan.income.pension.startAge ? plan.income.pension.amount : 0;
    const cpp = age >= plan.income.cpp.startAge ? adjustedCPP(plan.income.cpp.amountAt65, plan.income.cpp.startAge) : 0;
    const oas = age >= plan.income.oas.startAge ? adjustedOAS(plan.income.oas.amountAt65, plan.income.oas.startAge) : 0;
    const spouseEnabled = plan.profile.hasSpouse && plan.income.spouse.enabled;
    const spousePension = spouseEnabled && age >= plan.income.spouse.pensionStartAge ? plan.income.spouse.pensionAmount : 0;
    const spouseCpp = spouseEnabled && age >= plan.income.spouse.cppStartAge ? adjustedCPP(plan.income.spouse.cppAmountAt65, plan.income.spouse.cppStartAge) : 0;
    const spouseOas = spouseEnabled && age >= plan.income.spouse.oasStartAge ? adjustedOAS(plan.income.spouse.oasAmountAt65, plan.income.spouse.oasStartAge) : 0;
    const guaranteedGross = pension + cpp + oas + spousePension + spouseCpp + spouseOas;
    const capitalInject = getCapitalInjectAtAge(plan, age);
    if (capitalInject > 0) balances.cash += capitalInject;

    let guessNeed = Math.max(0, spend - guaranteedGross * (1 - estimateEffectiveTaxRate(plan, guaranteedGross, yearOffset)));
    let chosen = { rrsp: 0, tfsa: 0, nonRegistered: 0, cash: 0, total: 0 };
    let taxes = 0;
    let clawback = 0;

    for (let i = 0; i < 5; i += 1) {
      const order = getWithdrawalOrder(strategyKey, {
        balances,
        taxableBeforeWithdrawals: guaranteedGross,
        oas,
      });
      chosen = distributeFromAccounts(order, balances, guessNeed);
      const taxableDraw = chosen.rrsp + chosen.nonRegistered * 0.3;
      const taxableTotal = guaranteedGross + taxableDraw;
      taxes = taxableTotal * estimateEffectiveTaxRate(plan, taxableTotal, yearOffset);
      clawback = plan.strategy.oasClawbackModeling ? estimateOasClawback(plan, taxableTotal, oas, yearOffset) : 0;
      const net = guaranteedGross + chosen.total - taxes - clawback;
      const short = spend - net;
      if (Math.abs(short) < 10) break;
      guessNeed = Math.max(0, guessNeed + short);
      if (sumAccounts(balances) <= 0) break;
    }

    totalTax += taxes;
    totalClawback += clawback;

    if (!depletionAge && sumAccounts(balances) <= 0) depletionAge = age;

    for (const key of Object.keys(balances)) {
      balances[key] *= 1 + returnRate;
    }
  }

  const reasons = strategyReasons(strategyKey);

  return {
    key: strategyKey,
    label: strategyLabel(strategyKey),
    totalTax,
    totalClawback,
    depletionAge,
    reasons,
  };
}

function growAccountsToRetirement(plan, accounts, annualContribution, contributionIncrease, returnRate, years) {
  const next = {
    rrsp: Math.max(0, accounts.rrsp),
    tfsa: Math.max(0, accounts.tfsa),
    nonRegistered: Math.max(0, accounts.nonRegistered),
    cash: Math.max(0, accounts.cash),
  };

  const total = sumAccounts(next);
  if (total <= 0) {
    next.rrsp = plan.savings.currentTotal * 0.5;
    next.tfsa = plan.savings.currentTotal * 0.3;
    next.nonRegistered = plan.savings.currentTotal * 0.15;
    next.cash = plan.savings.currentTotal * 0.05;
  }

  const startAge = ageNow();
  for (let i = 0; i < years; i += 1) {
    const age = startAge + i;
    const capitalInject = getCapitalInjectAtAge(plan, age);
    if (capitalInject > 0) next.cash += capitalInject;
    const contributionThisYear = annualContribution * Math.pow(1 + contributionIncrease, i);
    next.rrsp = (next.rrsp + contributionThisYear * 0.5) * (1 + returnRate);
    next.tfsa = (next.tfsa + contributionThisYear * 0.35) * (1 + returnRate);
    next.nonRegistered = (next.nonRegistered + contributionThisYear * 0.1) * (1 + returnRate);
    next.cash += contributionThisYear * 0.05;
  }

  return next;
}

function distributeFromAccounts(order, balances, amount) {
  let remaining = Math.max(0, amount);
  const draw = { rrsp: 0, tfsa: 0, nonRegistered: 0, cash: 0, total: 0 };

  for (const key of order) {
    if (remaining <= 0) break;
    const available = Math.max(0, balances[key]);
    const used = Math.min(available, remaining);
    balances[key] = available - used;
    draw[key] += used;
    draw.total += used;
    remaining -= used;
  }

  return draw;
}

function getWithdrawalOrder(strategyKey, context) {
  if (strategyKey === "rrsp-first") return ["rrsp", "nonRegistered", "tfsa", "cash"];
  if (strategyKey === "tfsa-first") return ["tfsa", "cash", "nonRegistered", "rrsp"];

  const threshold = 93000;
  if (context.taxableBeforeWithdrawals > threshold * 0.9) return ["tfsa", "cash", "nonRegistered", "rrsp"];
  if (context.taxableBeforeWithdrawals < 50000 && context.balances.rrsp > context.balances.tfsa) {
    return ["rrsp", "nonRegistered", "tfsa", "cash"];
  }
  return ["nonRegistered", "tfsa", "rrsp", "cash"];
}

function strategyReasons(strategyKey) {
  if (strategyKey === "rrsp-first") {
    return [
      "Draws taxable registered funds earlier to reduce future forced RRIF pressure.",
      "Can work when current taxable income is relatively low.",
      "May reduce late-retirement concentration in fully taxable accounts.",
    ];
  }
  if (strategyKey === "tfsa-first") {
    return [
      "Uses tax-free balances first to reduce immediate tax drag.",
      "Keeps taxable income lower in early years.",
      "Can increase later taxes if registered balances remain large.",
    ];
  }
  return [
    "Prioritizes lower immediate tax impact while monitoring clawback risk.",
    "Adjusts order based on taxable income level and account mix.",
    "Targets smoother taxes across retirement years rather than one strict order.",
  ];
}

function strategyLabel(key) {
  if (key === "rrsp-first") return "RRSP-first";
  if (key === "tfsa-first") return "TFSA-first";
  return "Tax-smart";
}

function buildNextActions(model) {
  const actions = [];
  if (model.kpis.firstYearGap < 0) {
    actions.push("Increase annual contribution or adjust retirement spending target.");
    actions.push("Consider delaying retirement age by 1-2 years.");
  } else {
    actions.push("You currently show a first-year surplus. Validate assumptions with stress tests.");
  }

  if (model.kpis.depletionAge) {
    actions.push(`Savings deplete at age ${model.kpis.depletionAge}. Test lower spending or higher guaranteed income.`);
  } else {
    actions.push("Balance remains through plan horizon under base assumptions.");
  }

  if (!state.uiState.unlocked.advanced) actions.push("Finish guided setup to unlock tax and withdrawal strategy comparisons.");

  return actions;
}

function estimateSustainableIncome(rows, retireAge) {
  const retirementRows = rows.filter((row) => row.age >= retireAge);
  if (!retirementRows.length) return 0;
  const withdrawals = retirementRows.map((row) => row.withdrawal);
  const avg = withdrawals.reduce((sum, value) => sum + value, 0) / withdrawals.length;
  return avg;
}

function adjustedCPP(amountAt65, startAge) {
  const ageDiff = startAge - 65;
  if (ageDiff >= 0) return amountAt65 * (1 + ageDiff * 0.084);
  return amountAt65 * Math.max(0.58, 1 + ageDiff * 0.072);
}

function adjustedOAS(amountAt65, startAge) {
  const safeAge = Math.max(65, startAge);
  const ageDiff = safeAge - 65;
  return amountAt65 * (1 + ageDiff * 0.072);
}

function estimateOasClawback(plan, taxableIncome, oasAmount, yearOffset) {
  if (!oasAmount) return 0;
  const thresholdBase = 93000;
  const threshold = plan.assumptions.taxBracketInflation
    ? thresholdBase * Math.pow(1 + plan.assumptions.inflation, yearOffset)
    : thresholdBase;
  const excess = Math.max(0, taxableIncome - threshold);
  return Math.min(oasAmount, excess * 0.15);
}

function estimateEffectiveTaxRate(plan, income, yearOffset) {
  const taxable = Math.max(0, income);
  if (taxable <= 0) return 0;

  const federal = computeBracketTax(taxable, TAX_BRACKETS.federal, plan, yearOffset);
  const provincialBase = TAX_BRACKETS.provincial[plan.profile.province] || TAX_BRACKETS.provincial.NL;
  const provincial = computeBracketTax(taxable, provincialBase, plan, yearOffset);

  const grossTax = federal + provincial;
  const effective = grossTax / taxable;
  return clamp(effective, 0, 0.53);
}

function computeBracketTax(income, bracket, plan, yearOffset) {
  const inflationFactor = plan.assumptions.taxBracketInflation
    ? Math.pow(1 + plan.assumptions.inflation, yearOffset)
    : 1;

  const thresholds = bracket.thresholds.map((t) => t * inflationFactor);
  const rates = bracket.rates;

  let tax = 0;
  for (let i = 0; i < rates.length; i += 1) {
    const floor = thresholds[i];
    const ceiling = thresholds[i + 1] ?? Number.POSITIVE_INFINITY;
    const taxableInBand = Math.max(0, Math.min(income, ceiling) - floor);
    if (taxableInBand <= 0) continue;
    tax += taxableInBand * rates[i];
  }

  return tax;
}

function drawMainChart(rows, bestRows, worstRows) {
  const canvas = el.mainChart;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(800, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(320 * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = 320;
  const pad = { left: 54, right: 16, top: 18, bottom: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);

  const values = [];
  rows.forEach((row) => {
    values.push(row.balance, row.spending, row.pension, row.cpp, row.oas);
  });
  (bestRows || []).forEach((row) => values.push(row.balance));
  (worstRows || []).forEach((row) => values.push(row.balance));
  const maxY = Math.max(1, ...values) * 1.06;

  ctx.strokeStyle = "#dfe7f3";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (innerH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

  const x = (index) => pad.left + (innerW * index) / Math.max(1, rows.length - 1);
  const y = (value) => pad.top + innerH - (value / maxY) * innerH;
  const baselineY = pad.top + innerH;

  const balanceGradient = ctx.createLinearGradient(pad.left, pad.top, w - pad.right, h - pad.bottom);
  balanceGradient.addColorStop(0, "#0f6abf");
  balanceGradient.addColorStop(1, "#0ea5a8");
  const balanceArea = ctx.createLinearGradient(0, pad.top, 0, baselineY);
  balanceArea.addColorStop(0, "rgba(15, 106, 191, 0.26)");
  balanceArea.addColorStop(1, "rgba(14, 165, 168, 0.04)");

  if (Array.isArray(bestRows) && bestRows.length === rows.length) {
    plotLine(ctx, bestRows.map((r, i) => [x(i), y(r.balance)]), "#7aa7d8", 1.8, [4, 4]);
  }
  if (Array.isArray(worstRows) && worstRows.length === rows.length) {
    plotLine(ctx, worstRows.map((r, i) => [x(i), y(r.balance)]), "#7aa7d8", 1.8, [4, 4]);
  }

  const balancePoints = rows.map((r, i) => [x(i), y(r.balance)]);
  if (balancePoints.length > 1) {
    ctx.beginPath();
    ctx.moveTo(balancePoints[0][0], baselineY);
    balancePoints.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(balancePoints[balancePoints.length - 1][0], baselineY);
    ctx.closePath();
    ctx.fillStyle = balanceArea;
    ctx.fill();
  }

  plotLine(ctx, balancePoints, balanceGradient, 2.8);
  plotLine(ctx, rows.map((r, i) => [x(i), y(r.spending)]), "#d9485f", 2);
  plotLine(ctx, rows.map((r, i) => [x(i), y(r.pension)]), "#f59e0b", 1.8);
  plotLine(ctx, rows.map((r, i) => [x(i), y(r.cpp)]), "#16a34a", 1.8);
  plotLine(ctx, rows.map((r, i) => [x(i), y(r.oas)]), "#0ea5a8", 1.8);

  ctx.fillStyle = "#5f6b7d";
  ctx.font = "12px Avenir Next";
  ctx.fillText(formatCurrency(0), 8, h - 10);
  ctx.fillText(formatCompactCurrency(maxY), 8, pad.top + 4);

  const first = rows[0];
  const last = rows[rows.length - 1];
  const approxTickCount = Math.max(3, Math.floor(innerW / 120));
  const step = Math.max(1, Math.ceil((rows.length - 1) / approxTickCount));
  for (let i = 0; i < rows.length; i += step) {
    const label = `Age ${rows[i].age}`;
    const lx = x(i);
    const lw = ctx.measureText(label).width;
    const drawX = Math.max(pad.left, Math.min(w - pad.right - lw, lx - lw / 2));
    ctx.fillText(label, drawX, h - 10);
  }
  const endLabel = `Age ${last.age}`;
  const endWidth = ctx.measureText(endLabel).width;
  ctx.fillText(endLabel, w - pad.right - endWidth, h - 10);
}

function plotLine(ctx, points, color, width, dash = []) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p[0], p[1]);
    else ctx.lineTo(p[0], p[1]);
  });
  ctx.stroke();
  ctx.setLineDash([]);
}

function openTooltip(key, anchor) {
  const tip = TOOLTIPS[key];
  if (!tip) return;

  closeTooltip();
  ui.tooltipKey = key;

  const rect = anchor.getBoundingClientRect();
  const pop = document.createElement("div");
  pop.className = "tooltip-popover";
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", `${tip.term} information`);
  pop.innerHTML = `
    <h4>${escapeHtml(tip.term)}</h4>
    <p><strong>Plain language:</strong> ${escapeHtml(tip.plain)}</p>
    <p><strong>Why it matters:</strong> ${escapeHtml(tip.why)}</p>
    <p><strong>Typical range:</strong> ${escapeHtml(tip.range)}</p>
    <button class="btn btn-primary" type="button" data-action="tooltip-example" data-value="${escapeHtml(key)}">Show example</button>
    <p class="tooltip-example muted"></p>
  `;

  const top = rect.bottom + window.scrollY + 8;
  const left = Math.max(10, Math.min(window.innerWidth - 330, rect.left + window.scrollX - 140));
  pop.style.top = `${top}px`;
  pop.style.left = `${left}px`;
  el.tooltipLayer.appendChild(pop);
}

function closeTooltip() {
  ui.tooltipKey = "";
  el.tooltipLayer.innerHTML = "";
}

function openGlossary() {
  const entries = Object.values(TOOLTIPS).sort((a, b) => a.term.localeCompare(b.term));
  el.glossaryContent.innerHTML = entries.map((entry) => `
    <article class="glossary-item">
      <h3>${escapeHtml(entry.term)}</h3>
      <p><strong>Plain language:</strong> ${escapeHtml(entry.plain)}</p>
      <p><strong>Why it matters:</strong> ${escapeHtml(entry.why)}</p>
      <p><strong>Typical range:</strong> ${escapeHtml(entry.range)}</p>
      <p><strong>Example:</strong> ${escapeHtml(entry.example || "-")}</p>
    </article>
  `).join("");

  el.glossaryModal?.showModal();
}

function exportJson() {
  const exportObject = {
    ...state,
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
  toast("Plan exported.");
}

async function importJsonFromFile() {
  const file = el.importJsonFile?.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizePlan(parsed);
    state = normalized;
    state.uiState.firstRun = false;
    ui.activeNav = state.uiState.activeNav || "dashboard";
    savePlan();
    renderAll();
    toast("Plan imported.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    toast(`Import error: ${message}`);
  } finally {
    el.importJsonFile.value = "";
  }
}

function loadPlan() {
  try {
    const raw = localStorage.getItem(APP.storageKey);
    if (!raw) return createDefaultPlan();
    return normalizePlan(JSON.parse(raw));
  } catch {
    return createDefaultPlan();
  }
}

function savePlan() {
  try {
    localStorage.setItem(APP.storageKey, JSON.stringify(state));
  } catch {
    toast("Could not save to local storage.");
  }
}

function normalizePlan(input) {
  if (!input || typeof input !== "object") throw new Error("Plan file is not a valid object.");

  const migrated = migratePlan(input);
  const base = createDefaultPlan();

  const out = {
    version: APP.version,
    profile: {
      ...base.profile,
      ...(migrated.profile || {}),
    },
    assumptions: {
      ...base.assumptions,
      ...(migrated.assumptions || {}),
      returns: {
        ...base.assumptions.returns,
        ...(migrated.assumptions?.returns || {}),
      },
    },
    savings: {
      ...base.savings,
      ...(migrated.savings || {}),
      capitalInjects: normalizeCapitalInjects(
        migrated.savings?.capitalInjects ?? base.savings.capitalInjects,
        Number(migrated.profile?.retirementAge || base.profile.retirementAge)
      ),
    },
    income: {
      pension: { ...base.income.pension, ...(migrated.income?.pension || {}) },
      cpp: { ...base.income.cpp, ...(migrated.income?.cpp || {}) },
      oas: { ...base.income.oas, ...(migrated.income?.oas || {}) },
      spouse: { ...base.income.spouse, ...(migrated.income?.spouse || {}) },
    },
    accounts: {
      ...base.accounts,
      ...(migrated.accounts || {}),
    },
    strategy: {
      ...base.strategy,
      ...(migrated.strategy || {}),
    },
    uiState: {
      ...base.uiState,
      ...(migrated.uiState || {}),
      unlocked: {
        ...base.uiState.unlocked,
        ...(migrated.uiState?.unlocked || {}),
      },
    },
    notes: typeof migrated.notes === "string" ? migrated.notes : "",
  };

  validatePlan(out);
  return out;
}

function validatePlan(plan) {
  if (!plan.profile || !plan.assumptions || !plan.savings || !plan.income) {
    throw new Error("Plan is missing required sections.");
  }
  if (!PROVINCES[plan.profile.province]) throw new Error("Unsupported province code.");

  const numericChecks = [
    ["profile.birthYear", plan.profile.birthYear],
    ["profile.retirementAge", plan.profile.retirementAge],
    ["profile.lifeExpectancy", plan.profile.lifeExpectancy],
    ["profile.desiredSpending", plan.profile.desiredSpending],
    ["savings.currentTotal", plan.savings.currentTotal],
    ["savings.annualContribution", plan.savings.annualContribution],
    ["savings.contributionIncrease", plan.savings.contributionIncrease],
  ];

  for (const [path, value] of numericChecks) {
    if (!Number.isFinite(Number(value))) throw new Error(`Invalid numeric value at ${path}.`);
  }

  if (!Array.isArray(plan.savings.capitalInjects)) throw new Error("Invalid capital inject list.");
}

function migratePlan(plan) {
  const version = Number(plan.version || 1);
  if (version >= APP.version) return plan;

  const next = { ...plan };
  if (!next.strategy) next.strategy = { withdrawal: "tax-smart", oasClawbackModeling: true };
  if (!next.accounts) next.accounts = { rrsp: 0, tfsa: 0, nonRegistered: 0, cash: 0 };
  if (!next.uiState) next.uiState = createDefaultPlan().uiState;
  if (!next.savings) next.savings = createDefaultPlan().savings;
  if (!Array.isArray(next.savings.capitalInjects)) next.savings.capitalInjects = [];
  next.version = APP.version;
  return next;
}

function ensureValidState() {
  state.profile.birthYear = clamp(Number(state.profile.birthYear), 1940, APP.currentYear - 18);
  state.profile.retirementAge = clamp(Number(state.profile.retirementAge), 50, 75);
  state.profile.lifeExpectancy = clamp(Number(state.profile.lifeExpectancy), state.profile.retirementAge + 1, 105);

  state.profile.desiredSpending = Math.max(12000, Number(state.profile.desiredSpending));

  state.assumptions.inflation = normalizePct(state.assumptions.inflation);
  state.assumptions.scenarioSpread = normalizePct(state.assumptions.scenarioSpread);
  state.assumptions.volatility = normalizePct(state.assumptions.volatility);
  state.assumptions.returns.conservative = normalizePct(state.assumptions.returns.conservative);
  state.assumptions.returns.balanced = normalizePct(state.assumptions.returns.balanced);
  state.assumptions.returns.aggressive = normalizePct(state.assumptions.returns.aggressive);

  state.savings.currentTotal = Math.max(0, Number(state.savings.currentTotal));
  state.savings.annualContribution = Math.max(0, Number(state.savings.annualContribution));
  state.savings.contributionIncrease = clamp(normalizePct(state.savings.contributionIncrease), 0, 0.2);
  state.savings.capitalInjects = normalizeCapitalInjects(state.savings.capitalInjects, state.profile.retirementAge);

  state.income.cpp.startAge = clamp(Number(state.income.cpp.startAge), 60, 70);
  state.income.oas.startAge = clamp(Number(state.income.oas.startAge), 65, 70);
  state.income.pension.startAge = clamp(Number(state.income.pension.startAge), 50, 75);
  state.income.pension.amount = Math.max(0, Number(state.income.pension.amount));
  state.income.cpp.amountAt65 = Math.max(0, Number(state.income.cpp.amountAt65));
  state.income.oas.amountAt65 = Math.max(0, Number(state.income.oas.amountAt65));
  state.income.spouse.pensionStartAge = clamp(Number(state.income.spouse.pensionStartAge), 50, 75);
  state.income.spouse.cppStartAge = clamp(Number(state.income.spouse.cppStartAge), 60, 70);
  state.income.spouse.oasStartAge = clamp(Number(state.income.spouse.oasStartAge), 65, 70);
  state.income.spouse.pensionAmount = Math.max(0, Number(state.income.spouse.pensionAmount));
  state.income.spouse.cppAmountAt65 = Math.max(0, Number(state.income.spouse.cppAmountAt65));
  state.income.spouse.oasAmountAt65 = Math.max(0, Number(state.income.spouse.oasAmountAt65));

  if (!PROVINCES[state.profile.province]) state.profile.province = APP.defaultProvince;
}

function createDefaultPlan() {
  return {
    version: APP.version,
    profile: {
      province: APP.defaultProvince,
      birthYear: APP.currentYear - 35,
      retirementAge: 65,
      lifeExpectancy: 92,
      desiredSpending: 60000,
      hasSpouse: false,
    },
    assumptions: {
      inflation: 0.02,
      returns: {
        conservative: RISK_RETURNS.conservative,
        balanced: RISK_RETURNS.balanced,
        aggressive: RISK_RETURNS.aggressive,
      },
      riskProfile: "balanced",
      scenarioSpread: 0.02,
      volatility: 0.09,
      taxBracketInflation: true,
    },
    savings: {
      currentTotal: 120000,
      annualContribution: 9000,
      contributionIncrease: 0,
      capitalInjects: [],
    },
    income: {
      pension: {
        enabled: false,
        amount: 0,
        startAge: 65,
      },
      cpp: {
        amountAt65: 12000,
        startAge: 65,
      },
      oas: {
        amountAt65: 9000,
        startAge: 65,
      },
      spouse: {
        enabled: false,
        pensionAmount: 0,
        pensionStartAge: 65,
        cppAmountAt65: 10000,
        cppStartAge: 65,
        oasAmountAt65: 8500,
        oasStartAge: 65,
      },
    },
    accounts: {
      rrsp: 70000,
      tfsa: 35000,
      nonRegistered: 10000,
      cash: 5000,
    },
    strategy: {
      withdrawal: "tax-smart",
      oasClawbackModeling: true,
    },
    uiState: {
      firstRun: true,
      hasStarted: false,
      activeNav: "guided",
      wizardStep: 1,
      showScenarioCompare: false,
      unlocked: {
        advanced: false,
        spouse: false,
      },
    },
    notes: "",
  };
}

function createDemoPlan() {
  const plan = createDefaultPlan();
  plan.profile.birthYear = APP.currentYear - 45;
  plan.profile.retirementAge = 63;
  plan.profile.lifeExpectancy = 94;
  plan.profile.desiredSpending = 70000;
  plan.savings.currentTotal = 380000;
  plan.savings.annualContribution = 12000;
  plan.assumptions.riskProfile = "balanced";
  plan.income.pension.enabled = true;
  plan.income.pension.amount = 15000;
  plan.income.pension.startAge = 63;
  plan.income.cpp.amountAt65 = 13000;
  plan.income.cpp.startAge = 65;
  plan.income.oas.amountAt65 = 9200;
  plan.income.oas.startAge = 67;
  plan.accounts = {
    rrsp: 210000,
    tfsa: 110000,
    nonRegistered: 45000,
    cash: 15000,
  };
  plan.savings.capitalInjects = [
    { id: createLocalId(), enabled: true, label: "Downsize home", amount: 180000, age: 67 },
  ];
  plan.uiState.firstRun = false;
  plan.uiState.hasStarted = true;
  plan.uiState.activeNav = "dashboard";
  plan.uiState.wizardStep = 5;
  plan.uiState.unlocked.advanced = true;
  plan.notes = "Demo assumptions loaded. Review advanced strategy and stress tests.";
  return plan;
}

function createLocalId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createCapitalInjectItem() {
  return {
    id: createLocalId(),
    enabled: true,
    label: "Lump sum",
    amount: 50000,
    age: Math.max(state.profile.retirementAge, ageNow()),
  };
}

function numberField(label, bind, value, attrs, tooltipKey, percentInput = false, disabled = false) {
  const finalValue = percentInput ? formatNumber(value) : formatNumber(value);
  const attrString = Object.entries(attrs || {})
    .map(([k, v]) => `${k}="${String(v)}"`)
    .join(" ");

  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
      <input
        type="number"
        data-bind="${bind}"
        data-type="number"
        ${percentInput ? 'data-percent-input="1"' : ""}
        value="${finalValue}"
        ${attrString}
        ${disabled ? "disabled" : ""}
        aria-label="${escapeHtml(label)}"
      />
    </label>
  `;
}

function selectField(label, bind, options, selected, tooltipKey) {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
      <select data-bind="${bind}" aria-label="${escapeHtml(label)}">
        ${options.map((opt) => `
          <option value="${opt.value}" ${opt.value === selected ? "selected" : ""}>${escapeHtml(opt.label)}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderCapitalInjectRows() {
  const items = Array.isArray(state.savings.capitalInjects) ? state.savings.capitalInjects : [];
  if (!items.length) return "<p class='muted form-span-full'>No lump-sum events added yet.</p>";

  return items.map((item, index) => `
    <div class="subsection form-span-full">
      <div class="wizard-grid">
        <label class="form-span-full inline-check">
          <input type="checkbox" data-bind="savings.capitalInjects.${index}.enabled" ${item.enabled ? "checked" : ""} />
          Include this event
        </label>
        <label>
          <span class="label-row">Event label</span>
          <input type="text" data-bind="savings.capitalInjects.${index}.label" value="${escapeHtml(item.label || "Lump sum")}" aria-label="Lump sum label" />
        </label>
        ${numberField("Amount", `savings.capitalInjects.${index}.amount`, Number(item.amount || 0), { min: 0, max: 5000000, step: 1000 }, "capitalInjectAmount")}
        ${numberField("Age received", `savings.capitalInjects.${index}.age`, Number(item.age || state.profile.retirementAge), { min: 45, max: 105, step: 1 }, "capitalInjectAge")}
      </div>
      <div class="landing-actions">
        <button type="button" class="btn btn-secondary" data-action="remove-capital-inject" data-value="${escapeHtml(item.id)}">Remove event</button>
      </div>
    </div>
  `).join("");
}

function tooltipButton(key) {
  return `<button class="tooltip-trigger" type="button" aria-label="Help: ${escapeHtml(key)}" data-tooltip-key="${escapeHtml(key)}">ⓘ</button>`;
}

function riskButton(key) {
  const active = state.assumptions.riskProfile === key;
  return `<button type="button" class="pill-radio ${active ? "active" : ""}" data-action="risk" data-value="${key}" aria-pressed="${active}">${capitalize(key)}</button>`;
}

function strategyButton(key, label) {
  const active = state.strategy.withdrawal === key;
  return `<button type="button" class="pill-radio ${active ? "active" : ""}" data-action="strategy" data-value="${key}" aria-pressed="${active}">${label}</button>`;
}

function accordionSection(id, title, affects, content) {
  const open = !!ui.advancedOpen[id];
  return `
    <details class="accordion" data-accordion-id="${escapeHtml(id)}" ${open ? "open" : ""}>
      <summary>${escapeHtml(title)}</summary>
      <div class="accordion-content">
        <p class="what-affects"><strong>What this affects:</strong> ${escapeHtml(affects)}</p>
        ${content}
      </div>
    </details>
  `;
}

function captureAdvancedAccordionState() {
  const sections = Array.from(document.querySelectorAll("#advancedAccordion details[data-accordion-id]"));
  if (!sections.length) return;
  sections.forEach((details) => {
    const id = details.getAttribute("data-accordion-id");
    if (!id) return;
    ui.advancedOpen[id] = details.open;
  });
}

function handleDetailsToggle(event) {
  const target = event.target;
  if (!(target instanceof HTMLDetailsElement)) return;
  if (!target.matches("#advancedAccordion details[data-accordion-id]")) return;
  const id = target.getAttribute("data-accordion-id");
  if (!id) return;
  ui.advancedOpen[id] = target.open;
}

function getReturnRate(plan) {
  const profile = plan.assumptions.riskProfile;
  return plan.assumptions.returns[profile] || plan.assumptions.returns.balanced;
}

function ageNow() {
  return APP.currentYear - state.profile.birthYear;
}

function inflateAmountToRetirement(amount, inflationRate, years) {
  return amount * Math.pow(1 + inflationRate, Math.max(0, years));
}

function normalizeCapitalInjects(items, defaultAge = 65) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      id: String(item?.id || createLocalId()),
      enabled: Boolean(item?.enabled ?? true),
      label: String(item?.label || "Lump sum").trim() || "Lump sum",
      amount: Math.max(0, Number(item?.amount || 0)),
      age: clamp(Number(item?.age || defaultAge), 45, 105),
    }))
    .slice(0, 12);
}

function getCapitalInjectAtAge(plan, age) {
  const items = Array.isArray(plan.savings?.capitalInjects) ? plan.savings.capitalInjects : [];
  return items.reduce((sum, item) => {
    if (!item.enabled) return sum;
    return Number(item.age) === Number(age) ? sum + Math.max(0, Number(item.amount || 0)) : sum;
  }, 0);
}

function toPct(decimal) {
  return Number(decimal) * 100;
}

function normalizePct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n > 1) return n / 100;
  return n;
}

function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatSignedPct(value) {
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value || 0);
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 1, notation: "compact" }).format(value || 0);
}

function formatSignedCurrency(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value)}`;
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n * 1000) / 1000);
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let ref = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!ref[key] || typeof ref[key] !== "object") ref[key] = {};
    ref = ref[key];
  }

  const finalKey = keys[keys.length - 1];

  ref[finalKey] = value;
}

function sumAccounts(accounts) {
  return Math.max(0, accounts.rrsp) + Math.max(0, accounts.tfsa) + Math.max(0, accounts.nonRegistered) + Math.max(0, accounts.cash);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(message) {
  el.appToast.textContent = message;
  el.appToast.classList.add("visible");
  clearTimeout(ui.toastTimer);
  ui.toastTimer = setTimeout(() => {
    el.appToast.classList.remove("visible");
  }, 2200);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // ignore registration errors in local file mode
  });
}
