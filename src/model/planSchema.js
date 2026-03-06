export function createLocalId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultLearnState() {
  return {
    phaseDefaultsSeeded: false,
    inflation: {
      spendingToday: 80000,
      years: 10,
      rate: 0.025,
    },
    indexedIncome: {
      startIncome: 30000,
      years: 25,
      inflation: 0.02,
      highlight: "indexed",
    },
    taxGrossUp: {
      netGoal: 80000,
      rate: 0.22,
    },
    rrif: {
      age: 72,
      balance: 600000,
    },
    oas: {
      income: 95000,
      monthly: 742,
      recipients: 1,
    },
    spousalSplit: {
      spouseA: 70000,
      spouseB: 30000,
      splitPct: 0.25,
    },
    phases: {
      base: 80000,
      goYears: 10,
      goPct: 1.1,
      slowYears: 10,
      slowPct: 0.9,
      noYears: 10,
      noPct: 0.75,
    },
  };
}

export function createDefaultLearningProgress(learnProgressItems) {
  return (learnProgressItems || []).reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {});
}

export function normalizeLearnState(input) {
  const base = createDefaultLearnState();
  const wasSeeded = Boolean(input?.phaseDefaultsSeeded);
  const out = {
    phaseDefaultsSeeded: true,
    inflation: { ...base.inflation, ...(input?.inflation || {}) },
    indexedIncome: { ...base.indexedIncome, ...(input?.indexedIncome || {}) },
    taxGrossUp: { ...base.taxGrossUp, ...(input?.taxGrossUp || {}) },
    rrif: { ...base.rrif, ...(input?.rrif || {}) },
    oas: { ...base.oas, ...(input?.oas || {}) },
    spousalSplit: { ...base.spousalSplit, ...(input?.spousalSplit || {}) },
    phases: { ...base.phases, ...(input?.phases || {}) },
  };

  out.inflation.spendingToday = Math.max(10000, Number(out.inflation.spendingToday));
  out.inflation.years = clamp(Number(out.inflation.years), 0, 45);
  out.inflation.rate = clamp(normalizePct(out.inflation.rate), 0.005, 0.08);

  out.indexedIncome.startIncome = Math.max(0, Number(out.indexedIncome.startIncome));
  out.indexedIncome.years = clamp(Number(out.indexedIncome.years), 1, 40);
  out.indexedIncome.inflation = clamp(normalizePct(out.indexedIncome.inflation), 0, 0.08);
  out.indexedIncome.highlight = out.indexedIncome.highlight === "flat" ? "flat" : "indexed";

  out.taxGrossUp.netGoal = Math.max(12000, Number(out.taxGrossUp.netGoal));
  out.taxGrossUp.rate = clamp(normalizePct(out.taxGrossUp.rate), 0.05, 0.45);

  out.rrif.age = clamp(Number(out.rrif.age), 65, 95);
  out.rrif.balance = Math.max(0, Number(out.rrif.balance));

  out.oas.income = Math.max(0, Number(out.oas.income));
  out.oas.monthly = Math.max(0, Number(out.oas.monthly));
  out.oas.recipients = clamp(Number(out.oas.recipients), 1, 2);

  out.spousalSplit.spouseA = Math.max(0, Number(out.spousalSplit.spouseA));
  out.spousalSplit.spouseB = Math.max(0, Number(out.spousalSplit.spouseB));
  out.spousalSplit.splitPct = clamp(normalizePct(out.spousalSplit.splitPct), 0, 0.5);

  out.phases.base = Math.max(12000, Number(out.phases.base));
  out.phases.goYears = clamp(Number(out.phases.goYears), 1, 20);
  out.phases.slowYears = clamp(Number(out.phases.slowYears), 1, 20);
  out.phases.noYears = clamp(Number(out.phases.noYears), 1, 25);
  out.phases.goPct = normalizePhasePct(out.phases.goPct, 0.6, 1.5);
  out.phases.slowPct = normalizePhasePct(out.phases.slowPct, 0.5, 1.3);
  out.phases.noPct = normalizePhasePct(out.phases.noPct, 0.4, 1.2);
  if (!wasSeeded) {
    out.phases.goPct = 1.1;
    out.phases.slowPct = 0.9;
    out.phases.noPct = 0.75;
  }

  return out;
}

