import { getReportMetrics } from "../model/reportMetrics.js";

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

  const metrics = getReportMetrics(ctx.plan, row);
  const spending = metrics.spending;
  const guaranteed = metrics.guaranteedNet;
  const netGap = metrics.netGap;
  const gross = metrics.grossWithdrawal;
  const taxWedge = metrics.dragAmount;
  const coverage = metrics.coverageRatio;
  const surplus = metrics.surplus > 0;
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
      <p><strong>Your guaranteed income ${tooltipButton("kpiCoveragePercent")} covers ${formatPct(coverage)}</strong> of your retirement spending.</p>
      ${surplus
        ? `<p class="status-good">You are covered. Surplus: <strong>${formatCurrency(metrics.surplus)}</strong>.</p>`
        : metrics.estimateTaxes
          ? `<p>You need <strong>${formatCurrency(netGap)}/yr</strong> from savings (after tax). Because withdrawals are taxable, you must withdraw about <strong>${formatCurrency(gross)}/yr</strong>.</p>`
          : `<p>You need <strong>${formatCurrency(netGap)}/yr</strong> from savings. With tax estimates off, the gross withdrawal shown is not tax-adjusted.</p>`
      }
      <p class="small-copy muted">
        Spend ${tooltipButton("kpiSpendingTarget")} ${formatCurrency(spending)} |
        Guaranteed after tax ${tooltipButton("kpiGuaranteedIncome")} ${formatCurrency(guaranteed)} |
        Net gap ${tooltipButton("kpiNetGap")} ${formatCurrency(netGap)} |
        Gross draw ${tooltipButton("kpiGrossWithdrawal")} ${formatCurrency(gross)} |
        ${metrics.estimateTaxes ? `Tax + clawback drag ${tooltipButton("taxDrag")} ${formatCurrency(taxWedge)}` : `Tax estimates off`}
      </p>
      ${highTaxDrag ? `<span class="status-pill borderline">High tax drag this year</span>` : ""}
      ${depletionAge ? `<span class="status-pill off-track">Savings run out at age ${depletionAge}</span>` : ""}
    </article>
  `;
}
