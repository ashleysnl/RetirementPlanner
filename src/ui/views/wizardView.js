function explainer(title, text, action = "") {
  return `
    <aside class="guided-explainer">
      <strong>${title}</strong>
      <p class="muted">${text}</p>
      ${action}
    </aside>
  `;
}

function optionButton({ action, value, label, active, sublabel = "" }) {
  return `
    <button class="choice-card ${active ? "active" : ""}" type="button" data-action="${action}" data-value="${value}" aria-pressed="${active ? "true" : "false"}">
      <strong>${label}</strong>
      ${sublabel ? `<span>${sublabel}</span>` : ""}
    </button>
  `;
}

function segmentedButton({ action, value, label, active }) {
  return `<button class="segmented-btn ${active ? "active" : ""}" type="button" data-action="${action}" data-value="${value}" aria-pressed="${active ? "true" : "false"}">${label}</button>`;
}

function inlineNote(title, text) {
  return `
    <details class="inline-learn">
      <summary>${title}</summary>
      <p class="muted small-copy">${text}</p>
    </details>
  `;
}

function simpleNumberField({ label, bind, value, min, max, step = 1, suffix = "", hint = "", disabled = false, percent = false, inputMode = "decimal", displayAs = "" }) {
  return `
    <label class="guided-field ${disabled ? "is-disabled" : ""}">
      <span class="label-row">${label}</span>
      <div class="guided-input-wrap">
        <input
          type="number"
          data-bind="${bind}"
          data-type="number"
          value="${value}"
          min="${min}"
          max="${max}"
          step="${step}"
          inputmode="${inputMode}"
          ${disabled ? "disabled" : ""}
          ${percent ? 'data-percent-input="1"' : ""}
          ${displayAs ? `data-display-as="${displayAs}"` : ""}
        />
        ${suffix ? `<span class="guided-input-suffix">${suffix}</span>` : ""}
      </div>
      ${hint ? `<small>${hint}</small>` : ""}
    </label>
  `;
}

