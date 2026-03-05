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
    escapeHtml,
  } = ctx;

  if (step === 1) {
    const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
    const planYears = Math.max(1, state.profile.lifeExpectancy - state.profile.retirementAge);
    return `
      <h3>Your Timeline</h3>
      <div class="wizard-grid compact-mobile-two">
        <div class="form-span-full">
          ${selectField("Province", "profile.province", Object.entries(provinces).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
        </div>
        ${numberField("Year of birth", "profile.birthYear", state.profile.birthYear, { min: 1940, max: app.currentYear - 18, step: 1 }, "birthYear", false, false, true)}
        ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
        ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
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

  if (step === 2) {
    const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
    const spendAtRet = state.profile.desiredSpending * Math.pow(1 + state.assumptions.inflation, yearsToRetirement);
    const neutral = model.kpis.firstYearGap >= 0;
    return `
      <h3>Your Goal</h3>
      <div class="wizard-grid compact-mobile-two">
        ${numberField("Desired retirement spending (after-tax, today dollars)", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
        ${numberField("Inflation assumption", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
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

  if (step === 3) {
    const sustainable = model.kpis.sustainableIncome;
    return `
      <h3>Your Savings</h3>
      <div class="wizard-grid compact-mobile-two">
        ${numberField("Current total savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
        ${numberField("Annual contribution", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
        ${numberField("Contribution increase (% per year)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true, false, true)}
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

  if (step === 4) {
    const first = model.kpis.firstRetirementBreakdown;
    const total = Math.max(1, first.pension + first.cpp + first.oas + first.withdrawal);
    const pensionPct = (first.pension / total) * 100;
    const cppPct = (first.cpp / total) * 100;
    const oasPct = (first.oas / total) * 100;
    const drawPct = (first.withdrawal / total) * 100;
    return `
      <h3>Income Sources</h3>
      <div class="wizard-grid compact-mobile-two">
        <label class="form-span-full inline-check">
          <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
          Workplace pension?
        </label>
        ${numberField("Pension amount", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled, true)}
        ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
        ${numberField("Estimated CPP at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 250 }, "cppAmount65", false, false, true)}
        ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
        ${numberField("Estimated OAS at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
        ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
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

  if (step === 5) {
    const first = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
    if (!first) return "<p class='muted'>Projection unavailable.</p>";
    const coverage = first.spending > 0 ? (first.guaranteedNet / first.spending) * 100 : 0;
    return `
      <h3>Reality checks</h3>
      <div class="lesson-box">
        <h3>Why this matters</h3>
        <ul>
          <li>Guaranteed income usually covers only part of retirement spending.</li>
          <li>The remaining after-tax gap must come from registered savings.</li>
          <li>If the gap is large, tax drag and depletion risk rise.</li>
        </ul>
      </div>
      <div class="preview-box">
        <h3>Mini preview</h3>
        <div class="preview-kpi">
          <div class="preview-kpi-item"><strong>Guaranteed income coverage ${tooltipButton("kpiGuaranteedIncome")}</strong><span>${coverage.toFixed(0)}%</span></div>
          <div class="preview-kpi-item"><strong>Net gap ${tooltipButton("kpiNetGap")}</strong><span>${formatCurrency(first.netGap)}</span></div>
          <div class="preview-kpi-item"><strong>Gross withdrawal ${tooltipButton("kpiGrossWithdrawal")}</strong><span>${formatCurrency(first.withdrawal)}</span></div>
          <div class="preview-kpi-item"><strong>Estimated tax drag ${tooltipButton("oasClawback")}</strong><span>${formatCurrency(first.taxOnWithdrawal + first.oasClawback)}</span></div>
        </div>
      </div>
    `;
  }

  if (step === 6) {
    const first = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
    if (!first) return "<p class='muted'>Projection unavailable.</p>";
    return `
      <h3>Taxes & withdrawals (intro)</h3>
      <div class="wizard-grid compact-mobile-two">
        <label class="inline-check form-span-full">
          <input type="checkbox" data-bind="strategy.oasClawbackModeling" ${state.strategy.oasClawbackModeling ? "checked" : ""} />
          Model OAS clawback ${tooltipButton("oasClawback")}
        </label>
        ${numberField("RRIF conversion age", "strategy.rrifConversionAge", state.strategy.rrifConversionAge, { min: 65, max: 75, step: 1 }, "rrifConversionAge", false, false, true)}
        <label class="inline-check compact-field">
          <input type="checkbox" data-bind="strategy.applyRrifMinimums" ${state.strategy.applyRrifMinimums ? "checked" : ""} />
          Apply RRIF minimums ${tooltipButton("rrifMinimums")}
        </label>
      </div>
      <section class="lesson-box">
        <h3>Micro-lesson</h3>
        <ul>
          <li>Your spending target is after-tax, but RRSP/RRIF withdrawals are taxable.</li>
          <li>Gross withdrawal must be higher than the net amount you need to spend.</li>
          <li>OAS clawback and RRIF minimums can force higher taxable income.</li>
        </ul>
      </section>
      <section class="preview-box">
        <h3>First retirement-year gross-up</h3>
        <div class="preview-kpi">
          <div class="preview-kpi-item"><strong>Net gap</strong><span>${formatCurrency(first.netGap)}</span></div>
          <div class="preview-kpi-item"><strong>Gross withdrawal</strong><span>${formatCurrency(first.withdrawal)}</span></div>
          <div class="preview-kpi-item"><strong>Tax wedge</strong><span>${formatCurrency(first.taxOnWithdrawal + first.oasClawback)}</span></div>
          <div class="preview-kpi-item"><strong>Effective tax rate</strong><span>${formatPct(first.effectiveTaxRate)}</span></div>
        </div>
      </section>
    `;
  }

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
