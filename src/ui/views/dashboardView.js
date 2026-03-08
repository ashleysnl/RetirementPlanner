import { getReportMetrics } from "../../model/reportMetrics.js";
import { findPeakTaxYear } from "../../model/peakTax.js";
import { buildPlanStatus } from "../../model/planStatus.js";

export function renderDashboardView(ctx) {
  const {
    state,
    ui,
    el,
    app,
    provinces,
    officialReferences,
    formatCurrency,
    formatPct,
    escapeHtml,
    clamp,
    tooltipButton,
    bindInlineTooltipTriggers,
    drawMainChart,
    drawCoverageChart,
    getBalanceLegendItems,
    getCoverageLegendItems,
    findRowByAge,
    findFirstRetirementRow,
    amountForDisplay,
    getOasRiskLevel,
    buildNextActions,
    dashboardModel,
  } = ctx;

  const model = dashboardModel || ui.lastModel;
  if (!model) return;
  const beginnerMode = state.uiState.experienceMode !== "advanced";
  const planStatus = buildPlanStatus(state, model);
  const planScore = planStatus.score;
  const dashboardScenario = state.uiState.dashboardScenario || "base";

  const retireRows = model.base.rows.filter((row) => row.age >= state.profile.retirementAge);
  const minAge = retireRows[0]?.age ?? state.profile.retirementAge;
  const maxAge = retireRows[retireRows.length - 1]?.age ?? state.profile.lifeExpectancy;
  if (ui.selectedAge == null) ui.selectedAge = minAge;
  ui.selectedAge = clamp(ui.selectedAge, minAge, maxAge);

  if (el.dashboardStressToggle) el.dashboardStressToggle.checked = ui.showStressBand;
  if (el.dollarModeToggle) el.dollarModeToggle.checked = ui.showTodaysDollars;
  if (el.coverageTableToggle) el.coverageTableToggle.checked = ui.showCoverageTable;
  if (el.yearScrubber) {
    el.yearScrubber.min = String(minAge);
    el.yearScrubber.max = String(maxAge);
    el.yearScrubber.value = String(ui.selectedAge);
  }
  if (el.yearScrubberValue) el.yearScrubberValue.textContent = `Age ${ui.selectedAge}`;

  renderKpiCards();
  renderCanIRetire();
  renderReadinessSummary();
  renderScenarioToolbar();
  renderQuickControls();
  renderProjectionInterpretation();
  renderAdvisorSection();
  renderPlanHealthHero();
  renderKeyInsights();
  renderIncomeStack();
  renderComparisonModule();
  renderActionHub();
  renderBalanceLegend();
  drawMainChart(model.base.rows, model.best.rows, model.worst.rows);
  renderCoverageLegend();
  drawCoverageChart(model, ui.selectedAge);
  renderCoverageTable();
  renderDashboardNarrative();
  renderCommonMistakes();
  renderMethodologySummary();
  renderDashboardReferences();
  renderRetirementScore();
  renderDashboardStatus();

  if (el.nextActions) {
    const actions = buildNextActions(model);
    el.nextActions.innerHTML = actions.map((text) => `<li>${escapeHtml(text)}</li>`).join("");
  }

  if (el.basicsSummary) {
    el.basicsSummary.innerHTML = [
      `Province: <strong>${provinces[state.profile.province]}</strong>`,
      `Retire at <strong>${state.profile.retirementAge}</strong>, plan through age <strong>${state.profile.lifeExpectancy}</strong>.`,
      `Risk profile: <strong>${state.assumptions.riskProfile.charAt(0).toUpperCase()}${state.assumptions.riskProfile.slice(1)}</strong> (${formatPct(model.base.returnRate)} return).`,
      `Estimated first retirement year guaranteed income after tax: <strong>${formatCurrency(getReportMetrics(state, findRowByAge(model.base.rows, state.profile.retirementAge) || model.base.rows[0]).guaranteedNet)}</strong>.`,
      `Dashboard assumption: withdrawals are modeled as RRSP/RRIF taxable withdrawals for this explanatory view.`,
    ].join("<br>");
  }

  function renderDashboardStatus() {
    if (!el.dashboardStatus) return;
    const gap = model.kpis.firstYearGap;
    const depletionAge = model.kpis.depletionAge;
    let label = planStatus.status;
    let css = "status-pill borderline";

    if (gap >= 0 && !depletionAge && planScore.total >= 80) {
      label = planStatus.status;
      css = "status-pill on-track";
    } else if (gap < -10000 || depletionAge || planScore.total < 60) {
      label = planStatus.status;
      css = "status-pill off-track";
    }

    el.dashboardStatus.className = css;
    el.dashboardStatus.textContent = `Plan health: ${label}`;
  }

  function renderDashboardReferences() {
    if (!el.dashboardReferences) return;
    el.dashboardReferences.innerHTML = officialReferences.map((item, index) => `
      ${index > 0 ? '<span class="reference-sep" aria-hidden="true">|</span>' : ""}
      <a class="footer-reference-link" href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(item.label)}
      </a>
    `).join("");
  }

  function renderScenarioToolbar() {
    if (!el.scenarioToolbar) return;
    const scenarios = [
      { key: "base", label: "Base case" },
      { key: "inflation", label: "High inflation" },
      { key: "returns", label: "Lower returns" },
      { key: "longevity", label: "Longer life" },
      { key: "custom", label: "Custom stress test" },
    ];
    el.scenarioToolbar.innerHTML = `
      <div class="scenario-toolbar-inner">
        ${scenarios.map((item) => {
          const active = dashboardScenario === item.key;
          const tag = item.key === "custom" ? "button" : "button";
          return `<${tag} class="scenario-chip ${active ? "active" : ""}" type="button" data-action="set-dashboard-scenario" data-value="${item.key}" aria-pressed="${active ? "true" : "false"}">${item.label}</${tag}>`;
        }).join("")}
        <label class="inline-check small-copy">
          <input id="dashboardStressToggle" type="checkbox" ${ui.showStressBand ? "checked" : ""} />
          Show stress band
        </label>
      </div>
    `;
  }

  function renderReadinessSummary() {
    if (!el.readinessSummaryModule) return;
    const row = findRowByAge(model.base.rows, state.profile.retirementAge) || model.base.rows[0];
    if (!row) {
      el.readinessSummaryModule.innerHTML = "";
      return;
    }
    const report = getReportMetrics(state, row);
    const balanceAtRetirement = Math.max(0, Number(row.startBalance || row.endBalance || 0));
    const moneyLasts = model.kpis.depletionAge ? `Age ${model.kpis.depletionAge}` : `Beyond ${state.profile.lifeExpectancy}`;
    const risk = getOasRiskLevel(row.oasClawback || 0);
    const cards = [
      { label: "Target retirement age", value: `Age ${state.profile.retirementAge}`, sub: dashboardScenario === "base" ? "Current plan" : `Scenario: ${dashboardScenario.replace("-", " ")}` },
      { label: "Projected retirement income", value: formatCurrency(report.totalSpendable), sub: report.estimateTaxes ? "Net spendable income" : "Before tax estimate" },
      { label: "Savings at retirement", value: formatCurrency(balanceAtRetirement), sub: "Projected portfolio" },
      { label: "How long money lasts", value: moneyLasts, sub: model.kpis.depletionAge ? "Depletion estimate" : "Planning horizon covered" },
      { label: "OAS clawback risk", value: risk, sub: report.clawback > 0 ? formatCurrency(report.clawback) : "No current clawback" },
    ];
    el.readinessSummaryModule.innerHTML = `
      <section class="subsection readiness-summary">
        <div class="section-head-tight">
          <div>
            <h3>Retirement Readiness</h3>
            <p class="muted">Your plan in one view, using the currently selected scenario.</p>
          </div>
        </div>
        <div class="readiness-grid">
          ${cards.map((card) => `
            <article class="readiness-card">
              <span class="label">${escapeHtml(card.label)}</span>
              <strong>${escapeHtml(card.value)}</strong>
              <span class="sub">${escapeHtml(card.sub)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderQuickControls() {
    if (!el.quickControlsModule) return;
    el.quickControlsModule.innerHTML = `
      <section class="subsection dashboard-quick-controls">
        <div class="section-head-tight">
          <div>
            <h3>Most important inputs</h3>
            <p class="muted">These settings usually move the result the most.</p>
          </div>
        </div>
        <div class="quick-control-list">
          <button class="plan-row-btn" type="button" data-nav-target="plan">
            <span class="plan-row-main"><strong>Retirement age</strong><span class="muted small-copy">Age ${state.profile.retirementAge}</span></span>
            <span class="plan-row-edit">Edit</span>
          </button>
          <button class="plan-row-btn" type="button" data-nav-target="plan">
            <span class="plan-row-main"><strong>Spending goal</strong><span class="muted small-copy">${formatCurrency(state.profile.desiredSpending)} today</span></span>
            <span class="plan-row-edit">Edit</span>
          </button>
          <button class="plan-row-btn" type="button" data-nav-target="plan">
            <span class="plan-row-main"><strong>Savings & contributions</strong><span class="muted small-copy">${formatCurrency(state.savings.currentTotal)} + ${formatCurrency(state.savings.annualContribution)}/yr</span></span>
            <span class="plan-row-edit">Edit</span>
          </button>
          <button class="plan-row-btn" type="button" data-nav-target="plan">
            <span class="plan-row-main"><strong>CPP / OAS / pension</strong><span class="muted small-copy">Income timing and amounts</span></span>
            <span class="plan-row-edit">Review</span>
          </button>
        </div>
        <div class="landing-actions">
          <button class="btn btn-secondary" type="button" data-nav-target="plan">Open plan inputs</button>
          <button class="btn btn-secondary" type="button" data-action="open-advanced">Advanced settings</button>
        </div>
      </section>
    `;
  }

  function renderProjectionInterpretation() {
    if (!el.projectionInterpretationModule) return;
    const row = findRowByAge(model.base.rows, state.profile.retirementAge) || model.base.rows[0];
    if (!row) {
      el.projectionInterpretationModule.innerHTML = "";
      return;
    }
    const report = getReportMetrics(state, row);
    const takeaways = [
      planStatus.summary,
      model.kpis.depletionAge
        ? `Savings are projected to run out around age ${model.kpis.depletionAge}.`
        : `Savings are projected to last through age ${state.profile.lifeExpectancy}.`,
      report.netGap > 0
        ? `You still need ${formatCurrency(report.netGap)} after tax from savings in the first retirement year.`
        : "Guaranteed income appears to cover the first retirement-year spending target.",
      report.dragAmount > 0
        ? `Taxes and clawback reduce spendable income by about ${formatCurrency(report.dragAmount)} in that first retirement year.`
        : "Tax drag is not the primary issue in the current first-year view.",
    ];
    el.projectionInterpretationModule.innerHTML = `
      <section class="subsection projection-interpretation">
        <h3>What this projection means</h3>
        <ul class="plain-list small-copy muted">
          ${takeaways.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function renderAdvisorSection() {
    if (!el.advisorSectionModule) return;
    const retirementRow = findRowByAge(model.base.rows, state.profile.retirementAge) || model.base.rows[0];
    if (!retirementRow) {
      el.advisorSectionModule.innerHTML = "";
      return;
    }

    const report = getReportMetrics(state, retirementRow);
    const depletionAge = model.kpis.depletionAge;
    const suggestions = [];

    const addSuggestion = (item) => {
      if (!item || suggestions.some((existing) => existing.key === item.key)) return;
      suggestions.push(item);
    };

    if (depletionAge && depletionAge < state.profile.lifeExpectancy) {
      addSuggestion({
        key: "retire-later-2",
        title: "Retire 2 years later",
        why: `Adds saving years and may push depletion later than age ${depletionAge}.`,
        impact: "Usually the fastest way to improve plan sustainability.",
        button: { type: "action", action: "preview-strategy", value: "retire-later-2", label: "Preview impact" },
      });
      addSuggestion({
        key: "spend-down-10",
        title: "Reduce annual spending by 10%",
        why: "Lowers the withdrawal load in every retirement year.",
        impact: "Can improve both coverage and longevity without changing retirement timing.",
        button: { type: "action", action: "preview-strategy", value: "spend-down-10", label: "Try this" },
      });
    }

    if (report.netGap > 0) {
      addSuggestion({
        key: "returns",
        title: "Stress test lower returns",
        why: "Your plan still depends on savings in early retirement.",
        impact: "Shows whether the current gap stays manageable under a weaker market.",
        button: { type: "action", action: "set-dashboard-scenario", value: "returns", label: "View lower returns" },
      });
    }

    const dragAmount = Number((retirementRow.taxOnWithdrawal || 0) + (retirementRow.oasClawback || 0));
    if (dragAmount > Math.max(10000, report.grossWithdrawal * 0.25)) {
      addSuggestion({
        key: "meltdown",
        title: "Review earlier RRSP withdrawals",
        why: "Large gross withdrawals suggest tax drag is eating into spendable income.",
        impact: "Earlier withdrawals may reduce later RRIF pressure and clawback exposure.",
        button: { type: "action", action: "preview-strategy", value: "meltdown", label: "Preview RRSP strategy" },
      });
    }

    if (retirementRow.oasClawback > 0 || planStatus.biggestRisk?.key === "clawback") {
      addSuggestion({
        key: "clawback-tool",
        title: "Review OAS clawback exposure",
        why: "Later taxable income is high enough to reduce OAS.",
        impact: "Use the focused clawback tool, then bring the learning back into the full plan.",
        button: { type: "href", href: "./oas-clawback-calculator.html", label: "Open OAS calculator" },
      });
    }

    if (state.income.cpp.startAge < 70 || planStatus.biggestRisk?.key === "tax-drag") {
      addSuggestion({
        key: "delay-cpp",
        title: "Compare CPP timing",
        why: "Benefit timing changes both guaranteed income and later tax pressure.",
        impact: "Helpful when early coverage is tight or late-retirement taxes rise.",
        button: { type: "action", action: "preview-strategy", value: "delay-cpp", label: "Preview later CPP" },
      });
    }

    if (!suggestions.length || planStatus.status === "On Track") {
      addSuggestion({
        key: "inflation",
        title: "Check a high-inflation case",
        why: "A strong base plan should still be pressure-tested.",
        impact: "Helps confirm your margin of safety if living costs rise faster than expected.",
        button: { type: "action", action: "set-dashboard-scenario", value: "inflation", label: "Stress test plan" },
      });
      addSuggestion({
        key: "compare",
        title: "Compare another scenario",
        why: "Small changes to retirement age or spending often matter more than expected.",
        impact: "See tradeoffs side by side before changing your base plan.",
        button: { type: "action", action: "open-scenario-compare", label: "Compare scenarios" },
      });
    }

    el.advisorSectionModule.innerHTML = `
      <section class="subsection advisor-section">
        <div class="section-head-tight">
          <div>
            <h3>What should I change?</h3>
            <p class="muted">Use these planning experiments to improve the current result before opening advanced settings.</p>
          </div>
        </div>
        <div class="comparison-card-grid advisor-summary-grid">
          <article class="comparison-card advisor-summary-card">
            <strong>Biggest risk</strong>
            <p>${escapeHtml(planStatus.biggestRisk?.title || "No immediate critical issue stands out in the current base view.")}</p>
            <p class="small-copy muted">${escapeHtml(planStatus.biggestRisk?.detail || "Keep validating the plan under alternate scenarios.")}</p>
          </article>
          <article class="comparison-card advisor-summary-card">
            <strong>Best next move</strong>
            <p>${escapeHtml(planStatus.nextBestAction?.detail || "Use the suggestions below to test the next most important change.")}</p>
          </article>
        </div>
        <div class="advisor-card-grid">
          ${suggestions.slice(0, beginnerMode ? 3 : 5).map((item) => `
            <article class="comparison-card advisor-card">
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.why)}</p>
              <p class="small-copy muted">${escapeHtml(item.impact)}</p>
              <div class="landing-actions">
                ${item.button?.type === "href"
                  ? `<a class="btn btn-secondary" href="${escapeHtml(item.button.href)}">${escapeHtml(item.button.label)}</a>`
                  : `<button class="btn btn-secondary" type="button" data-action="${escapeHtml(item.button?.action || "open-scenario-compare")}" ${item.button?.value ? `data-value="${escapeHtml(item.button.value)}"` : ""}>${escapeHtml(item.button?.label || "Preview impact")}</button>`}
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderKpiCards() {
    const row = findRowByAge(model.base.rows, ui.selectedAge || state.profile.retirementAge)
      || findRowByAge(model.base.rows, state.profile.retirementAge);
    if (!row) return;
    const report = getReportMetrics(state, row);
    const taxWedge = report.dragAmount;
    const netKeep = Math.max(0, report.netWithdrawal);
    const gross = Math.max(1, report.grossWithdrawal);
    const wedgePct = (taxWedge / gross) * 100;
    if (el.kpiContext) {
      el.kpiContext.textContent = `At a glance for age ${row.age}. Planning estimate only.`;
    }
    const kpis = [
      { label: "After-tax spending", value: formatCurrency(row.spending), sub: "Spending target", tip: "kpiSpendingTarget" },
      { label: "Guaranteed income", value: formatCurrency(report.guaranteedNet), sub: report.estimateTaxes ? "After estimated tax" : "Tax estimates off", tip: "kpiGuaranteedIncome" },
      { label: "Net gap from savings", value: report.netGap > 0 ? formatCurrency(report.netGap) : formatCurrency(0), sub: report.netGap > 0 ? "After-tax gap" : "No gap (surplus)", tip: "kpiNetGap" },
      {
        label: "Gross withdrawal needed",
        value: formatCurrency(report.grossWithdrawal),
        sub: report.estimateTaxes ? `Tax + clawback drag: ${formatCurrency(taxWedge)}` : "Tax estimates off",
        tip: "kpiGrossWithdrawal",
        mini: true,
      },
    ];
    if (el.kpiGrid) {
      el.kpiGrid.innerHTML = kpis.map((card) => `
        <article class="metric-card metric-card-primary">
          <span class="label">${escapeHtml(card.label)} ${tooltipButton(card.tip)}</span>
          <span class="value">${escapeHtml(card.value)}</span>
          <span class="sub">${escapeHtml(card.sub)}</span>
          ${card.mini ? `
            <div class="results-mini-bar kpi-mini-bar" role="img" aria-label="Gross withdrawal split into net and tax wedge">
              <span class="seg netdraw" style="width:${((netKeep / gross) * 100).toFixed(1)}%"></span>
              <span class="seg tax" style="width:${Math.max(0, wedgePct).toFixed(1)}%"></span>
            </div>
          ` : ""}
        </article>
      `).join("");
    }
  }

  function renderCanIRetire() {
    if (!el.canIRetireModule) return;
    const row = findRowByAge(model.base.rows, state.profile.retirementAge) || model.base.rows[0];
    if (!row) {
      el.canIRetireModule.innerHTML = "";
      return;
    }
    const report = getReportMetrics(state, row);
    const depletionAge = model.kpis.depletionAge;
    let verdictClass = "verdict-moderate";
    let verdict = planStatus.status;
    let explainer = planStatus.summary;
    if (planStatus.status === "On Track" || planStatus.status === "Strong but Tax-Inefficient" || planStatus.status === "Sustainable but Clawback Exposure") {
      verdictClass = "verdict-strong";
    } else if (planStatus.status === "Shortfall Likely") {
      verdictClass = "verdict-attention";
    }
    const warning = depletionAge ? `<span class="insight-warning">Savings run out around age ${depletionAge}</span>` : "";
    el.canIRetireModule.innerHTML = `
      <section class="subsection verdict-hero ${verdictClass}">
        <div class="verdict-hero-main">
          <div>
            <p class="eyebrow muted">Plan status</p>
            <h3>${verdict}</h3>
            <p class="verdict-copy">${explainer}</p>
            <p class="small-copy muted">Based on retirement age ${state.profile.retirementAge} and your current assumptions. ${warning}</p>
            <details>
              <summary>Why this status?</summary>
              <ul class="plain-list small-copy muted">
                ${planStatus.keyDrivers.map((driver) => `<li>${escapeHtml(driver)}</li>`).join("")}
              </ul>
            </details>
          </div>
          <div class="verdict-badge-block">
            <span class="verdict-score">${planScore.total}/100</span>
            <span class="coverage-badge ${report.netGap <= 0 && !depletionAge ? "coverage-good" : ""}">${planStatus.status}</span>
          </div>
        </div>
      </section>
    `;
  }

  function renderPlanHealthHero() {
    if (!el.planHealthHeroModule) return;
    const row = findRowByAge(model.base.rows, state.profile.retirementAge) || model.base.rows[0];
    if (!row) {
      el.planHealthHeroModule.innerHTML = "";
      return;
    }
    const report = getReportMetrics(state, row);
    const worst = model.scenarioRows.find((x) => x.label === "Worst");
    const stressLabel = !worst || !worst.depletionAge
      ? "High"
      : worst.depletionAge >= state.profile.lifeExpectancy
        ? "Moderate"
        : "Low";
    const taxEfficiencyLabel = row.effectiveTaxRate < 0.18 ? "Strong" : row.effectiveTaxRate < 0.26 ? "Moderate" : "Needs work";
    const replacement = row.spending > 0 ? report.totalSpendable / row.spending : 1;
    el.planHealthHeroModule.innerHTML = `
      <section class="subsection plan-health-hero">
        <div class="section-head-tight">
          <div>
            <h3>Plan Health Score ${tooltipButton("retirementScore")}</h3>
            <p class="muted">A simple planning heuristic that combines coverage, longevity buffer, tax drag, clawback exposure, and RRIF shock.</p>
          </div>
          <div class="plan-health-total">
            <strong>${planScore.total}</strong>
            <span>${planScore.band}</span>
          </div>
        </div>
        <div class="preview-kpi">
          <div class="preview-kpi-item"><strong>Savings lasts to</strong><span>${model.kpis.depletionAge ? `Age ${model.kpis.depletionAge}` : `Beyond ${state.profile.lifeExpectancy}`}</span></div>
          <div class="preview-kpi-item"><strong>Income replacement</strong><span>${formatPct(replacement)}</span></div>
          <div class="preview-kpi-item"><strong>Tax efficiency</strong><span>${taxEfficiencyLabel}</span></div>
          <div class="preview-kpi-item"><strong>Stress resilience</strong><span>${stressLabel}</span></div>
          <div class="preview-kpi-item"><strong>Guaranteed-income coverage</strong><span>${formatPct(report.coverageRatio)}</span></div>
        </div>
        <details>
          <summary>How this score is calculated ${tooltipButton("coverageScoreWeights")}</summary>
          <ul class="plain-list small-copy muted">
            <li>Coverage ratio checks how much of early retirement spending is covered before drawing on savings.</li>
            <li>Longevity checks whether projected savings last to or past life expectancy.</li>
            <li>Tax efficiency reflects average withdrawal drag under the current assumptions.</li>
            <li>Clawback and RRIF shock penalties increase when forced taxable income rises later.</li>
          </ul>
        </details>
      </section>
    `;
    bindInlineTooltipTriggers(el.planHealthHeroModule);
  }

  function renderKeyInsights() {
    if (!el.keyInsightsModule) return;
    const retireRow = findRowByAge(model.base.rows, state.profile.retirementAge) || model.base.rows[0];
    const selectedRow = findRowByAge(model.base.rows, ui.selectedAge || state.profile.retirementAge) || retireRow;
    const peakTax = findPeakTaxYear(state, model);
    const replacement = retireRow.spending > 0 ? (retireRow.guaranteedNet + retireRow.netFromWithdrawal) / retireRow.spending : 1;
    const insights = [
      {
        title: "Guaranteed income floor",
        body: `Guaranteed income covers ${Math.round((retireRow.spending > 0 ? retireRow.guaranteedNet / retireRow.spending : 1) * 100)}% of spending at retirement, so the rest must come from savings withdrawals.`,
      },
      {
        title: "Longevity outlook",
        body: model.kpis.depletionAge
          ? `Portfolio depletion is projected around age ${model.kpis.depletionAge}, which is ${Math.max(0, state.profile.lifeExpectancy - model.kpis.depletionAge)} years before your planning horizon ends.`
          : `Savings are projected to last through age ${state.profile.lifeExpectancy} under the current assumptions.`,
      },
      {
        title: "Tax pressure point",
        body: peakTax
          ? `Peak tax year is age ${peakTax.age}, driven mainly by ${peakTax.cause.toLowerCase()}.`
          : "No clear peak-tax pressure point was detected in the current projection.",
      },
      {
        title: "Income replacement",
        body: `At retirement start, total spendable income reaches about ${formatPct(replacement)} of your target spending under the base scenario.`,
      },
    ];
    if (state.strategy.oasClawbackModeling && selectedRow.oasClawback > 0) {
      insights.push({
        title: "Clawback exposure",
        body: `OAS clawback begins by age ${selectedRow.age} in the selected view, reducing spendable income by ${formatCurrency(selectedRow.oasClawback)} that year.`,
      });
    } else if (state.income.cpp.startAge < 70) {
      insights.push({
        title: "Timing still matters",
        body: "CPP and OAS start ages are still adjustable. Testing later starts may raise guaranteed income in later retirement years.",
      });
    }
    el.keyInsightsModule.innerHTML = `
      <section class="subsection">
        <div class="section-head-tight">
          <div>
            <h3>Supporting insights</h3>
            <p class="muted">Plain-English interpretation of what is driving the current result.</p>
          </div>
        </div>
        <div class="insight-card-grid">
          ${insights.slice(0, beginnerMode ? 4 : 5).map((item) => `
            <article class="insight-card">
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.body)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
    bindInlineTooltipTriggers(el.keyInsightsModule);
  }

  function renderIncomeStack() {
    if (!el.incomeStackModule) return;
    const row = findRowByAge(model.base.rows, ui.selectedAge || state.profile.retirementAge) || model.base.rows[0];
    if (!row) {
      el.incomeStackModule.innerHTML = "";
      return;
    }
    const segments = [
      { label: "Pension", value: row.pensionNet + row.spousePensionNet, color: "#f59e0b" },
      { label: "CPP", value: row.cppNet + row.spouseCppNet, color: "#16a34a" },
      { label: "OAS", value: row.oasNet + row.spouseOasNet, color: "#0ea5a8" },
      { label: "Savings withdrawals", value: row.netFromWithdrawal, color: "#0f6abf" },
    ].filter((item) => item.value > 0);
    const total = Math.max(1, segments.reduce((sum, item) => sum + item.value, 0));
    const largest = segments.slice().sort((a, b) => b.value - a.value)[0];
    const withdrawalShare = total > 0 ? row.netFromWithdrawal / total : 0;
    let sentence = "Your retirement income is spread across several sources.";
    if (withdrawalShare > 0.45) {
      sentence = "Your plan depends heavily on portfolio withdrawals, which makes market returns and tax drag more important.";
    } else if (largest?.label === "Pension") {
      sentence = "Most of your retirement income comes from pension income, with savings acting as a top-up.";
    } else if ((row.cppNet + row.oasNet + row.spouseCppNet + row.spouseOasNet) / total > 0.35) {
      sentence = "Government benefits provide a meaningful base layer, reducing the amount you need from savings.";
    }
    el.incomeStackModule.innerHTML = `
      <section class="subsection">
        <div class="section-head-tight">
          <div>
            <h3>Retirement Income Stack</h3>
            <p class="muted">Where spendable income comes from at age ${row.age}.</p>
          </div>
          <span class="coverage-badge ${withdrawalShare < 0.4 ? "coverage-good" : ""}">${formatPct(total > 0 ? (total - row.netFromWithdrawal) / total : 0)} guaranteed</span>
        </div>
        <div class="income-stack-bar" role="img" aria-label="Retirement income stack by source">
          ${segments.map((item) => `<span style="width:${((item.value / total) * 100).toFixed(1)}%; background:${item.color};"></span>`).join("")}
        </div>
        <ul class="source-legend">
          ${segments.map((item) => `
            <li>
              <span class="source-dot" style="background:${item.color};"></span>
              <strong>${escapeHtml(item.label)}:</strong> ${formatCurrency(item.value)}
            </li>
          `).join("")}
        </ul>
        <p class="small-copy muted">${escapeHtml(sentence)} Main dashboard view assumes the savings gap is funded from taxable registered withdrawals.</p>
      </section>
    `;
  }

  function renderComparisonModule() {
    if (!el.plannerComparisonModule) return;
    el.plannerComparisonModule.innerHTML = `
      <section class="subsection">
        <div class="section-head-tight">
          <div>
            <h3>Plan comparison</h3>
            <p class="muted">Compare this plan with alternate retirement dates, spending levels, or benefit timing without losing your current assumptions.</p>
          </div>
        </div>
        <div class="comparison-card-grid">
          <article class="comparison-card">
            <strong>Save current as a scenario</strong>
            <p class="small-copy muted">Create a baseline before testing alternatives.</p>
            <button class="btn btn-secondary" type="button" data-action="save-current-scenario">Save scenario</button>
          </article>
          <article class="comparison-card">
            <strong>Open comparison mode</strong>
            <p class="small-copy muted">View saved scenarios side by side using the most important metrics.</p>
            <button class="btn btn-secondary" type="button" data-action="open-scenario-compare">Compare scenarios</button>
          </article>
          <article class="comparison-card">
            <strong>Quick strategy preview</strong>
            <p class="small-copy muted">Use strategy suggestions below for delay CPP, earlier RRSP withdrawals, or lower spending tests.</p>
            <button class="btn btn-secondary" type="button" data-action="focus-strategies">Go to strategy suggestions</button>
          </article>
        </div>
      </section>
    `;
  }

  function renderActionHub() {
    if (!el.dashboardActionHub) return;
    el.dashboardActionHub.innerHTML = `
      <div class="action-hub-grid">
        <article class="comparison-card">
          <strong>Share</strong>
          <p class="small-copy muted">Copy a link or plain-English summary for a spouse, client, or advisor.</p>
          <div class="landing-actions">
            <button class="btn btn-secondary" type="button" data-action="copy-share-link">Copy share link</button>
            <button class="btn btn-secondary" type="button" data-action="copy-minimal-link">Copy minimal link</button>
            <button class="btn btn-secondary" type="button" data-action="copy-plan-summary">Copy summary</button>
          </div>
        </article>
        <article class="comparison-card">
          <strong>Compare</strong>
          <p class="small-copy muted">Save this plan as a scenario or open side-by-side comparison.</p>
          <div class="landing-actions">
            <button class="btn btn-secondary" type="button" data-action="save-current-scenario">Save scenario</button>
            <button class="btn btn-secondary" type="button" data-action="open-scenario-compare">Compare scenarios</button>
            <button class="btn btn-secondary" type="button" data-action="copy-scenario-share">Share this scenario</button>
          </div>
        </article>
        <article class="comparison-card">
          <strong>Export</strong>
          <p class="small-copy muted">Download a standard summary or print the client-ready report.</p>
          <div class="landing-actions">
            <button class="btn btn-secondary" type="button" data-action="download-summary">Download retirement summary</button>
            <button class="btn btn-secondary" type="button" data-action="print-client-summary">Print client summary</button>
            <button class="btn btn-secondary" type="button" data-action="copy-scenario-summary">Copy scenario summary</button>
          </div>
        </article>
        <article class="comparison-card support-action-card">
          <strong>Support this free tool</strong>
          <p class="small-copy muted">If this planner saved you time or helped clarify retirement decisions, consider supporting future updates.</p>
          <div class="landing-actions">
            <a class="btn btn-secondary" href="https://buymeacoffee.com/ashleysnl" target="_blank" rel="noopener noreferrer">☕ Support</a>
          </div>
        </article>
      </div>
    `;
  }

  function renderRetirementScore() {
    if (!el.retirementScoreCard) return;
    if (beginnerMode) {
      el.retirementScoreCard.hidden = true;
      el.retirementScoreCard.innerHTML = "";
      return;
    }
    el.retirementScoreCard.hidden = false;
    el.retirementScoreCard.innerHTML = `
      <h3>Detailed Plan Health Score ${tooltipButton("retirementScore")}</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Total</strong><span>${planScore.total}/100</span></div>
        <div class="preview-kpi-item"><strong>Status</strong><span>${planScore.band}</span></div>
        <div class="preview-kpi-item"><strong>Coverage</strong><span>${planScore.subs.coverage}/35</span></div>
        <div class="preview-kpi-item"><strong>Longevity</strong><span>${planScore.subs.longevity}/30</span></div>
        <div class="preview-kpi-item"><strong>Tax drag</strong><span>${planScore.subs.taxDrag}/15</span></div>
        <div class="preview-kpi-item"><strong>Clawback</strong><span>${planScore.subs.clawback}/10</span></div>
        <div class="preview-kpi-item"><strong>RRIF shock</strong><span>${planScore.subs.rrifShock}/10</span></div>
      </div>
    `;
  }

  function renderCoverageTable() {
    if (!el.coverageTableWrap || !el.coverageTable) return;
    const rows = model.base.rows.filter((row) => row.age >= state.profile.retirementAge);
    el.coverageTableWrap.hidden = !ui.showCoverageTable;
    if (!ui.showCoverageTable) return;
    el.coverageTable.innerHTML = `
      <thead>
        <tr>
          <th>Age</th>
          <th>Pension</th>
          <th>CPP</th>
          <th>OAS</th>
          <th>Net from savings</th>
          <th>Tax wedge</th>
          <th>Spending target</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((r) => `
          <tr>
            <td>${r.age}</td>
            <td>${formatCurrency(amountForDisplay(r, r.pensionNet + r.spousePensionNet))}</td>
            <td>${formatCurrency(amountForDisplay(r, r.cppNet + r.spouseCppNet))}</td>
            <td>${formatCurrency(amountForDisplay(r, r.oasNet + r.spouseOasNet))}</td>
            <td>${formatCurrency(amountForDisplay(r, r.netFromWithdrawal))}</td>
            <td>${formatCurrency(amountForDisplay(r, r.taxOnWithdrawal + r.oasClawback))}</td>
            <td>${formatCurrency(amountForDisplay(r, r.spending))}</td>
          </tr>
        `).join("")}
      </tbody>
    `;
  }

  function renderDashboardNarrative() {
    const current = findRowByAge(model.base.rows, ui.selectedAge || state.profile.retirementAge);
    if (!current) return;
    if (el.walkthroughHeading) {
      el.walkthroughHeading.textContent = `Explain for Age ${current.age}`;
    }
    const coveragePct = current.spending > 0 ? (current.guaranteedNet / current.spending) * 100 : 0;
    const rrifThresholdAge = state.strategy.rrifConversionAge || 71;
    const showRrifExplanation = state.strategy.applyRrifMinimums && current.age >= rrifThresholdAge && current.rrifMinimum > 0;
    if (el.walkthroughStrip) {
      el.walkthroughStrip.innerHTML = `
        <article class="walk-step">
          <h4>Step 1 ${tooltipButton("kpiGuaranteedIncome")}</h4>
          <p>Guaranteed income covers <strong>${coveragePct.toFixed(0)}%</strong> of your spending target.</p>
        </article>
        <article class="walk-step">
          <h4>Step 2 ${tooltipButton("kpiNetGap")}</h4>
          <p>Remaining <strong>after-tax gap</strong> is <strong>${formatCurrency(current.netGap)}</strong>.</p>
        </article>
        <article class="walk-step">
          <h4>Step 3 ${tooltipButton("kpiGrossWithdrawal")}</h4>
          <p>You withdraw <strong>${formatCurrency(current.withdrawal)}</strong> gross; tax drag is <strong>${formatCurrency(current.taxOnWithdrawal)}</strong>.</p>
        </article>
        ${showRrifExplanation ? `
          <article class="walk-step">
            <h4>RRIF Rule ${tooltipButton("forcedRrifDrawdown")}</h4>
            <p>From age <strong>${rrifThresholdAge}</strong>, minimum RRIF withdrawals can be required. This can raise income and taxes even when your spending need is lower.</p>
          </article>
        ` : ""}
      `;
      bindInlineTooltipTriggers(el.walkthroughStrip);
    }
    renderYearCards();
  }

  function renderCommonMistakes() {
    if (!el.commonMistakesModule) return;
    el.commonMistakesModule.innerHTML = `
      <details class="subsection">
        <summary>Common retirement planning mistakes</summary>
        <ul class="plain-list small-copy muted">
          <li>Underestimating inflation and assuming today’s spending will buy the same lifestyle later.</li>
          <li>Comparing after-tax spending needs with before-tax income sources.</li>
          <li>Ignoring tax on RRSP/RRIF withdrawals and the extra gross withdrawal needed to net spending.</li>
          <li>Taking CPP or OAS timing for granted without checking the tradeoff.</li>
          <li>Forgetting that RRIF minimums can raise taxable income even if spending drops.</li>
        </ul>
      </details>
    `;
  }

  function renderMethodologySummary() {
    if (!el.methodologySummaryModule) return;
    el.methodologySummaryModule.innerHTML = `
      <details class="subsection">
        <summary>How this calculator works</summary>
        <div class="methodology-summary-grid small-copy muted">
          <div>
            <strong>Inflation</strong>
            <p>Your spending goal starts in today’s dollars and is inflated into future-year nominal amounts.</p>
          </div>
          <div>
            <strong>Taxes</strong>
            <p>When enabled, the planner estimates federal + provincial tax and OAS clawback using your selected province.</p>
          </div>
          <div>
            <strong>Withdrawals</strong>
            <p>Guaranteed income is applied first, then savings withdrawals fill the remaining after-tax gap.</p>
          </div>
          <div>
            <strong>Benefits</strong>
            <p>CPP and OAS start at their configured ages. RRIF minimum rules can force later withdrawals when enabled.</p>
          </div>
        </div>
        <p class="small-copy"><button class="text-link-btn" type="button" data-nav-target="methodology">Read full methodology & sources</button></p>
      </details>
    `;
  }

  function renderYearCards() {
    if (!el.yearCards) return;
    const firstRetRow = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
    const checkpoints = [
      { label: `First retirement year (Age ${firstRetRow?.age ?? state.profile.retirementAge})`, row: firstRetRow },
      { label: "Age 65", row: findRowByAge(model.base.rows, 65) },
      { label: "RRIF conversion year (Age 71)", row: findRowByAge(model.base.rows, 71) },
    ];

    el.yearCards.innerHTML = checkpoints.map((point) => {
      if (!point.row) return `<article class="withdrawal-card"><h4>${escapeHtml(point.label)}</h4><p class="muted small-copy">Not in projection horizon.</p></article>`;
      const row = point.row;
      const parts = [
        { label: "Guaranteed income", value: row.guaranteedNet, color: "#16a34a" },
        { label: "Net withdrawal", value: row.netFromWithdrawal, color: "#0f6abf" },
        { label: "Tax wedge", value: row.taxOnWithdrawal + row.oasClawback, color: "#d9485f" },
      ];
      const total = Math.max(1, parts.reduce((sum, p) => sum + p.value, 0));
      return `
        <article class="withdrawal-card">
          <h4>${escapeHtml(point.label)}</h4>
          <div class="withdrawal-bar">
            ${parts.map((p) => `<span title="${escapeHtml(p.label)} ${formatCurrency(p.value)}" style="width:${((p.value / total) * 100).toFixed(1)}%; background:${p.color};"></span>`).join("")}
          </div>
          <div class="withdrawal-metrics">
            <div><strong>Spending target (after-tax) ${tooltipButton("kpiSpendingTarget")}</strong><span>${formatCurrency(row.spending)}</span></div>
            <div><strong>Guaranteed income after estimated tax ${tooltipButton("kpiGuaranteedIncome")}</strong><span>${formatCurrency(row.guaranteedNet)}</span></div>
            <div><strong>Net gap funded by savings ${tooltipButton("kpiNetGap")}</strong><span>${formatCurrency(row.netGap)}</span></div>
            <div><strong>Gross withdrawal required ${tooltipButton("kpiGrossWithdrawal")}</strong><span>${formatCurrency(row.withdrawal)}</span></div>
            <div><strong>Tax on withdrawal ${tooltipButton("learnTaxGrossUp")}</strong><span>${formatCurrency(row.taxOnWithdrawal)}</span></div>
            <div><strong>OAS clawback ${tooltipButton("oasClawback")}</strong><span>${formatCurrency(row.oasClawback)}</span></div>
            <div><strong>RRIF minimum (if applicable) ${tooltipButton("rrifMinimums")}</strong><span>${formatCurrency(row.rrifMinimum)}</span></div>
            <div><strong>Effective tax rate ${tooltipButton("learnTaxGrossUp")}</strong><span>${formatPct(row.effectiveTaxRate)}</span></div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderBalanceLegend() {
    if (!el.chartLegend) return;
    const items = getBalanceLegendItems(ui.showStressBand);
    el.chartLegend.innerHTML = items.map((item) => `
      <span class="legend-item">
        <span class="legend-chip" style="background:${item[1]};"></span>${item[0]}
      </span>
    `).join("");
  }

  function renderCoverageLegend() {
    if (!el.coverageLegend) return;
    const items = getCoverageLegendItems();
    el.coverageLegend.innerHTML = items.map((item) => `
      <span class="legend-item"><span class="legend-chip" style="background:${item[1]};"></span>${item[0]}</span>
    `).join("");
  }
}
