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

  if (beginnerMode) {
    return `
      <p class="what-affects"><strong>Start here:</strong> Focus on the few inputs that most influence whether your plan works. Advanced assumptions stay available separately.</p>

      <details class="accordion beginner-input-group" open>
        <summary>Essentials</summary>
        <div class="accordion-content">
          <p class="small-copy muted">Set the retirement age, spending target, and savings base first. These usually move the result the most.</p>
          <div class="form-grid compact-mobile-two">
            <div class="form-span-full">
              ${selectField("Province", "profile.province", Object.entries(provinces).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
            </div>
            ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
            ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
            ${numberField("Annual spending target", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending", false, false, true)}
            ${numberField("Savings balance", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings", false, false, true)}
            ${numberField("Annual contributions", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution", false, false, true)}
          </div>
        </div>
      </details>

      <details class="accordion beginner-input-group" open>
        <summary>Income Sources</summary>
        <div class="accordion-content">
          <p class="small-copy muted">Set the income that reduces pressure on savings withdrawals later.</p>
          <div class="form-grid compact-mobile-two">
            <label class="inline-check form-span-full">
              <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
              Include private/workplace pension
            </label>
            ${numberField("Private pension income", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled, true)}
            ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
            ${numberField("CPP income at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65", false, false, true)}
            ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
            ${numberField("OAS income at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
            ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
          </div>
        </div>
      </details>

      <details class="accordion beginner-input-group">
        <summary>Savings & assumptions</summary>
        <div class="accordion-content">
          <p class="small-copy muted">Use this section when you want to refine returns, inflation, and how contributions grow over time.</p>
          <div class="form-grid compact-mobile-two">
            ${numberField("Inflation (%)", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
            ${numberField("Contribution increase (%/yr)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true, false, true)}
            <div class="form-span-full">
              <div class="label-row">Investment return profile ${tooltipButton("riskProfile")}</div>
              <div class="inline-radio-row">
                ${riskButton("conservative")}
                ${riskButton("balanced")}
                ${riskButton("aggressive")}
              </div>
            </div>
          </div>
        </div>
      </details>

      <section class="subsection plan-inputs-next">
        <h3>Need more detail?</h3>
        <p class="muted">Use Advanced Mode or Advanced Settings for RRIF rules, clawback, account-level strategy, stress testing, and spouse planning.</p>
        <div class="landing-actions">
          <button class="btn btn-secondary" type="button" data-action="set-experience-mode" data-value="advanced">Switch to Advanced Mode</button>
          <button class="btn btn-primary" type="button" data-action="open-advanced">Open advanced settings</button>
        </div>
      </section>
    `;
  }

  return `
    <p class="what-affects"><strong>Plan inputs:</strong> Edit assumptions directly here. Changes apply instantly.</p>
    <div class="accordion-list">
      <details class="accordion" open>
        <summary>Essentials</summary>
        <div class="accordion-content">
          <p class="small-copy muted">Core plan timing and spending assumptions.</p>
          <div class="form-grid compact-mobile-two">
            <div class="form-span-full">
              ${selectField("Province", "profile.province", Object.entries(provinces).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
            </div>
            ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
            ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
            ${numberField("Annual spending target", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending", false, false, true)}
            ${numberField("Inflation (%)", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
          </div>
        </div>
      </details>

      <details class="accordion" open>
        <summary>Income Sources</summary>
        <div class="accordion-content">
          <p class="small-copy muted">Set workplace pension and government benefits here.</p>
          <div class="form-grid compact-mobile-two">
            ${numberField("CPP income at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65", false, false, true)}
            ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
            ${numberField("OAS income at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
            ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
            <label class="inline-check form-span-full">
              <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
              Enable private/workplace pension
            </label>
            ${numberField("Private pension income", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled, true)}
            ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
          </div>
        </div>
      </details>

      <details class="accordion">
        <summary>Savings & Investments</summary>
        <div class="accordion-content">
          <p class="small-copy muted">Current savings, contributions, and growth assumptions.</p>
          <div class="form-grid compact-mobile-two">
            ${numberField("Savings balance", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings", false, false, true)}
            ${numberField("Annual contributions", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution", false, false, true)}
            ${numberField("Contribution increase (%/yr)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true, false, true)}
            <div class="form-span-full">
              <div class="label-row">Investment return profile ${tooltipButton("riskProfile")}</div>
              <div class="inline-radio-row">
                ${riskButton("conservative")}
                ${riskButton("balanced")}
                ${riskButton("aggressive")}
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
    <div class="subsection">
      <div class="landing-actions">
        <button class="btn btn-secondary" type="button" data-action="open-learn">Learn before editing</button>
        <button class="btn btn-primary" type="button" data-action="open-advanced">Open advanced settings</button>
      </div>
    </div>
  `;
}