export function buildWizardStepHtml(step, ctx) {
  const {
    state,
    model,
    provinces,
    ageNow,
    numberField,
    selectField,
    toPct,
    formatCurrency,
  } = ctx;

  const age = ageNow();
  const yearsToRetirement = Math.max(0, Number(state.profile.retirementAge || 65) - age);
  const guided = state.uiState.guided || {};
  const annualIncome = Math.max(0, Number(state.profile.annualIncome || 0));
  const retirementIncomePercent = Math.max(0.3, Number(guided.retirementIncomePercent || 0.7));
  const estimatedRetirementIncome = annualIncome * retirementIncomePercent;
  const firstRetirementRow = model?.base?.rows?.find((row) => row.age === state.profile.retirementAge) || model?.base?.rows?.[0] || null;
  const projectedBalance = Math.max(0, Number(model?.kpis?.balanceAtRetirement || firstRetirementRow?.balanceStart || 0));

  if (step === 1) {
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Step 1</p>
        <h3>Your basics</h3>
        <p class="muted">Start with the few inputs that matter most. This is enough to get a strong first answer.</p>
      </div>
      <div class="guided-step-layout">
        <div class="guided-step-main">
          <div class="guided-grid guided-grid-basics">
            ${simpleNumberField({ label: "Your age", bind: "profile.birthYear", value: age, min: 18, max: 85, step: 1, hint: "We store this as birth year behind the scenes.", displayAs: "age", inputMode: "numeric" })}
            ${numberField("Current savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings", false, false, true)}
            ${numberField("Annual income", "profile.annualIncome", annualIncome, { min: 0, max: 1000000, step: 1000 }, "annualIncome", false, false, true)}
            ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
          </div>
          <div class="guided-inline-row">
            <label class="inline-check">
              <input type="checkbox" data-bind="uiState.guided.estimateRetirementAge" ${guided.estimateRetirementAge ? "checked" : ""} />
              I don't know. Estimate a typical retirement age for me.
            </label>
          </div>
          ${explainer("Quick read", `You have about ${yearsToRetirement} years until retirement based on the current target. You can refine everything later without losing this first plan.`)}
        </div>
        <aside class="guided-step-side">
          <div class="guided-summary-card">
            <strong>Why we start here</strong>
            <p class="muted">Age, savings, income, and retirement timing shape the whole projection. Everything else is refinement.</p>
            <div class="mini-stat-list">
              <span><strong>${yearsToRetirement}</strong> years to save</span>
              <span><strong>${formatCurrency(projectedBalance)}</strong> projected at retirement</span>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  if (step === 2) {
    const lifestylePreset = guided.lifestylePreset || "comfortable";
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Step 2</p>
        <h3>Lifestyle</h3>
        <p class="muted">Pick a simple retirement lifestyle, then use a percent of income or a dollar target if you want more control.</p>
      </div>
      <div class="choice-card-grid">
        ${optionButton({ action: "set-lifestyle-preset", value: "basic", label: "Basic lifestyle", active: lifestylePreset === "basic", sublabel: "Leaner spending, more buffer" })}
        ${optionButton({ action: "set-lifestyle-preset", value: "comfortable", label: "Comfortable", active: lifestylePreset === "comfortable", sublabel: "A balanced default for most plans" })}
        ${optionButton({ action: "set-lifestyle-preset", value: "higher", label: "Higher income", active: lifestylePreset === "higher", sublabel: "More travel and discretionary spending" })}
      </div>
      <div class="guided-card">
        <div class="segmented-control" aria-label="Retirement income mode">
          ${segmentedButton({ action: "set-retirement-income-mode", value: "percent", label: "Use % of income", active: guided.retirementIncomeMode !== "dollar" })}
          ${segmentedButton({ action: "set-retirement-income-mode", value: "dollar", label: "Use dollar amount", active: guided.retirementIncomeMode === "dollar" })}
        </div>
        <div class="guided-grid compact-mobile-two">
          ${guided.retirementIncomeMode === "dollar"
            ? numberField("Desired retirement income", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending", false, false, true)
            : simpleNumberField({ label: "Target retirement income", bind: "uiState.guided.retirementIncomePercent", value: Math.round(retirementIncomePercent * 100), min: 30, max: 120, step: 1, suffix: "% of income", hint: `About ${formatCurrency(estimatedRetirementIncome)} per year with your current income.`, percent: true, inputMode: "numeric" })}
        </div>
      </div>
      ${explainer("Why this matters", "A retirement target turns your income and savings into a real answer. Start simple here. Fine-tune inflation and taxes later if you want.")}
      <div class="guided-learn-stack">
        ${inlineNote("What is a safe withdrawal rate?", "It is a planning rule of thumb for how much savings can support income over a long retirement. This planner uses a full year-by-year projection instead of a single rule.")}
        ${inlineNote("Why inflation matters", "Your target is entered in today's dollars so it feels familiar. The projection then grows future spending using the inflation assumption.")}
      </div>
    `;
  }

  if (step === 3) {
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Step 3</p>
        <h3>Savings and contributions</h3>
        <p class="muted">Tell us what you save today and roughly how it is split. You can use Canadian defaults if you don't want to think about accounts yet.</p>
      </div>
      <div class="guided-card">
        <div class="segmented-control" aria-label="Contribution mode">
          ${segmentedButton({ action: "set-contribution-mode", value: "annual", label: "Annual savings", active: guided.savingsContributionMode !== "percent" })}
          ${segmentedButton({ action: "set-contribution-mode", value: "percent", label: "% of income", active: guided.savingsContributionMode === "percent" })}
        </div>
        <div class="guided-grid compact-mobile-two">
          ${guided.savingsContributionMode === "percent"
            ? simpleNumberField({ label: "Savings rate", bind: "savings.annualContribution", value: annualIncome > 0 ? Math.round((Number(state.savings.annualContribution || 0) / annualIncome) * 100) : 0, min: 0, max: 60, step: 1, suffix: "% of income", hint: annualIncome > 0 ? `${formatCurrency(state.savings.annualContribution)} per year at current income.` : "", displayAs: "income-percent", inputMode: "numeric" })
            : numberField("Annual savings", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution", false, false, true)}
          ${simpleNumberField({ label: "RRSP share", bind: "uiState.guided.rrspShare", value: Math.round(Number(guided.rrspShare || 0.6) * 100), min: 0, max: 100, step: 5, suffix: "%", hint: "TFSA automatically gets the rest.", percent: true, inputMode: "numeric" })}
        </div>
        <label class="inline-check">
          <input type="checkbox" data-bind="uiState.guided.useCanadianDefaults" ${guided.useCanadianDefaults ? "checked" : ""} />
          Use typical Canadian defaults for my account split and assumptions.
        </label>
      </div>
      ${explainer("Current split", `${formatCurrency(state.accounts.rrsp || 0)} in RRSP/RRIF and ${formatCurrency(state.accounts.tfsa || 0)} in TFSA based on your simple split.`)}
      <div class="guided-learn-stack">
        ${inlineNote("What is CPP?", "CPP is the Canada Pension Plan. It is a government benefit based on your work history and contribution record.")}
        ${inlineNote("RRSP vs TFSA", "RRSP withdrawals are taxable later. TFSA withdrawals are not. Keeping a simple split helps the planner estimate tax drag more realistically.")}
      </div>
    `;
  }

  if (step === 4) {
    return `
      <div class="wizard-step-head">
        <p class="wizard-step-kicker">Step 4</p>
        <h3>Advanced assumptions</h3>
        <p class="muted">These are collapsed by default so beginners can keep moving. The planner already starts with Canadian defaults.</p>
      </div>
      <div class="guided-card">
        <label class="inline-check">
          <input type="checkbox" data-bind="uiState.showAdvancedControls" ${state.uiState.showAdvancedControls ? "checked" : ""} />
          Show advanced assumptions
        </label>
        <p class="small-copy muted">Defaults: 5% balanced return, 2% inflation, CPP and OAS included, tax-aware income modeling on.</p>
      </div>
      ${state.uiState.showAdvancedControls ? `
        <div class="guided-grid compact-mobile-two">
          ${selectField("Province", "profile.province", Object.entries(provinces).map(([value, label]) => ({ value, label })), state.profile.province, "province")}
          ${numberField("Balanced return", "assumptions.returns.balanced", toPct(state.assumptions.returns.balanced), { min: 1, max: 12, step: 0.1 }, "riskProfile", true)}
          ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true)}
          ${numberField("CPP at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65", false, false, true)}
          ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
          ${numberField("OAS at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
          ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
        </div>
      ` : `
        <div class="guided-placeholder-card">
          <strong>Keeping it simple</strong>
          <p class="muted">You can skip this step and still get a useful answer. Detailed assumptions stay available anytime in the detailed planner.</p>
        </div>
      `}
      <div class="guided-learn-stack">
        ${inlineNote("Why inflation matters", "Even modest inflation changes what your future spending target needs to be.")}
        ${inlineNote("What is CPP?", "CPP is a monthly federal retirement benefit based on your earnings history.")}
        ${inlineNote("Why taxes matter", "A retirement target is spending after tax. Registered withdrawals often need to be higher than the net spending gap.")}
      </div>
    `;
  }

  return `
    <div class="wizard-step-head">
      <p class="wizard-step-kicker">Step 5</p>
      <h3>Your first result is ready</h3>
      <p class="muted">You have enough information for a real first pass. Open the results to see if you are on track and what to do next.</p>
    </div>
    <div class="guided-result-preview">
      <div class="guided-result-card">
        <span class="result-label">Expected monthly retirement income</span>
        <strong>${formatCurrency(Math.max(0, Number(firstRetirementRow?.spending || state.profile.desiredSpending)) / 12)}</strong>
        <span class="muted">Based on your current plan inputs.</span>
      </div>
      <div class="guided-result-card">
        <span class="result-label">Projected portfolio at retirement</span>
        <strong>${formatCurrency(projectedBalance)}</strong>
        <span class="muted">${yearsToRetirement} years until retirement.</span>
      </div>
    </div>
    ${explainer("What unlocks next", "Results will show the big answer first, then the chart, income breakdown, and plain-language ways to improve the plan.", `
      <div class="landing-actions">
        <button class="btn btn-primary" type="button" data-nav-target="results">See my result</button>
        <button class="btn btn-secondary" type="button" data-action="open-advanced">Switch to detailed planner</button>
      </div>
    `)}
  `;
}
