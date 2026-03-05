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
  } = ctx;

  const model = ui.lastModel;
  if (!model) return;

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
  renderBalanceLegend();
  drawMainChart(model.base.rows, model.best.rows, model.worst.rows);
  renderCoverageLegend();
  drawCoverageChart(model, ui.selectedAge);
  renderCoverageTable();
  renderDashboardNarrative();
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
      `Estimated first retirement year guaranteed income: <strong>${formatCurrency(model.kpis.firstYearGuaranteed)}</strong>.`,
      `Dashboard assumption: withdrawals are modeled as RRSP/RRIF taxable withdrawals for this explanatory view.`,
    ].join("<br>");
  }

  function renderDashboardStatus() {
    if (!el.dashboardStatus) return;
    const gap = model.kpis.firstYearGap;
    const depletionAge = model.kpis.depletionAge;
    let label = "Borderline";
    let css = "status-pill borderline";

    if (gap >= 0 && !depletionAge) {
      label = "On Track";
      css = "status-pill on-track";
    } else if (gap < -10000 || depletionAge) {
      label = "Off Track";
      css = "status-pill off-track";
    }

    el.dashboardStatus.className = css;
    el.dashboardStatus.textContent = `Are you on track? ${label}`;
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

  function renderKpiCards() {
    const retirementRow = findRowByAge(model.base.rows, state.profile.retirementAge);
    const row = retirementRow || findRowByAge(model.base.rows, ui.selectedAge);
    if (!row) return;
    if (el.kpiContext) {
      el.kpiContext.textContent = `Dashboard KPIs use retirement start (Age ${state.profile.retirementAge}). Use Pick age for year-by-year detail.`;
    }
    const kpis = [
      { label: "Retire Bal", value: formatCurrency(model.kpis.balanceAtRetirement), sub: `Age ${state.profile.retirementAge}`, tip: "kpiBalanceRetirement" },
      { label: "Spend", value: formatCurrency(row.spending), sub: `After-tax goal`, tip: "kpiSpendingTarget" },
      { label: "Guaranteed", value: formatCurrency(row.guaranteedGross), sub: `Pension + CPP + OAS`, tip: "kpiGuaranteedIncome" },
      { label: "Net Gap", value: row.netGap > 0 ? formatCurrency(row.netGap) : formatCurrency(0), sub: row.netGap > 0 ? "From savings" : "No gap", tip: "kpiNetGap" },
      { label: "Gross Draw", value: formatCurrency(row.withdrawal), sub: `Tax wedge ${formatCurrency(row.taxOnWithdrawal + row.oasClawback)}`, tip: "kpiGrossWithdrawal" },
      { label: "Tax Est.", value: formatCurrency(row.tax + row.oasClawback), sub: `${formatPct(row.effectiveTaxRate)} effective`, tip: "oasClawback" },
      { label: "OAS Risk", value: state.strategy.oasClawbackModeling ? getOasRiskLevel(row.oasClawback).label : "Off", sub: state.strategy.oasClawbackModeling ? formatCurrency(row.oasClawback) : "Modeling off", tip: "oasRiskMeter" },
    ];
    if (el.kpiGrid) {
      el.kpiGrid.innerHTML = kpis.map((card) => `
        <article class="metric-card">
          <span class="label">${escapeHtml(card.label)} ${tooltipButton(card.tip)}</span>
          <span class="value">${escapeHtml(card.value)}</span>
          <span class="sub">${escapeHtml(card.sub)}</span>
        </article>
      `).join("");
    }
  }

  function renderRetirementScore() {
    if (!el.retirementScoreCard) return;
    const row = findRowByAge(model.base.rows, state.profile.retirementAge);
    if (!row) return;
    const coverageRatio = row.spending > 0 ? clamp((row.guaranteedNet / row.spending), 0, 1.2) : 1;
    const coverageScore = Math.round(clamp(coverageRatio * 100, 0, 100));
    const depletionScore = model.kpis.depletionAge
      ? Math.round(clamp(((model.kpis.depletionAge - state.profile.retirementAge) / Math.max(1, state.profile.lifeExpectancy - state.profile.retirementAge)) * 100, 0, 100))
      : 100;
    const taxScore = Math.round(clamp((1 - row.effectiveTaxRate / 0.45) * 100, 0, 100));
    const clawbackScore = state.strategy.oasClawbackModeling
      ? Math.round(clamp((1 - (row.oasClawback / Math.max(1, row.oas + row.spouseOas))) * 100, 0, 100))
      : 100;
    const totalScore = Math.round((coverageScore * 0.35) + (depletionScore * 0.35) + (taxScore * 0.2) + (clawbackScore * 0.1));

    el.retirementScoreCard.innerHTML = `
      <h3>Retirement Plan Score ${tooltipButton("retirementScore")}</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Total</strong><span>${totalScore}/100</span></div>
        <div class="preview-kpi-item"><strong>Coverage</strong><span>${coverageScore}</span></div>
        <div class="preview-kpi-item"><strong>Depletion Risk</strong><span>${depletionScore}</span></div>
        <div class="preview-kpi-item"><strong>Tax Efficiency</strong><span>${taxScore}</span></div>
        <div class="preview-kpi-item"><strong>Clawback Exposure</strong><span>${clawbackScore}</span></div>
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
            <div><strong>Guaranteed income total ${tooltipButton("kpiGuaranteedIncome")}</strong><span>${formatCurrency(row.guaranteedGross)}</span></div>
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
