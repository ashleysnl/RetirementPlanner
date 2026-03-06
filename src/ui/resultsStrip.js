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

  const spending = Math.max(0, Number(row.spending || 0));
  const guaranteed = Math.max(0, Number(row.guaranteedGross || 0));
  const netGap = Math.max(0, Number(row.netGap || 0));
  const gross = Math.max(0, Number(row.withdrawal || 0));
  const taxWedge = Math.max(0, Number((row.taxOnWithdrawal || 0) + (row.oasClawback || 0)));
  const coverageRatio = spending > 0 ? guaranteed / spending : 1;
  const coveragePct = clamp(coverageRatio * 100, 0, 300);
  const surplus = guaranteed > spending;
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
        <span class="sub">Pension + CPP + OAS</span>
      </article>
      <article class="metric-card ${surplus ? "metric-good" : ""}">
        <span class="label">Net gap from savings ${tooltipButton("kpiNetGap")}</span>
        <span class="value">${surplus ? "Surplus" : formatCurrency(netGap)}</span>
        <span class="sub">${surplus ? "Guaranteed exceeds target" : "After-tax gap"}</span>
      </article>
      <article class="metric-card">
        <span class="label">Gross withdrawal needed ${tooltipButton("kpiGrossWithdrawal")}</span>
        <span class="value">${formatCurrency(gross)}</span>
        <span class="sub">Tax wedge: ${formatCurrency(taxWedge)}</span>
      </article>
    </div>
    <div class="results-strip-meta">
      <span class="coverage-badge ${surplus ? "coverage-good" : ""}">
        Income covers ${formatPct(Math.min(2.99, coverageRatio))}
      </span>
      <div class="results-mini-bar" role="img" aria-label="Income coverage mini bar">
        <span class="seg guaranteed" style="width:${guaranteedW.toFixed(1)}%"></span>
        <span class="seg netdraw" style="width:${netW.toFixed(1)}%"></span>
        <span class="seg tax" style="width:${taxW.toFixed(1)}%"></span>
      </div>
      <p class="small-copy muted">Spending = Guaranteed + Net from savings. Gross draw = Net + Tax wedge.</p>
    </div>
  `;
}