export function normalizeCapitalInjects(items, defaultAge = 65) {
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

export function createDefaultPlan({ app, riskReturns, learnProgressItems }) {
  return {
    version: app.version,
    profile: {
      province: app.defaultProvince,
      birthYear: app.currentYear - 35,
      retirementAge: 65,
      lifeExpectancy: 92,
      desiredSpending: 60000,
      hasSpouse: false,
    },
    assumptions: {
      inflation: 0.02,
      returns: {
        conservative: riskReturns.conservative,
        balanced: riskReturns.balanced,
        aggressive: riskReturns.aggressive,
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
      pension: { enabled: false, amount: 0, startAge: 65 },
      cpp: { amountAt65: 12000, startAge: 65 },
      oas: { amountAt65: 9000, startAge: 65 },
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
      rrifConversionAge: 71,
      applyRrifMinimums: true,
      meltdownEnabled: false,
      meltdownAmount: 0,
      meltdownStartAge: 60,
      meltdownEndAge: 65,
      meltdownIncomeCeiling: 0,
    },
    uiState: {
      firstRun: true,
      hasStarted: false,
      activeNav: "start",
      wizardStep: 1,
      showScenarioCompare: false,
      showAdvancedControls: false,
      advancedSearch: "",
      supportDismissedUntil: 0,
      supportCardShownCount: 0,
      supportCardDismissCount: 0,
      lastSupportTriggerReason: "",
      supportOptOut: false,
      supportShownEvents: {
        wizardComplete: false,
        firstGrossUp: false,
        firstClawback: false,
        reportGenerated: false,
      },
      lastSharedScenarioBannerDismissed: false,
      justCompletedWizard: false,
      selectedScenarioLabel: "",
      showGrossWithdrawals: true,
      emphasizeTaxes: true,
      timelineSelectedAge: null,
      incomeMap: {
        startAge: null,
        windowYears: 25,
        highlightKeyAges: true,
        showTable: false,
      },
      lastChangeSummary: null,
      scenarios: [],
      timingSim: {
        cppStartAge: 65,
        oasStartAge: 65,
        linkTiming: false,
      },
      clientSummary: {
        enabled: false,
        preparedFor: "",
        scenarioLabel: "",
        preparedBy: "",
        summaryDate: "",
      },
      learn: createDefaultLearnState(),
      learningProgress: createDefaultLearningProgress(learnProgressItems),
      unlocked: {
        advanced: false,
        spouse: false,
      },
    },
    notes: "",
  };
}

export function createDemoPlan({ app, riskReturns, learnProgressItems }) {
  const plan = createDefaultPlan({ app, riskReturns, learnProgressItems });
  plan.profile.birthYear = app.currentYear - 45;
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
  plan.uiState.wizardStep = 7;
  plan.uiState.unlocked.advanced = true;
  plan.notes = "Demo assumptions loaded. Review advanced strategy and stress tests.";
  return plan;
}

export function normalizePlan(input, { app, provinces, riskReturns, learnProgressItems }) {
  if (!input || typeof input !== "object") throw new Error("Plan file is not a valid object.");
  const migrated = migratePlan(input, { app, riskReturns, learnProgressItems });
  const base = createDefaultPlan({ app, riskReturns, learnProgressItems });

  const out = {
    ...base,
    ...migrated,
    profile: { ...base.profile, ...(migrated.profile || {}) },
    assumptions: {
      ...base.assumptions,
      ...(migrated.assumptions || {}),
      returns: { ...base.assumptions.returns, ...(migrated.assumptions?.returns || {}) },
    },
    savings: {
      ...base.savings,
      ...(migrated.savings || {}),
      capitalInjects: normalizeCapitalInjects(
        migrated.savings?.capitalInjects ?? base.savings.capitalInjects,
        migrated.profile?.retirementAge ?? base.profile.retirementAge
      ),
    },
    income: {
      ...base.income,
      ...(migrated.income || {}),
      pension: { ...base.income.pension, ...(migrated.income?.pension || {}) },
      cpp: { ...base.income.cpp, ...(migrated.income?.cpp || {}) },
      oas: { ...base.income.oas, ...(migrated.income?.oas || {}) },
      spouse: { ...base.income.spouse, ...(migrated.income?.spouse || {}) },
    },
    accounts: { ...base.accounts, ...(migrated.accounts || {}) },
    strategy: { ...base.strategy, ...(migrated.strategy || {}) },
    uiState: {
      ...base.uiState,
      ...(migrated.uiState || {}),
      unlocked: { ...base.uiState.unlocked, ...(migrated.uiState?.unlocked || {}) },
      supportShownEvents: {
        ...base.uiState.supportShownEvents,
        ...(migrated.uiState?.supportShownEvents || {}),
      },
      scenarios: Array.isArray(migrated.uiState?.scenarios) ? migrated.uiState.scenarios : [],
      timingSim: {
        ...base.uiState.timingSim,
        ...(migrated.uiState?.timingSim || {}),
      },
      clientSummary: {
        ...base.uiState.clientSummary,
        ...(migrated.uiState?.clientSummary || {}),
      },
      learn: normalizeLearnState(migrated.uiState?.learn || base.uiState.learn),
      learningProgress: {
        ...createDefaultLearningProgress(learnProgressItems),
        ...(migrated.uiState?.learningProgress || {}),
      },
    },
  };

  validatePlan(out, { app, provinces, learnProgressItems });
  return out;
}

export function ensureValidState(state, { app, provinces, learnProgressItems }) {
  state.profile.birthYear = clamp(Number(state.profile.birthYear), 1940, app.currentYear - 18);
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
  state.strategy.rrifConversionAge = clamp(Number(state.strategy.rrifConversionAge || 71), 65, 75);
  state.strategy.applyRrifMinimums = Boolean(state.strategy.applyRrifMinimums ?? true);
  state.strategy.meltdownEnabled = Boolean(state.strategy.meltdownEnabled);
  state.strategy.meltdownAmount = Math.max(0, Number(state.strategy.meltdownAmount || 0));
  state.strategy.meltdownStartAge = clamp(Number(state.strategy.meltdownStartAge || state.profile.retirementAge), 50, 75);
  state.strategy.meltdownEndAge = clamp(Number(state.strategy.meltdownEndAge || 65), state.strategy.meltdownStartAge, 80);
  state.strategy.meltdownIncomeCeiling = Math.max(0, Number(state.strategy.meltdownIncomeCeiling || 0));
  state.uiState.learn = normalizeLearnState(state.uiState.learn);
  state.uiState.showAdvancedControls = Boolean(state.uiState.showAdvancedControls);
  state.uiState.advancedSearch = String(state.uiState.advancedSearch || "");
  state.uiState.supportDismissedUntil = Math.max(0, Number(state.uiState.supportDismissedUntil || 0));
  state.uiState.supportCardShownCount = Math.max(0, Number(state.uiState.supportCardShownCount || 0));
  state.uiState.supportCardDismissCount = Math.max(0, Number(state.uiState.supportCardDismissCount || 0));
  state.uiState.lastSupportTriggerReason = String(state.uiState.lastSupportTriggerReason || "");
  state.uiState.supportOptOut = Boolean(state.uiState.supportOptOut);
  state.uiState.supportShownEvents = {
    wizardComplete: Boolean(state.uiState.supportShownEvents?.wizardComplete),
    firstGrossUp: Boolean(state.uiState.supportShownEvents?.firstGrossUp),
    firstClawback: Boolean(state.uiState.supportShownEvents?.firstClawback),
    reportGenerated: Boolean(state.uiState.supportShownEvents?.reportGenerated),
  };
  state.uiState.lastSharedScenarioBannerDismissed = Boolean(state.uiState.lastSharedScenarioBannerDismissed);
  state.uiState.justCompletedWizard = Boolean(state.uiState.justCompletedWizard);
  state.uiState.selectedScenarioLabel = String(state.uiState.selectedScenarioLabel || "");
  state.uiState.showGrossWithdrawals = Boolean(state.uiState.showGrossWithdrawals ?? true);
  state.uiState.emphasizeTaxes = Boolean(state.uiState.emphasizeTaxes ?? true);
  state.uiState.timelineSelectedAge = Number.isFinite(Number(state.uiState.timelineSelectedAge))
    ? Number(state.uiState.timelineSelectedAge)
    : null;
  state.uiState.incomeMap = {
    startAge: Number.isFinite(Number(state.uiState.incomeMap?.startAge)) ? Number(state.uiState.incomeMap.startAge) : null,
    windowYears: clamp(Number(state.uiState.incomeMap?.windowYears ?? 25), 8, 45),
    highlightKeyAges: Boolean(state.uiState.incomeMap?.highlightKeyAges ?? true),
    showTable: Boolean(state.uiState.incomeMap?.showTable),
  };
  state.uiState.lastChangeSummary = state.uiState.lastChangeSummary && typeof state.uiState.lastChangeSummary === "object"
    ? state.uiState.lastChangeSummary
    : null;
  state.uiState.scenarios = Array.isArray(state.uiState.scenarios) ? state.uiState.scenarios.slice(-12) : [];
  state.uiState.timingSim = {
    cppStartAge: clamp(Number(state.uiState.timingSim?.cppStartAge ?? state.income.cpp.startAge), 60, 70),
    oasStartAge: clamp(Number(state.uiState.timingSim?.oasStartAge ?? state.income.oas.startAge), 65, 70),
    linkTiming: Boolean(state.uiState.timingSim?.linkTiming),
  };
  state.uiState.clientSummary = {
    enabled: Boolean(state.uiState.clientSummary?.enabled),
    preparedFor: String(state.uiState.clientSummary?.preparedFor || ""),
    scenarioLabel: String(state.uiState.clientSummary?.scenarioLabel || ""),
    preparedBy: String(state.uiState.clientSummary?.preparedBy || ""),
    summaryDate: String(state.uiState.clientSummary?.summaryDate || ""),
  };
  const defaultProgress = createDefaultLearningProgress(learnProgressItems);
  state.uiState.learningProgress = {
    ...defaultProgress,
    ...(state.uiState.learningProgress || {}),
  };

  if (!provinces[state.profile.province]) state.profile.province = app.defaultProvince;
}

function validatePlan(plan, { app, provinces, learnProgressItems }) {
  if (!plan.profile || !plan.assumptions || !plan.savings || !plan.income || !plan.strategy || !plan.uiState) {
    throw new Error("Plan file is missing required sections.");
  }
  if (!provinces[plan.profile.province]) throw new Error("Province code is invalid.");
  if (plan.profile.retirementAge <= 40 || plan.profile.retirementAge >= 90) {
    throw new Error("Retirement age is outside supported planning range.");
  }
  if (plan.profile.lifeExpectancy <= plan.profile.retirementAge) {
    throw new Error("Life expectancy must be greater than retirement age.");
  }
  if (!["conservative", "balanced", "aggressive"].includes(plan.assumptions.riskProfile)) {
    throw new Error("Risk profile is invalid.");
  }
  if (!["tax-smart", "rrsp-first", "tfsa-first"].includes(plan.strategy.withdrawal)) {
    throw new Error("Withdrawal strategy is invalid.");
  }
  plan.uiState.learn = normalizeLearnState(plan.uiState.learn || createDefaultLearnState());
  plan.uiState.learningProgress = {
    ...createDefaultLearningProgress(learnProgressItems),
    ...(plan.uiState.learningProgress || {}),
  };
  plan.uiState.supportDismissedUntil = Math.max(0, Number(plan.uiState.supportDismissedUntil || 0));
  plan.uiState.supportCardShownCount = Math.max(0, Number(plan.uiState.supportCardShownCount || 0));
  plan.uiState.supportCardDismissCount = Math.max(0, Number(plan.uiState.supportCardDismissCount || 0));
  plan.uiState.lastSupportTriggerReason = String(plan.uiState.lastSupportTriggerReason || "");
  plan.uiState.supportOptOut = Boolean(plan.uiState.supportOptOut);
  plan.uiState.supportShownEvents = {
    wizardComplete: Boolean(plan.uiState.supportShownEvents?.wizardComplete),
    firstGrossUp: Boolean(plan.uiState.supportShownEvents?.firstGrossUp),
    firstClawback: Boolean(plan.uiState.supportShownEvents?.firstClawback),
    reportGenerated: Boolean(plan.uiState.supportShownEvents?.reportGenerated),
  };
  plan.uiState.lastSharedScenarioBannerDismissed = Boolean(plan.uiState.lastSharedScenarioBannerDismissed);
  plan.uiState.justCompletedWizard = Boolean(plan.uiState.justCompletedWizard);
  plan.uiState.selectedScenarioLabel = String(plan.uiState.selectedScenarioLabel || "");
  plan.uiState.showGrossWithdrawals = Boolean(plan.uiState.showGrossWithdrawals ?? true);
  plan.uiState.emphasizeTaxes = Boolean(plan.uiState.emphasizeTaxes ?? true);
  plan.uiState.timelineSelectedAge = Number.isFinite(Number(plan.uiState.timelineSelectedAge))
    ? Number(plan.uiState.timelineSelectedAge)
    : null;
  plan.uiState.incomeMap = {
    startAge: Number.isFinite(Number(plan.uiState.incomeMap?.startAge)) ? Number(plan.uiState.incomeMap.startAge) : null,
    windowYears: clamp(Number(plan.uiState.incomeMap?.windowYears ?? 25), 8, 45),
    highlightKeyAges: Boolean(plan.uiState.incomeMap?.highlightKeyAges ?? true),
    showTable: Boolean(plan.uiState.incomeMap?.showTable),
  };
  plan.uiState.lastChangeSummary = plan.uiState.lastChangeSummary && typeof plan.uiState.lastChangeSummary === "object"
    ? plan.uiState.lastChangeSummary
    : null;
  plan.uiState.scenarios = Array.isArray(plan.uiState.scenarios) ? plan.uiState.scenarios.slice(-12) : [];
  plan.uiState.timingSim = {
    cppStartAge: clamp(Number(plan.uiState.timingSim?.cppStartAge ?? plan.income.cpp.startAge), 60, 70),
    oasStartAge: clamp(Number(plan.uiState.timingSim?.oasStartAge ?? plan.income.oas.startAge), 65, 70),
    linkTiming: Boolean(plan.uiState.timingSim?.linkTiming),
  };
  plan.uiState.clientSummary = {
    enabled: Boolean(plan.uiState.clientSummary?.enabled),
    preparedFor: String(plan.uiState.clientSummary?.preparedFor || ""),
    scenarioLabel: String(plan.uiState.clientSummary?.scenarioLabel || ""),
    preparedBy: String(plan.uiState.clientSummary?.preparedBy || ""),
    summaryDate: String(plan.uiState.clientSummary?.summaryDate || ""),
  };
  if (!plan.version) plan.version = app.version;
}

function migratePlan(plan, { app, riskReturns, learnProgressItems }) {
  const next = clonePlan(plan);
  if (!next.version) next.version = 1;
  if (next.version < 2) {
    next.version = 2;
  }
  if (next.version < 3) {
    next.version = 3;
  }
  if (!next.uiState) next.uiState = createDefaultPlan({ app, riskReturns, learnProgressItems }).uiState;
  if (!next.uiState.learn) next.uiState.learn = createDefaultLearnState();
  if (!next.uiState.supportShownEvents) next.uiState.supportShownEvents = { wizardComplete: false, firstGrossUp: false, firstClawback: false };
  if (next.uiState.supportShownEvents.reportGenerated == null) next.uiState.supportShownEvents.reportGenerated = false;
  if (next.uiState.supportDismissedUntil == null) next.uiState.supportDismissedUntil = 0;
  if (next.uiState.supportCardShownCount == null) next.uiState.supportCardShownCount = 0;
  if (next.uiState.supportCardDismissCount == null) next.uiState.supportCardDismissCount = 0;
  if (next.uiState.lastSupportTriggerReason == null) next.uiState.lastSupportTriggerReason = "";
  if (next.uiState.supportOptOut == null) next.uiState.supportOptOut = false;
  if (next.uiState.lastSharedScenarioBannerDismissed == null) next.uiState.lastSharedScenarioBannerDismissed = false;
  if (next.uiState.justCompletedWizard == null) next.uiState.justCompletedWizard = false;
  if (next.uiState.selectedScenarioLabel == null) next.uiState.selectedScenarioLabel = "";
  if (next.uiState.showGrossWithdrawals == null) next.uiState.showGrossWithdrawals = true;
  if (next.uiState.emphasizeTaxes == null) next.uiState.emphasizeTaxes = true;
  if (next.uiState.timelineSelectedAge == null) next.uiState.timelineSelectedAge = null;
  if (!next.uiState.incomeMap) {
    next.uiState.incomeMap = { startAge: null, windowYears: 25, highlightKeyAges: true, showTable: false };
  }
  if (!Array.isArray(next.uiState.scenarios)) next.uiState.scenarios = [];
  if (next.uiState.lastChangeSummary == null) next.uiState.lastChangeSummary = null;
  if (!next.uiState.timingSim) next.uiState.timingSim = { cppStartAge: 65, oasStartAge: 65, linkTiming: false };
  if (!next.savings) next.savings = createDefaultPlan({ app, riskReturns, learnProgressItems }).savings;
  if (!Array.isArray(next.savings.capitalInjects)) next.savings.capitalInjects = [];
  if (!next.accounts) next.accounts = createDefaultPlan({ app, riskReturns, learnProgressItems }).accounts;
  return next;
}

function clonePlan(plan) {
  if (typeof structuredClone === "function") return structuredClone(plan);
  return JSON.parse(JSON.stringify(plan));
}

function normalizePhasePct(value, min, max) {
  let n = Number(value);
  if (!Number.isFinite(n)) return min;
  if (n > 2) n /= 100;
  return clamp(n, min, max);
}

function normalizePct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n > 1) return n / 100;
  return n;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
