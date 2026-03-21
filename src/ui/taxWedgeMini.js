export function renderTaxWedgeMini(ctx) {
  const { mountEl, row, tooltipButton, formatCurrency } = ctx;
  if (!mountEl || !row) return;
  const gross = Math.max(0, Number(row.withdrawal || 0));
  const tax = Math.max(0, Number((row.taxOnWithdrawal || 0) + (row.oasClawback || 0)));
  const net = Math.max(0, gross - tax);
  const total = Math.max(1, gross);
  const netPct = (net / total) * 100;
  const taxPct = (tax / total) * 100;
  const netLabel = netPct < 26 ? "Net" : `Net cash ${formatCurrency(net)}`;
  const taxLabel = taxPct < 26 ? "Tax" : `Tax wedge ${formatCurrency(tax)}`;
  const highTaxDrag = gross > 0 ? (tax / gross) > 0.25 : false;

  mountEl.innerHTML = `
    <article class="subsection">
      <h3>Why gross withdrawal &gt; what you spend ${tooltipButton("kpiGrossWithdrawal")}</h3>
      <div class="mini-split-bar" role="img" aria-label="Gross vs net withdrawal split">
        <span class="seg netdraw" style="width:${netPct.toFixed(1)}%">${netLabel}</span>
        <span class="seg tax hatch" style="width:${taxPct.toFixed(1)}%">${taxLabel}</span>
      </div>
      <p class="mini-split-meta">
        <strong>Net cash you keep:</strong> ${formatCurrency(net)}
        <span aria-hidden="true"> | </span>
        <strong>Tax sent to CRA:</strong> ${formatCurrency(tax)}
      </p>
      ${highTaxDrag ? `<span class="status-pill borderline">High tax drag this year</span>` : ""}
      <label class="inline-check small-copy">
        <input type="checkbox" data-bind="uiState.showGrossWithdrawals" checked />
        Show gross withdrawals
      </label>
    </article>
  `;
}
