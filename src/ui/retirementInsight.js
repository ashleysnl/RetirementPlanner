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
    ? `You are covered - surplus ${formatCurrency(guaranteed - spending)}/yr at age ${age}.`
    : `At age ${age}, guaranteed income covers ${formatPct(coverage)} of spending. You will need about ${formatCurrency(gross)}/yr from RRSP/RRIF, and about ${formatCurrency(taxWedge)}/yr goes to tax.`;

  mountEl.innerHTML = `
    <article class="subsection insight-banner">
      <p>
        <strong>${sentence}</strong>
        ${depletionAge ? `<span class="insight-warning">Savings run out around age ${depletionAge}.</span>` : ""}
      </p>
      <p class="small-copy muted">
        Guaranteed income ${tooltipButton("kpiGuaranteedIncome")} |
        Coverage ${tooltipButton("kpiGuaranteedIncome")} |
        Gross withdrawal ${tooltipButton("kpiGrossWithdrawal")} |
        Tax wedge ${tooltipButton("learnTaxGrossUp")}
      </p>
    </article>
  `;
}

