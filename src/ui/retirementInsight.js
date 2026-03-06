export function renderRetirementInsight(ctx) {
  const {
    mountEl,
    row,
    model,
    age,
    tooltipButton,
    formatCurrency,
    formatPct,
  } = ctx;
  if (!mountEl || !row) return;

  const guaranteed = Math.max(0, Number(row.guaranteedGross || 0));
  const spending = Math.max(0, Number(row.spending || 0));
  const gross = Math.max(0, Number(row.withdrawal || 0));
  const taxWedge = Math.max(0, Number((row.taxOnWithdrawal || 0) + (row.oasClawback || 0)));
  const coverage = spending > 0 ? guaranteed / spending : 1;
  const surplus = guaranteed >= spending;
  const depletionAge = model?.kpis?.depletionAge;

  const sentence = surplus
    ? `At age ${age}, you are fully covered. Surplus: ${formatCurrency(guaranteed - spending)}/yr.`
    : `At age ${age}, your guaranteed income covers ${formatPct(coverage)} of retirement spending. You need about ${formatCurrency(gross)}/yr from RRSP/RRIF, and about ${formatCurrency(taxWedge)}/yr goes to tax.`;

  mountEl.innerHTML = `
    <article class="subsection insight-banner insight-verdict">
      <h3>Retirement Insight</h3>
      <p class="insight-line"><strong>${sentence}</strong></p>
      <p class="small-copy muted insight-terms">
        Guaranteed income ${tooltipButton("kpiGuaranteedIncome")} |
        Coverage % ${tooltipButton("kpiGuaranteedIncome")} |
        Gross withdrawal ${tooltipButton("kpiGrossWithdrawal")} |
        Tax wedge ${tooltipButton("learnTaxGrossUp")} |
        <button class="text-link-btn" type="button" data-action="open-methodology">Methodology</button>
      </p>
      ${depletionAge ? `<span class="status-pill off-track">Savings run out around age ${depletionAge}</span>` : ""}
    </article>
  `;
}
