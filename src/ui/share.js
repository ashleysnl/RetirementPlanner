function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function buildSharePayload(state, minimal = false) {
  const payload = {
    by: state.profile.birthYear,
    p: state.profile.province,
    ra: state.profile.retirementAge,
    le: state.profile.lifeExpectancy,
    sp: state.profile.desiredSpending,
    inf: state.assumptions.inflation,
    rr: state.assumptions.riskProfile,
    bal: state.savings.currentTotal,
    con: state.savings.annualContribution,
    pEn: state.income.pension.enabled ? 1 : 0,
    pAmt: state.income.pension.amount,
    pAge: state.income.pension.startAge,
    cpp: state.income.cpp.amountAt65,
    cppAge: state.income.cpp.startAge,
    oas: state.income.oas.amountAt65,
    oasAge: state.income.oas.startAge,
    claw: state.strategy.oasClawbackModeling ? 1 : 0,
    rrif: state.strategy.applyRrifMinimums ? 1 : 0,
    sn: state.uiState.selectedScenarioLabel || "",
  };
  if (!minimal) {
    payload.spouse = state.profile.hasSpouse ? 1 : 0;
    payload.cInc = state.savings.contributionIncrease;
    payload.scn = state.assumptions.scenarioSpread;
    payload.mEn = state.strategy.meltdownEnabled ? 1 : 0;
    payload.mAmt = state.strategy.meltdownAmount;
    payload.mStart = state.strategy.meltdownStartAge;
    payload.mEnd = state.strategy.meltdownEndAge;
    payload.mCap = state.strategy.meltdownIncomeCeiling;
  }
  return payload;
}

export function buildShareUrl(baseUrl, state, minimal = false) {
  const payload = buildSharePayload(state, minimal);
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const url = new URL(baseUrl);
  const key = minimal ? "shareMin" : "share";
  url.hash = `${key}=${encoded}`;
  return url.toString();
}

