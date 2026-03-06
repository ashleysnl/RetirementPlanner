function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function parsePresetFromUrl(locationObj) {
  try {
    const url = new URL(locationObj.href);
    const preset = (url.searchParams.get("preset") || "").trim().toLowerCase();
    if (!preset) return null;
    if (preset !== "oas-clawback" && preset !== "rrif-withdrawal") return null;
    return { key: preset };
  } catch {
    return null;
  }
}

export function buildPresetBannerHtml(preset) {
  if (!preset) return "";
  const title = preset.key === "oas-clawback"
    ? "Loaded preset: OAS Clawback Calculator"
    : "Loaded preset: RRIF Withdrawal Calculator";
  const text = preset.key === "oas-clawback"
    ? "This preset turns on clawback and RRIF rules with standard start ages so you can test clawback exposure quickly."
    : "This preset turns on RRIF rules and sets conversion-focused defaults to illustrate RRIF minimum withdrawal effects.";
  return `
    <div class="banner-row">
      <div>
        <strong>${title}</strong>
        <p class="small-copy muted">${text}</p>
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
  } else if (preset?.key === "rrif-withdrawal") {
    next.strategy.meltdownEnabled = false;
    next.savings.currentTotal = Math.max(300000, Number(next.savings.currentTotal || 300000));
    next.profile.retirementAge = Math.min(67, Math.max(60, Number(next.profile.retirementAge || 65)));
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

