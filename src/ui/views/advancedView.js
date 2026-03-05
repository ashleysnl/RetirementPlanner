export function renderAdvancedView(ctx) {
  const {
    state,
    ui,
    el,
    app,
    provinces,
    rrifMinWithdrawal,
    officialReferences,
    formatCurrency,
    formatPct,
    escapeHtml,
    numberField,
    selectField,
    tooltipButton,
    strategyButton,
    accordionSection,
    renderCapitalInjectRows,
    toPct,
    applyAdvancedSearchFilter,
  } = ctx;

  const model = ui.lastModel;
  if (!model || !el.advancedAccordion) return;
  const locked = !state.uiState.unlocked.advanced;
  if (locked) {
    el.advancedAccordion.innerHTML = `<div class="subsection"><strong>Locked</strong><p class="muted">Complete Guided Setup step 5 to unlock advanced inputs.</p></div>`;
    return;
  }

  if (!state.uiState.showAdvancedControls) {
    el.advancedAccordion.innerHTML = `
      <div class="subsection">
        <p class="muted">Advanced settings are hidden by default to keep planning simple.</p>
        <label class="inline-check">
          <input type="checkbox" data-bind="uiState.showAdvancedControls" ${state.uiState.showAdvancedControls ? "checked" : ""} />
          Show Advanced Controls
        </label>
      </div>
    `;
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
    <div class="subsection">
      <label class="inline-check">
        <input type="checkbox" data-bind="uiState.showAdvancedControls" ${state.uiState.showAdvancedControls ? "checked" : ""} />
        Show Advanced Controls
      </label>
      <label>
        <span class="label-row">Search settings</span>
        <input type="search" data-bind="uiState.advancedSearch" data-live-input="1" value="${escapeHtml(state.uiState.advancedSearch || "")}" placeholder="Search tax, inflation, clawback, RRIF..." aria-label="Search advanced settings" />
      </label>
    </div>
    ${accordionSection("basics", "Basics", "Changes timeline, spending target, and core savings assumptions used across all models.", `
      <div class="form-grid compact-mobile-two">
        <div class="form-span-full">
          ${selectField("Province", "profile.province", Object.entries(provinces).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
        </div>
        ${numberField("Year of birth", "profile.birthYear", state.profile.birthYear, { min: 1940, max: app.currentYear - 18, step: 1 }, "birthYear", false, false, true)}
        ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
        ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
        ${numberField("Desired spending (today's dollars)", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
        ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
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

    ${accordionSection("rrif", "RRIF rules", "Applies RRSP to RRIF conversion age and minimum withdrawal schedule effects.", `
      <div class="form-grid compact-mobile-two">
        ${numberField("RRIF conversion age", "strategy.rrifConversionAge", state.strategy.rrifConversionAge, { min: 65, max: 75, step: 1 }, "rrifConversionAge", false, false, true)}
        <label class="inline-check compact-field">
          <input type="checkbox" data-bind="strategy.applyRrifMinimums" ${state.strategy.applyRrifMinimums ? "checked" : ""} />
          Apply RRIF minimum schedule ${tooltipButton("rrifMinimums")}
        </label>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Age</th><th>Minimum %</th></tr></thead>
          <tbody>
            ${Object.entries(rrifMinWithdrawal).map(([age, pct]) => `<tr><td>${age}</td><td>${(pct * 100).toFixed(2)}%</td></tr>`).join("")}
          </tbody>
        </table>
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
          <thead><tr><th>Strategy</th><th>Estimated lifetime taxes ${tooltipButton("strategyLifetimeTaxes")}</th><th>Estimated lifetime OAS clawback ${tooltipButton("strategyLifetimeClawback")}</th><th>Depletion ${tooltipButton("depletionAge")}</th></tr></thead>
          <tbody>${strategyRows}</tbody>
        </table>
      </div>
      <p class="small-copy muted">These tax and clawback values are totals across the full retirement projection horizon (planning estimate).</p>
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

    ${accordionSection("references", "Official references", "Links to current CRA and Canada.ca source material used for planning context.", `
      <p class="muted">These links are official government references. Rates and rules can change by tax year.</p>
      <ul class="plain-list resource-list">
        ${officialReferences.map((item) => `
          <li>
            <a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>
            <span class="muted small-copy"> (${escapeHtml(item.source)})</span>
          </li>
        `).join("")}
      </ul>
    `)}

    ${accordionSection("modules", "Educational unlock modules", "Adds concept-level guidance. Some modules are educational-only if not fully modeled.", `
      <div class="lesson-box">
        <h3>Coming soon feature</h3>
        <p class="muted">Educational unlock modules are being rebuilt for a more guided learning experience.</p>
        <p class="small-copy muted">Current planning calculations remain available in Dashboard, Guided Setup, and Advanced inputs.</p>
      </div>
    `)}
  `;
  applyAdvancedSearchFilter();
}

export function renderStressView(ctx) {
  const {
    ui,
    el,
    formatCurrency,
    formatPct,
    formatSignedCurrency,
    tooltipButton,
    bindInlineTooltipTriggers,
  } = ctx;

  const model = ui.lastModel;
  if (!model || !el.scenarioSummary || !el.stressTable) return;

  const best = model.scenarioRows.find((r) => r.label === "Best") || model.scenarioRows[0];
  const base = model.scenarioRows.find((r) => r.label === "Base") || model.scenarioRows[1] || model.scenarioRows[0];
  const worst = model.scenarioRows.find((r) => r.label === "Worst") || model.scenarioRows[2] || model.scenarioRows[0];
  const quickRows = [best, base, worst].filter(Boolean);

  el.scenarioSummary.innerHTML = `
    <h3>Quick stress check ${tooltipButton("stressScenario")}</h3>
    <p class="muted">Simple view: how your plan changes if long-run returns are better or worse than expected.</p>
    <ul class="plain-list">
      <li><strong>Best case:</strong> higher return by your scenario spread.</li>
      <li><strong>Base case:</strong> your current assumptions.</li>
      <li><strong>Downside case:</strong> lower return by your scenario spread.</li>
    </ul>
    <div class="preview-kpi">
      ${quickRows.map((row) => `
        <div class="preview-kpi-item">
          <strong>${row.label === "Worst" ? "Downside case" : `${row.label} case`}</strong>
          <span>${formatCurrency(row.balanceAtRetirement)}</span>
          <small class="muted">Retirement balance</small>
        </div>
      `).join("")}
    </div>
  `;

  el.stressTable.innerHTML = `
    <thead>
      <tr>
        <th>Scenario ${tooltipButton("stressScenario")}</th>
        <th>Return ${tooltipButton("scenarioSpread")}</th>
        <th>Balance at retirement ${tooltipButton("kpiBalanceRetirement")}</th>
        <th>Depletion ${tooltipButton("depletionAge")}</th>
        <th>First-year gap/surplus ${tooltipButton("stressGapSurplus")}</th>
      </tr>
    </thead>
    <tbody>
      ${quickRows.map((row) => `
        <tr>
          <td>${row.label === "Worst" ? "Downside" : row.label}</td>
          <td>${formatPct(row.returnRate)}</td>
          <td>${formatCurrency(row.balanceAtRetirement)}</td>
          <td>${row.depletionAge ? `Age ${row.depletionAge}` : "No depletion"}</td>
          <td>${formatSignedCurrency(row.firstYearGap)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  bindInlineTooltipTriggers(el.scenarioSummary);
  bindInlineTooltipTriggers(el.stressTable);
}
