function explainer(title, text, action = "") {
  return `
    <aside class="explainer-block">
      <strong>${title}</strong>
      <p class="muted">${text}</p>
      ${action}
    </aside>
  `;
}

function sourceToggleCard(title, body, checked) {
  return `
    <label class="source-toggle-card">
      <input type="checkbox" ${checked ? "checked" : ""} disabled />
      <span>
        <strong>${title}</strong>
        <small>${body}</small>
      </span>
    </label>
  `;
}

export function buildWizardStepHtml(step, ctx) {
  const {
    state,
    model,
    app,
    provinces,
    ageNow,
    numberField,
    selectField,
    riskButton,
    tooltipButton,
    toPct,
    formatCurrency,
    formatPct,
    findFirstRetirementRow,
  } = ctx;

  if (step === 1) {
    const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">About you</p>
        <h3>Set your timeline</h3>
        <p class="muted">These dates shape how long you keep saving and how long retirement income needs to last.</p>
      </div>
      <div class="wizard-grid compact-mobile-two">
        <div class="form-span-full">
          ${selectField("Province", "profile.province", Object.entries(provinces).map(([value, label]) => ({ value, label })), state.profile.province, "province")}
        </div>
        ${numberField("Year you were born", "profile.birthYear", state.profile.birthYear, { min: 1940, max: app.currentYear - 18, step: 1 }, "birthYear", false, false, true)}
        ${numberField("Age you want to retire", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
        ${numberField("Plan until age", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
      </div>
      ${explainer("Why this matters", "Retiring earlier means more years funded by savings. Planning to an older age gives a safer longevity buffer.")}
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Years until retirement</strong><span>${yearsToRetirement}</span></div>
        <div class="preview-kpi-item"><strong>Retirement years to fund</strong><span>${Math.max(1, state.profile.lifeExpectancy - state.profile.retirementAge)}</span></div>
      </div>
    `;
  }

  if (step === 2) {
    const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
    const spendAtRetirement = state.profile.desiredSpending * Math.pow(1 + state.assumptions.inflation, yearsToRetirement);
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Retirement spending</p>
        <h3>Choose the lifestyle target</h3>
        <p class="muted">Use after-tax spending in today's dollars so the target feels intuitive.</p>
      </div>
      <div class="wizard-grid compact-mobile-two">
        ${numberField("After-tax spending per year", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
        ${numberField("Inflation assumption", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
      </div>
      ${explainer("Why this matters", "Your spending target is what you want to live on after tax. That means withdrawals often need to be higher than the spending gap itself.")}
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Approximate spending at retirement</strong><span>${formatCurrency(spendAtRetirement)}</span></div>
      </div>
    `;
  }

  if (step === 3) {
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Savings</p>
        <h3>Enter the savings that will support retirement</h3>
        <p class="muted">Keep this step short. You can refine account detail later in advanced tools.</p>
      </div>
      <div class="wizard-grid compact-mobile-two">
        ${numberField("Current total savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
        ${numberField("Annual savings going in", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
        ${numberField("Savings increase each year", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true, false, true)}
        <div class="form-span-full">
          <div class="label-row">Investment style ${tooltipButton("riskProfile")}</div>
          <div class="inline-radio-row">
            ${riskButton("conservative")}
            ${riskButton("balanced")}
            ${riskButton("aggressive")}
          </div>
        </div>
      </div>
      ${explainer("Why this matters", "Savings consistency is one of the biggest drivers of the plan. Return assumptions matter too, but they should stay realistic.")}
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Projected savings at retirement</strong><span>${formatCurrency(model.kpis.balanceAtRetirement)}</span></div>
      </div>
    `;
  }

  if (step === 4) {
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Income sources</p>
        <h3>Turn on the income you expect to receive</h3>
        <p class="muted">Only the cards you switch on expand. That keeps the plan simple at first load.</p>
      </div>
      <div class="source-toggle-grid">
        ${sourceToggleCard("Work pension", "Employer or private pension income.", state.income.pension.enabled)}
        ${sourceToggleCard("CPP", "Canada Pension Plan income.", true)}
        ${sourceToggleCard("OAS", "Old Age Security income.", true)}
        ${sourceToggleCard("RRSP / RRIF", "Registered savings withdrawals later in retirement.", true)}
        ${sourceToggleCard("TFSA", "Tax-free savings account detail is available in advanced tools.", state.accounts.tfsa > 0)}
        ${sourceToggleCard("Non-registered savings", "Taxable investment account detail is available in advanced tools.", state.accounts.nonRegistered > 0)}
      </div>
      <div class="wizard-grid compact-mobile-two">
        ${numberField("Work pension per year", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled, true)}
        ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
        ${numberField("CPP amount at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65", false, false, true)}
        ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
        ${numberField("OAS amount at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
        ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
      </div>
      ${explainer("Why this matters", "Guaranteed income from pension, CPP, and OAS reduces the amount your savings must cover each year.")}
    `;
  }

  if (step === 5) {
    const first = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
    const coverage = first?.spending > 0 ? (first.guaranteedNet / first.spending) * 100 : 0;
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Government benefits</p>
        <h3>Check how much your plan leans on CPP and OAS</h3>
        <p class="muted">These benefits often change the picture meaningfully after age 65.</p>
      </div>
      <div class="wizard-grid compact-mobile-two">
        ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
        ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
      </div>
      ${explainer("Why this matters", "Delaying CPP can increase later guaranteed income. OAS can be clawed back if taxable income gets too high.")}
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Guaranteed income coverage in first retirement year</strong><span>${formatPct(coverage / 100)}</span></div>
        <div class="preview-kpi-item"><strong>Net spending gap</strong><span>${formatCurrency(first?.netGap || 0)}</span></div>
      </div>
    `;
  }

  if (step === 6) {
    const first = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Taxes and assumptions</p>
        <h3>Confirm the key planning rules</h3>
        <p class="muted">This is where tax drag, RRIF minimums, and OAS clawback start to matter.</p>
      </div>
      <div class="wizard-grid compact-mobile-two">
        <label class="inline-check form-span-full">
          <input type="checkbox" data-bind="strategy.oasClawbackModeling" ${state.strategy.oasClawbackModeling ? "checked" : ""} />
          Model OAS clawback ${tooltipButton("oasClawback")}
        </label>
        <label class="inline-check form-span-full">
          <input type="checkbox" data-bind="strategy.estimateTaxes" ${state.strategy.estimateTaxes !== false ? "checked" : ""} />
          Estimate taxes on retirement income ${tooltipButton("strategyLifetimeTaxes")}
        </label>
        ${numberField("RRIF conversion age", "strategy.rrifConversionAge", state.strategy.rrifConversionAge, { min: 65, max: 75, step: 1 }, "rrifConversionAge", false, false, true)}
        <label class="inline-check compact-field">
          <input type="checkbox" data-bind="strategy.applyRrifMinimums" ${state.strategy.applyRrifMinimums ? "checked" : ""} />
          Apply RRIF minimums ${tooltipButton("rrifMinimums")}
        </label>
      </div>
      ${explainer("Why this matters", "A spending target is after tax. Registered withdrawals are taxable, and RRIF minimums can force taxable income higher later.")}
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>First-year gross withdrawal</strong><span>${formatCurrency(first?.withdrawal || 0)}</span></div>
        <div class="preview-kpi-item"><strong>Tax and clawback drag</strong><span>${formatCurrency((first?.taxOnWithdrawal || 0) + (first?.oasClawback || 0))}</span></div>
      </div>
    `;
  }

  return `
    <div class="wizard-step-head">
      <p class="wizard-step-kicker">Results</p>
      <h3>Your first forecast is ready</h3>
      <p class="muted">Move to Results to see your outcome summary, income timeline, tax interpretation, and suggested next actions.</p>
    </div>
    ${explainer("What unlocks next", "Advanced mode adds account-level assumptions, withdrawal strategy controls, spouse planning, and richer scenario exploration.", `
      <div class="landing-actions">
        <button class="btn btn-primary" type="button" data-nav-target="results">Go to Results</button>
        <button class="btn btn-secondary" type="button" data-action="open-stress">Compare scenarios</button>
      </div>
    `)}
  `;
}
