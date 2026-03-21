function inputCard(title, description, content, open = false) {
  return `
    <details class="accordion planner-card" ${open ? "open" : ""}>
      <summary>${title}</summary>
      <div class="accordion-content">
        <p class="small-copy muted">${description}</p>
        ${content}
      </div>
    </details>
  `;
}

function advancedHint() {
  return `
    <div class="advanced-inline-callout">
      <strong>Advanced controls</strong>
      <p class="muted">Need more precision? Open Tools for account-level assumptions, withdrawal strategy, RRIF rules, and methodology.</p>
      <div class="landing-actions">
        <button class="btn btn-primary" type="button" data-nav-target="results">View results</button>
        <button class="btn btn-secondary" type="button" data-action="open-advanced">Open advanced tools</button>
      </div>
    </div>
  `;
}

export function buildPlanInputsHtml(ctx) {
  const {
    state,
    provinces,
    selectField,
    numberField,
    riskButton,
    tooltipButton,
    toPct,
  } = ctx;
  const beginnerMode = state.uiState.experienceMode !== "advanced";

  const essentials = `
    <div class="form-grid compact-mobile-two">
      <div class="form-span-full">
        ${selectField("Province", "profile.province", Object.entries(provinces).map(([value, label]) => ({ value, label })), state.profile.province, "province")}
      </div>
      ${numberField("Age you want to retire", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
      ${numberField("Plan until age", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
      ${numberField("After-tax spending target", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending", false, false, true)}
      ${numberField("Current total savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings", false, false, true)}
      ${numberField("Annual savings", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution", false, false, true)}
    </div>
    <p class="field-microcopy">Use today's dollars for spending. The planner will layer inflation on top.</p>
  `;

  const income = `
    <div class="form-grid compact-mobile-two">
      <label class="inline-check form-span-full">
        <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
        Include a work pension
      </label>
      ${numberField("Work pension per year", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled, true)}
      ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
      ${numberField("CPP amount at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65", false, false, true)}
      ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
      ${numberField("OAS amount at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
      ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
    </div>
    <div class="context-note">
      <strong>Why this matters</strong>
      <p class="muted">Guaranteed income reduces the amount you need to withdraw from savings later.</p>
    </div>
  `;

  const savings = `
    <div class="form-grid compact-mobile-two">
      ${numberField("Savings increase each year", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true, false, true)}
      ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
      <div class="form-span-full">
        <div class="label-row">Investment style ${tooltipButton("riskProfile")}</div>
        <div class="inline-radio-row">
          ${riskButton("conservative")}
          ${riskButton("balanced")}
          ${riskButton("aggressive")}
        </div>
      </div>
    </div>
  `;

  if (beginnerMode) {
    return `
      <p class="what-affects"><strong>Beginner mode:</strong> focus on the few inputs that most affect whether your plan works.</p>
      ${inputCard("About you and your target", "Retirement age, lifestyle goal, and core savings base.", essentials, true)}
      ${inputCard("Income sources", "Pension, CPP, and OAS first. More detail stays in Tools.", income, true)}
      ${inputCard("Savings assumptions", "Inflation and investment style can be refined here without opening advanced controls.", savings)}
      ${advancedHint()}
    `;
  }

  return `
    <p class="what-affects"><strong>Advanced mode:</strong> the same simple structure, but with deeper editing available in Tools.</p>
    ${inputCard("About you and your target", "Core plan timing and spending assumptions.", essentials, true)}
    ${inputCard("Income sources", "Guaranteed income timing and amounts.", income, true)}
    ${inputCard("Savings assumptions", "Investment style, inflation, and contribution growth.", savings, true)}
    ${advancedHint()}
  `;
}
