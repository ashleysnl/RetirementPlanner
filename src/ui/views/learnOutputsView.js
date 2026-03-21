export function updateLearnOutputsView(ctx) {
  const {
    state,
    el,
    rrifMinWithdrawal,
    estimateTotalTax,
    calculatePhaseWeightedSpending,
    drawLearnLineChart,
    drawLearnMultiLineChart,
    formatCurrency,
    formatCompactCurrency,
    formatPct,
    formatNumber,
    formatSignedCurrency,
    toPct,
    clamp,
    tooltipButton,
    bindInlineTooltipTriggers,
  } = ctx;

  if (!el.learnPanel || !el.learnPanel.querySelector("#learnInflationOut")) return;
  const learn = state.uiState.learn;

  const infAnnual = learn.inflation.spendingToday * Math.pow(1 + learn.inflation.rate, learn.inflation.years);
  const infRateValue = el.learnPanel.querySelector("#learnInflationRateValue");
  if (infRateValue) infRateValue.textContent = `${formatNumber(toPct(learn.inflation.rate))}%`;
  const infOut = el.learnPanel.querySelector("#learnInflationOut");
  if (infOut) {
    infOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Future Annual Budget</strong><span>${formatCurrency(infAnnual)}</span></div>
    `;
  }

  const gross = learn.taxGrossUp.rate >= 0.99 ? learn.taxGrossUp.netGoal : learn.taxGrossUp.netGoal / (1 - learn.taxGrossUp.rate);
  const tax = Math.max(0, gross - learn.taxGrossUp.netGoal);
  const taxRateValue = el.learnPanel.querySelector("#learnTaxRateValue");
  if (taxRateValue) taxRateValue.textContent = `${formatNumber(toPct(learn.taxGrossUp.rate))}%`;
  const taxOut = el.learnPanel.querySelector("#learnTaxOut");
  if (taxOut) {
    taxOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Required gross withdrawal</strong><span>${formatCurrency(gross)}</span></div>
      <div class="preview-kpi-item"><strong>Tax amount</strong><span>${formatCurrency(tax)}</span></div>
      <div class="preview-kpi-item"><strong>Net target</strong><span>${formatCurrency(learn.taxGrossUp.netGoal)}</span></div>
      <div class="preview-kpi-item"><strong>Gross-up difference</strong><span>${formatCurrency(gross - learn.taxGrossUp.netGoal)}</span></div>
    `;
  }

  const rrifFactor = rrifMinWithdrawal[learn.rrif.age] ?? 0.2;
  const rrifMin = learn.rrif.balance * rrifFactor;
  const rrifAgeValue = el.learnPanel.querySelector("#learnRrifAgeValue");
  if (rrifAgeValue) rrifAgeValue.textContent = `${formatNumber(learn.rrif.age)}`;
  const rrifOut = el.learnPanel.querySelector("#learnRrifOut");
  if (rrifOut) {
    rrifOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Minimum withdrawal %</strong><span>${formatPct(rrifFactor)}</span></div>
      <div class="preview-kpi-item"><strong>Minimum withdrawal amount</strong><span>${formatCurrency(rrifMin)}</span></div>
    `;
  }

  const oasAnnualTotal = learn.oas.monthly * 12 * Number(learn.oas.recipients || 1);
  const oasThreshold = 90000;
  const oasLoss = Math.min(oasAnnualTotal, Math.max(0, (learn.oas.income - oasThreshold) * 0.15));
  const oasRemain = Math.max(0, oasAnnualTotal - oasLoss);
  const oasIncomeValue = el.learnPanel.querySelector("#learnOasIncomeValue");
  if (oasIncomeValue) oasIncomeValue.textContent = `${formatCurrency(learn.oas.income)}`;
  const oasOut = el.learnPanel.querySelector("#learnOasOut");
  if (oasOut) {
    oasOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Estimated OAS lost</strong><span>${formatCurrency(oasLoss)}</span></div>
      <div class="preview-kpi-item"><strong>Estimated OAS remaining</strong><span>${formatCurrency(oasRemain)}</span></div>
      <div class="preview-kpi-item"><strong>OAS before clawback</strong><span>${formatCurrency(oasAnnualTotal)}</span></div>
      <div class="preview-kpi-item"><strong>Threshold used</strong><span>${formatCurrency(oasThreshold)}</span></div>
    `;
  }

  const split = clamp(learn.spousalSplit.splitPct, 0, 0.5);
  const splitPctValue = el.learnPanel.querySelector("#learnSplitPctValue");
  if (splitPctValue) splitPctValue.textContent = `${formatNumber(toPct(split))}%`;
  const move = learn.spousalSplit.spouseA * split;
  const beforeTax = estimateTotalTax(state, learn.spousalSplit.spouseA, 0) + estimateTotalTax(state, learn.spousalSplit.spouseB, 0);
  const afterTax = estimateTotalTax(state, Math.max(0, learn.spousalSplit.spouseA - move), 0)
    + estimateTotalTax(state, learn.spousalSplit.spouseB + move, 0);
  const spousalOut = el.learnPanel.querySelector("#learnSpousalOut");
  if (spousalOut) {
    spousalOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Combined tax before split</strong><span>${formatCurrency(beforeTax)}</span></div>
      <div class="preview-kpi-item"><strong>Combined tax after split</strong><span>${formatCurrency(afterTax)}</span></div>
      <div class="preview-kpi-item"><strong>Estimated tax difference</strong><span>${formatSignedCurrency(beforeTax - afterTax)}</span></div>
      <div class="preview-kpi-item"><strong>Income shifted</strong><span>${formatCurrency(move)}</span></div>
    `;
  }

  const weightedSpending = calculatePhaseWeightedSpending(learn.phases);
  const phaseOut = el.learnPanel.querySelector("#learnPhaseOut");
  if (phaseOut) {
    phaseOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Phase-weighted annual spending ${tooltipButton("phaseWeightedSpending")}</strong><span>${formatCurrency(weightedSpending)}</span></div>
      <div class="preview-kpi-item"><strong>Total years modeled</strong><span>${learn.phases.goYears + learn.phases.slowYears + learn.phases.noYears}</span></div>
    `;
    bindInlineTooltipTriggers(phaseOut);
  }

  safeDraw(drawInflationChart);
  safeDraw(drawIndexedChart);
  safeDraw(drawPhaseChart);

  function drawInflationChart() {
    const canvas = el.learnPanel?.querySelector("#learnInflationChart");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const d = state.uiState.learn.inflation;
    const points = [];
    for (let i = 0; i <= d.years; i += 1) {
      points.push(d.spendingToday * Math.pow(1 + d.rate, i));
    }
    drawLearnLineChart(canvas, points, {
      color: "#0f6abf",
      fill: "rgba(15, 106, 191, 0.16)",
      xLabeler: (i) => `${i}y`,
    }, formatCurrency, formatCompactCurrency);
  }

  function drawIndexedChart() {
    const canvas = el.learnPanel?.querySelector("#learnIndexedChart");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const d = state.uiState.learn?.indexedIncome || {};
    const startIncome = safeNumber(d.startIncome, 30000);
    const years = clamp(Math.round(safeNumber(d.years, 25)), 1, 40);
    const inflation = clamp(safeNumber(d.inflation, 0.02), 0, 0.08);
    const infValue = el.learnPanel?.querySelector("#learnIndexedInflationValue");
    if (infValue) infValue.textContent = `${formatNumber(toPct(inflation))}%`;
    const indexed = [];
    const flatNominal = [];
    const flatReal = [];
    for (let i = 0; i <= years; i += 1) {
      indexed.push(startIncome * Math.pow(1 + inflation, i));
      flatNominal.push(startIncome);
      flatReal.push(startIncome / Math.pow(1 + inflation, i));
    }
    try {
      drawLearnMultiLineChart(canvas, [indexed, flatNominal, flatReal], {
        colors: ["#16a34a", "#f59e0b", "#d9485f"],
        xLabeler: (i, total) => (i % Math.max(1, Math.ceil(total / 5)) === 0 ? `${i}y` : ""),
      }, formatCurrency, formatCompactCurrency);
    } catch {
      // Fallback to single indexed line if multi-series draw fails in older webviews.
      drawLearnLineChart(canvas, indexed, {
        color: "#16a34a",
        fill: "rgba(22, 163, 74, 0.12)",
        xLabeler: (i, total) => (i % Math.max(1, Math.ceil(total / 5)) === 0 ? `${i}y` : ""),
      }, formatCurrency, formatCompactCurrency);
    }
  }

  function drawPhaseChart() {
    const canvas = el.learnPanel?.querySelector("#learnPhaseChart");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const d = state.uiState.learn?.phases || {};
    const base = Math.max(0, safeNumber(d.base, 80000));
    const goYears = clamp(Math.round(safeNumber(d.goYears, 10)), 1, 20);
    const slowYears = clamp(Math.round(safeNumber(d.slowYears, 10)), 1, 20);
    const noYears = clamp(Math.round(safeNumber(d.noYears, 10)), 1, 25);
    const goPct = clamp(safePercent(d.goPct, 1.1), 0.6, 1.5);
    const slowPct = clamp(safePercent(d.slowPct, 0.9), 0.5, 1.3);
    const noPct = clamp(safePercent(d.noPct, 0.75), 0.4, 1.2);
    const points = [];
    for (let i = 0; i < goYears; i += 1) points.push(base * goPct);
    for (let i = 0; i < slowYears; i += 1) points.push(base * slowPct);
    for (let i = 0; i < noYears; i += 1) points.push(base * noPct);
    drawLearnLineChart(canvas, points, {
      color: "#0ea5a8",
      fill: "rgba(14, 165, 168, 0.14)",
      xLabeler: (i, total) => (i % Math.max(1, Math.ceil(total / 6)) === 0 ? `Y${i + 1}` : ""),
    }, formatCurrency, formatCompactCurrency);
  }

  function safeNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function safePercent(value, fallback) {
    const n = safeNumber(value, fallback);
    if (n > 1.6) return n / 100;
    return n;
  }

  function safeDraw(fn) {
    try {
      fn();
    } catch {
      // Keep other learning visuals rendering if one chart fails.
    }
  }
}
