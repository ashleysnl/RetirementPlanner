function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function parsePresetFromUrl(locationObj) {
  try {
    const url = new URL(locationObj.href);
    const preset = (url.searchParams.get("preset") || "").trim().toLowerCase();
    if (!preset) return null;
    const allowed = new Set([
      "oas-clawback",
      "rrif-withdrawal",
      "cpp-timing",
      "rrsp-withdrawal-strategy",
      "retirement-tax",
      "rrif-minimum",
      "retirement-income",
    ]);
    if (!allowed.has(preset)) return null;
    return { key: preset };
  } catch {
    return null;
  }
}

export function buildPresetBannerHtml(preset) {
  if (!preset) return "";
  const map = {
    "oas-clawback": {
      title: "Loaded preset: OAS Clawback Calculator",
      text: "Turns on clawback and RRIF rules with standard start ages to test OAS recovery risk.",
    },
    "rrif-withdrawal": {
      title: "Loaded preset: RRIF Withdrawal Calculator",
      text: "Turns on RRIF rules and conversion-focused defaults to illustrate minimum-withdrawal effects.",
    },
    "cpp-timing": {
      title: "Loaded preset: CPP Timing Calculator (Canada)",
      text: "Highlights CPP timing tradeoffs with age-based defaults for quick comparison.",
    },
    "rrsp-withdrawal-strategy": {
      title: "Loaded preset: RRSP Withdrawal Strategy (Canada)",
      text: "Highlights RRSP/RRIF withdrawal order and tax drag effects.",
    },
    "retirement-tax": {
      title: "Loaded preset: Retirement Tax Calculator (Canada)",
      text: "Highlights tax drag, clawback, and gross-vs-net withdrawal behavior.",
    },
    "rrif-minimum": {
      title: "Loaded preset: RRIF Minimum Withdrawal Calculator",
      text: "Highlights RRIF conversion-age rules and minimum drawdown effects.",
    },
    "retirement-income": {
      title: "Loaded preset: Canadian Retirement Income Calculator",
      text: "Balanced baseline preset showing pension/CPP/OAS plus withdrawal gap.",
    },
  };
  const config = map[preset.key] || map["retirement-income"];
  return `
    <div class="banner-row">
      <div>
        <strong>${config.title}</strong>
        <p class="small-copy muted">${config.text}</p>
      </div>
      <div class="landing-actions">
        <button class="btn btn-primary" type="button" data-action="apply-preset">Apply preset</button>
        <button class="btn btn-secondary" type="button" data-action="dismiss-preset">Dismiss</button>
      </div>
    </div>
  `;
}

export function applyPresetToPlan(state, preset, createDemoPlan) {
  const next = clone(state);
  const hasMeaningfulPlan = !next.uiState.firstRun || Number(next.savings.currentTotal || 0) > 0;
  if (!hasMeaningfulPlan && typeof createDemoPlan === "function") {
    return applyPresetToPlan(createDemoPlan(), preset, null);
  }

  next.uiState.firstRun = false;
  next.uiState.hasStarted = true;
  next.uiState.activeNav = "dashboard";
  next.strategy.oasClawbackModeling = true;
  next.strategy.applyRrifMinimums = true;
  next.strategy.rrifConversionAge = 71;
  next.income.cpp.startAge = 65;
  next.income.oas.startAge = 65;
  next.profile.retirementAge = Math.max(55, Math.min(next.profile.retirementAge || 65, 70));

  if (preset?.key === "oas-clawback") {
    next.profile.desiredSpending = Math.max(60000, Number(next.profile.desiredSpending || 60000));
    next.income.pension.enabled = true;
    next.income.pension.amount = Math.max(12000, Number(next.income.pension.amount || 12000));
  } else if (preset?.key === "rrif-withdrawal" || preset?.key === "rrif-minimum") {
    next.strategy.meltdownEnabled = false;
    next.savings.currentTotal = Math.max(300000, Number(next.savings.currentTotal || 300000));
    next.profile.retirementAge = Math.min(67, Math.max(60, Number(next.profile.retirementAge || 65)));
  } else if (preset?.key === "cpp-timing") {
    next.income.cpp.startAge = 70;
    next.income.oas.startAge = 67;
    next.profile.retirementAge = Math.max(60, Number(next.profile.retirementAge || 65));
  } else if (preset?.key === "rrsp-withdrawal-strategy") {
    next.strategy.meltdownEnabled = true;
    next.strategy.meltdownAmount = Math.max(10000, Number(next.strategy.meltdownAmount || 10000));
    next.strategy.meltdownStartAge = Math.min(next.profile.retirementAge, 63);
    next.strategy.meltdownEndAge = Math.max(next.strategy.meltdownStartAge + 1, 70);
  } else if (preset?.key === "retirement-tax") {
    next.profile.desiredSpending = Math.max(70000, Number(next.profile.desiredSpending || 70000));
    next.income.pension.enabled = true;
    next.income.pension.amount = Math.max(15000, Number(next.income.pension.amount || 15000));
  } else if (preset?.key === "retirement-income") {
    next.profile.desiredSpending = Math.max(65000, Number(next.profile.desiredSpending || 65000));
    next.income.pension.enabled = true;
    next.income.pension.amount = Math.max(10000, Number(next.income.pension.amount || 10000));
  }
  return next;
}

export function clearPresetQuery() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("preset");
    window.history.replaceState({}, "", url.toString());
  } catch {
    // ignore
  }
}
