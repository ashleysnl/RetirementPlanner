export function renderRetirementGapHeadline(ctx) {
  const {
    mountEl,
    row,
    model,
    selectedAge,
    minAge,
    maxAge,
    tooltipButton,
    formatCurrency,
    formatPct,
  } = ctx;
  if (!mountEl || !row) return;

  const spending = Math.max(0, Number(row.spending || 0));
  const guaranteed = Math.max(0, Number(row.guaranteedGross || 0));
  const netGap = Math.max(0, Number(row.netGap || 0));
  const gross = Math.max(0, Number(row.withdrawal || 0));
  const taxWedge = Math.max(0, Number((row.taxOnWithdrawal || 0) + (row.oasClawback || 0)));
  const coverage = spending > 0 ? guaranteed / spending : 1;
  const surplus = guaranteed >= spending;
  const depletionAge = model?.kpis?.depletionAge;
  const highTaxDrag = gross > 0 ? (taxWedge / gross) > 0.25 : false;

  mountEl.innerHTML = `
    <article class="subsection gap-headline">
      <div class="results-strip-head">
        <h3>Retirement Gap ${tooltipButton("kpiNetGap")}</h3>
        <div class="results-strip-controls">
          <label for="gapAgePicker" class="small-copy">Pick age</label>
          <input id="gapAgePicker" type="range" min="${minAge}" max="${maxAge}" step="1" value="${selectedAge}" aria-label="Retirement gap age selector" />
          <strong>Age ${selectedAge}</strong>
        </div>
      </div>
      <p><strong>Your guaranteed income covers ${formatPct(coverage)}</strong> of your retirement spending.</p>
      ${surplus
        ? `<p class="status-good">You are covered. Surplus: <strong>${formatCurrency(guaranteed - spending)}</strong>.</p>`
        : `<p>You need <strong>${formatCurrency(netGap)}/yr</strong> from savings (after tax). Because withdrawals are taxable, you must withdraw about <strong>${formatCurrency(gross)}/yr</strong>.</p>`
      }
      <p class="small-copy muted">
        Spend ${tooltipButton("kpiSpendingTarget")} ${formatCurrency(spending)} |
        Guaranteed ${tooltipButton("kpiGuaranteedIncome")} ${formatCurrency(guaranteed)} |
        Net gap ${tooltipButton("kpiNetGap")} ${formatCurrency(netGap)} |
        Gross draw ${tooltipButton("kpiGrossWithdrawal")} ${formatCurrency(gross)} |
        Tax wedge ${tooltipButton("learnTaxGrossUp")} ${formatCurrency(taxWedge)}
      </p>
      ${highTaxDrag ? `<span class="status-pill borderline">High tax drag this year</span>` : ""}
      ${depletionAge ? `<span class="status-pill off-track">Savings run out at age ${depletionAge}</span>` : ""}
    </article>
  `;
}

