function plannerCard(title, description, content, open = false) {
  return `
    <details class="accordion planner-card planner-card-guided" ${open ? "open" : ""}>
      <summary>${title}</summary>
      <div class="accordion-content">
        <p class="small-copy muted">${description}</p>
        ${content}
      </div>
    </details>
  `;
}

function detailPlannerHint() {
  return `
    <div class="advanced-inline-callout advanced-inline-callout-soft">
      <strong>Need more precision?</strong>
      <p class="muted">Switch to the detailed planner for full assumptions, strategy controls, RRIF rules, and richer scenario tools.</p>
      <div class="landing-actions">
        <button class="btn btn-primary" type="button" data-nav-target="results">View results</button>
        <button class="btn btn-secondary" type="button" data-action="open-advanced">Switch to detailed planner</button>
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
    tooltipButton,
    toPct,
  } = ctx;

  const guided = state.uiState.guided || {};
  const annualIncome = Number(state.profile.annualIncome || 0);
  const basics = `
    <div class="form-grid compact-mobile-two">
      ${selectField("Province", "profile.province", Object.entries(provinces).map(([value, label]) => ({ value, label })), state.profile.province, "province")}
      ${numberField("Annual income", "profile.annualIncome", annualIncome, { min: 0, max: 1000000, step: 1000 }, "annualIncome", false, false, true)}
      ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
      ${numberField("Plan until age", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
      ${numberField("Current savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings", false, false, true)}
      ${numberField("Annual savings", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution", false, false, true)}
    </div>
  `;

  const lifestyle = `
    <div class="form-grid compact-mobile-two">
      ${numberField("Retirement income target", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending", false, false, true)}
      ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
    </div>
    <p class="field-microcopy">Lifestyle preset: <strong>${guided.lifestylePreset || "comfortable"}</strong>. This target stays editable if you want to override the preset.</p>
  `;

  const income = `
    <div class="form-grid compact-mobile-two">
      ${numberField("CPP amount at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65", false, false, true)}
      ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
      ${numberField("OAS amount at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
      ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
      <label class="inline-check form-span-full">
        <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
        Include a work pension
      </label>
      ${numberField("Work pension per year", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled, true)}
      ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
    </div>
    <p class="field-microcopy">CPP and OAS are included by default because most Canadian retirement plans depend on them.</p>
  `;

  const assumptions = `
    <div class="form-grid compact-mobile-two">
      ${numberField("Balanced return", "assumptions.returns.balanced", toPct(state.assumptions.returns.balanced), { min: 1, max: 12, step: 0.1 }, "riskProfile", true)}
      ${numberField("RRSP share", "uiState.guided.rrspShare", Math.round((guided.rrspShare || 0.6) * 100), { min: 0, max: 100, step: 5 }, "rrsp", true, false, true)}
    </div>
    <p class="field-microcopy">What is a safe withdrawal rate? ${tooltipButton("riskProfile")} This planner uses a year-by-year projection rather than a single withdrawal rule.</p>
  `;

  return `
    <p class="what-affects"><strong>Simple-first editing:</strong> make one or two changes, then go back to Results to see the story update.</p>
    ${plannerCard("Your basics", "Age, timing, income, and savings for a fast first answer.", basics, true)}
    ${plannerCard("Lifestyle target", "Retirement income target in today's dollars, plus inflation.", lifestyle, true)}
    ${plannerCard("Canadian income sources", "CPP, OAS, and optional workplace pension.", income)}
    ${plannerCard("Advanced assumptions", "Only the highest-impact assumptions stay here in simple mode.", assumptions)}
    ${detailPlannerHint()}
  `;
}