export function parseSharedScenarioFromUrl(locationObj) {
  try {
    const url = new URL(locationObj.href);
    let raw = url.searchParams.get("share") || url.searchParams.get("shareMin");
    if (!raw && url.hash) {
      const hash = String(url.hash).replace(/^#/, "");
      const [k, v] = hash.split("=");
      if (k === "share" || k === "shareMin") raw = v || "";
    }
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function applySharedScenarioToPlan(state, payload) {
  if (!payload || typeof payload !== "object") return state;
  const next = (typeof structuredClone === "function")
    ? structuredClone(state)
    : JSON.parse(JSON.stringify(state));
  next.profile.birthYear = safeNumber(payload.by, next.profile.birthYear);
  next.profile.province = String(payload.p || next.profile.province);
  next.profile.retirementAge = safeNumber(payload.ra, next.profile.retirementAge);
  next.profile.lifeExpectancy = safeNumber(payload.le, next.profile.lifeExpectancy);
  next.profile.desiredSpending = safeNumber(payload.sp, next.profile.desiredSpending);
  next.assumptions.inflation = safeNumber(payload.inf, next.assumptions.inflation);
  next.assumptions.riskProfile = String(payload.rr || next.assumptions.riskProfile);
  next.savings.currentTotal = safeNumber(payload.bal, next.savings.currentTotal);
  next.savings.annualContribution = safeNumber(payload.con, next.savings.annualContribution);
  next.income.pension.enabled = Boolean(payload.pEn);
  next.income.pension.amount = safeNumber(payload.pAmt, next.income.pension.amount);
  next.income.pension.startAge = safeNumber(payload.pAge, next.income.pension.startAge);
  next.income.cpp.amountAt65 = safeNumber(payload.cpp, next.income.cpp.amountAt65);
  next.income.cpp.startAge = safeNumber(payload.cppAge, next.income.cpp.startAge);
  next.income.oas.amountAt65 = safeNumber(payload.oas, next.income.oas.amountAt65);
  next.income.oas.startAge = safeNumber(payload.oasAge, next.income.oas.startAge);
  next.strategy.oasClawbackModeling = Boolean(payload.claw);
  next.strategy.applyRrifMinimums = Boolean(payload.rrif);
  next.uiState.selectedScenarioLabel = String(payload.sn || "");
  if (payload.spouse != null) next.profile.hasSpouse = Boolean(payload.spouse);
  if (payload.cInc != null) next.savings.contributionIncrease = safeNumber(payload.cInc, next.savings.contributionIncrease);
  if (payload.scn != null) next.assumptions.scenarioSpread = safeNumber(payload.scn, next.assumptions.scenarioSpread);
  if (payload.mEn != null) next.strategy.meltdownEnabled = Boolean(payload.mEn);
  if (payload.mAmt != null) next.strategy.meltdownAmount = safeNumber(payload.mAmt, next.strategy.meltdownAmount);
  if (payload.mStart != null) next.strategy.meltdownStartAge = safeNumber(payload.mStart, next.strategy.meltdownStartAge);
  if (payload.mEnd != null) next.strategy.meltdownEndAge = safeNumber(payload.mEnd, next.strategy.meltdownEndAge);
  if (payload.mCap != null) next.strategy.meltdownIncomeCeiling = safeNumber(payload.mCap, next.strategy.meltdownIncomeCeiling);
  return next;
}

export function buildShareSummary({ state, row, formatCurrency, formatPct, link, depletionAge = null }) {
  const pension = safeNumber(row?.pensionGross || state.income.pension.amount, 0);
  const cpp = safeNumber(row?.cppGross || state.income.cpp.amountAt65, 0);
  const oas = safeNumber(row?.oasGross || state.income.oas.amountAt65, 0);
  const guaranteed = safeNumber(row?.guaranteedGross, pension + cpp + oas);
  const netGap = safeNumber(row?.netGap, 0);
  const gross = safeNumber(row?.withdrawal, 0);
  const tax = safeNumber((row?.taxOnWithdrawal || 0) + (row?.oasClawback || 0), 0);
  const age = safeNumber(row?.age, state.profile.retirementAge);
  const scenario = String(state.uiState.selectedScenarioLabel || "Current plan");
  return [
    "Canadian Retirement Tax Simulator - Summary",
    `Scenario: ${scenario}`,
    `Age: ${age}`,
    `Retirement age: ${state.profile.retirementAge}`,
    `After-tax spending target: ${formatCurrency(row?.spending || state.profile.desiredSpending)}`,
    `Guaranteed income: ${formatCurrency(guaranteed)} (Pension ${formatCurrency(pension)} / CPP ${formatCurrency(cpp)} / OAS ${formatCurrency(oas)})`,
    `Net gap from savings: ${formatCurrency(netGap)}`,
    `Gross RRSP/RRIF withdrawal required: ${formatCurrency(gross)}`,
    `Tax wedge: ${formatCurrency(tax)} (effective rate ${formatPct(row?.effectiveTaxRate || 0)})`,
    `OAS clawback: ${formatCurrency(row?.oasClawback || 0)}${state.strategy.oasClawbackModeling ? "" : " (modeling off)"}`,
    row?.netGap > 0 ? `Status: Gap remains (${formatCurrency(row.netGap)})` : `Status: Surplus/covered`,
    depletionAge ? `Depletion age: ${depletionAge}` : "Depletion age: none in projection",
    `Link: ${link}`,
  ].join("\n");
}

export function buildScenarioPayloadFromSnapshot(snapshot) {
  const payload = snapshot?.payload || {};
  const strategy = payload.strategy || {};
  const income = payload.income || {};
  return {
    by: payload.profile?.birthYear,
    p: payload.profile?.province,
    ra: payload.profile?.retirementAge,
    le: payload.profile?.lifeExpectancy,
    sp: payload.profile?.desiredSpending,
    inf: payload.assumptions?.inflation,
    rr: payload.assumptions?.riskProfile,
    bal: payload.savings?.currentTotal,
    con: payload.savings?.annualContribution,
    pEn: income.pension?.enabled ? 1 : 0,
    pAmt: income.pension?.amount,
    pAge: income.pension?.startAge,
    cpp: income.cpp?.amountAt65,
    cppAge: income.cpp?.startAge,
    oas: income.oas?.amountAt65,
    oasAge: income.oas?.startAge,
    claw: strategy.oasClawbackModeling ? 1 : 0,
    rrif: strategy.applyRrifMinimums ? 1 : 0,
    mEn: strategy.meltdownEnabled ? 1 : 0,
    mAmt: strategy.meltdownAmount,
    mStart: strategy.meltdownStartAge,
    mEnd: strategy.meltdownEndAge,
    mCap: strategy.meltdownIncomeCeiling,
    sn: snapshot?.name || "Scenario",
  };
}

export function buildScenarioShareUrl(baseUrl, payload) {
  const encoded = encodeURIComponent(JSON.stringify(payload || {}));
  const url = new URL(baseUrl);
  url.hash = `share=${encoded}`;
  return url.toString();
}
