export function renderGrossNetCallout(ctx) {
  const {
    mountEl,
    row,
    formatCurrency,
    formatPct,
    emphasizeTaxes,
  } = ctx;
  if (!mountEl || !row) return;
  const gross = Math.max(0, Number(row.withdrawal || 0));
  const tax = Math.max(0, Number((row.taxOnWithdrawal || 0) + (row.oasClawback || 0)));
  const net = Math.max(0, gross - tax);
  const total = Math.max(1, gross);
  const taxPct = tax / total;
  const netPct = 1 - taxPct;
  mountEl.innerHTML = `
    <article class="subsection gross-net-callout ${emphasizeTaxes ? "emphasize" : ""}">
      <h3>Why gross &gt; net</h3>
      <div class="mini-split-bar" role="img" aria-label="Gross withdrawal split into net cash and tax wedge">
        <span class="seg netdraw" style="width:${(netPct * 100).toFixed(1)}%">
          <span class="seg-label">${netPct > 0.16 ? "Net you keep" : ""}</span>
        </span>
        <span class="seg tax hatch" style="width:${(taxPct * 100).toFixed(1)}%">
          <span class="seg-label">${taxPct > 0.14 ? "Tax wedge" : ""}</span>
        </span>
      </div>
      <div class="gross-net-legend">
        <span class="gross-net-chip net">
          <span class="legend-dot netdraw"></span>
          <strong>Net you keep:</strong> ${formatCurrency(net)}
        </span>
        <span class="gross-net-chip tax">
          <span class="legend-dot tax"></span>
          <strong>Tax + clawback drag:</strong> ${formatCurrency(tax)}
        </span>
      </div>
      <p class="small-copy muted">
        Withdrawal required: <strong>${formatCurrency(gross)}</strong> |
        You keep: <strong>${formatCurrency(net)}</strong> |
        Tax + clawback drag: <strong>${formatCurrency(tax)}</strong> |
        Effective rate: <strong>${formatPct(row.effectiveTaxRate || 0)}</strong>
      </p>
      <label class="inline-check small-copy">
        <input type="checkbox" data-bind="uiState.emphasizeTaxes" ${emphasizeTaxes ? "checked" : ""} />
        Emphasize taxes
      </label>
      ${taxPct > 0.25 ? `<span class="status-pill borderline">High tax drag</span>` : ""}
    </article>
  `;
}
