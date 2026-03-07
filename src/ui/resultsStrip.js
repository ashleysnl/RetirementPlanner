import { getReportMetrics } from "../model/reportMetrics.js";

export function renderResultsStrip(ctx) {
  const {
    mountEl,
    row,
    selectedAge,
    minAge,
    maxAge,
    tooltipButton,
    formatCurrency,
    formatPct,
    clamp,
  } = ctx;
  if (!mountEl || !row) return;

  const metrics = getReportMetrics(ctx.plan, row);
  const spending = metrics.spending;
  const guaranteed = metrics.guaranteedNet;
  const netGap = metrics.netGap;
  const gross = metrics.grossWithdrawal;
  const taxWedge = metrics.dragAmount;
  const coverageRatio = metrics.coverageRatio;
  const coveragePct = clamp(coverageRatio * 100, 0, 300);
  const surplus = metrics.surplus > 0;
  const barTotal = Math.max(1, guaranteed + Math.max(0, gross - taxWedge) + taxWedge);
  const guaranteedW = (guaranteed / barTotal) * 100;
  const netW = (Math.max(0, gross - taxWedge) / barTotal) * 100;
  const taxW = (taxWedge / barTotal) * 100;

  mountEl.innerHTML = `
    <div class="results-strip-head">
      <h3>At a glance ${tooltipButton("kpiNetGap")}</h3>
      <div class="results-strip-controls">
        <label for="resultsAgePicker" class="small-copy">Pick age</label>
        <input id="resultsAgePicker" type="range" min="${minAge}" max="${maxAge}" step="1" value="${selectedAge}" aria-label="Results strip age selector" />
        <strong id="resultsAgeLabel">Age ${selectedAge}</strong>
      </div>
    </div>
    <div class="results-strip-kpis">
      <article class="metric-card">
        <span class="label">After-tax spending ${tooltipButton("kpiSpendingTarget")}</span>
        <span class="value">${formatCurrency(spending)}</span>
        <span class="sub">Target this age</span>
      </article>
      <article class="metric-card">
        <span class="label">Guaranteed income ${tooltipButton("kpiGuaranteedIncome")}</span>
        <span class="value">${formatCurrency(guaranteed)}</span>
        <span class="sub">${metrics.estimateTaxes ? "After estimated tax" : "Tax estimates off"}</span>
      </article>
      <article class="metric-card ${surplus ? "metric-good" : ""}">
        <span class="label">Net gap from savings ${tooltipButton("kpiNetGap")}</span>
        <span class="value">${surplus ? "Surplus" : formatCurrency(netGap)}</span>
        <span class="sub">${surplus ? "Guaranteed exceeds target" : "After-tax gap"}</span>
      </article>
      <article class="metric-card">
        <span class="label">Gross withdrawal needed ${tooltipButton("kpiGrossWithdrawal")}</span>
        <span class="value">${formatCurrency(gross)}</span>
        <span class="sub">${metrics.estimateTaxes ? `Tax + clawback drag: ${formatCurrency(taxWedge)}` : "Tax estimates off"}</span>
      </article>
    </div>
    <div class="results-strip-meta">
      <span class="coverage-badge ${surplus ? "coverage-good" : ""}">
        Guaranteed income covers ${formatPct(Math.min(2.99, coverageRatio))}
      </span>
      <div class="results-mini-bar" role="img" aria-label="Income coverage mini bar">
        <span class="seg guaranteed" style="width:${guaranteedW.toFixed(1)}%"></span>
        <span class="seg netdraw" style="width:${netW.toFixed(1)}%"></span>
        <span class="seg tax" style="width:${taxW.toFixed(1)}%"></span>
      </div>
      <p class="small-copy muted">All comparisons are on an after-tax spending basis. Gross draw = net withdrawal plus estimated tax/clawback drag.</p>
    </div>
  `;
}
