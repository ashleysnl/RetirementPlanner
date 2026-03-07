import { getReportMetrics } from "../model/reportMetrics.js";

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

  const metrics = getReportMetrics(ctx.plan, row);
  const guaranteed = metrics.guaranteedNet;
  const spending = metrics.spending;
  const gross = metrics.grossWithdrawal;
  const taxWedge = metrics.dragAmount;
  const coverage = metrics.coverageRatio;
  const surplus = metrics.surplus > 0;
  const depletionAge = model?.kpis?.depletionAge;

  const sentence = surplus
    ? `At age ${age}, you are fully covered. Surplus: ${formatCurrency(metrics.surplus)}/yr.`
    : metrics.estimateTaxes
      ? `At age ${age}, your guaranteed income covers ${formatPct(coverage)} of retirement spending. You need about ${formatCurrency(gross)}/yr from RRSP/RRIF, and about ${formatCurrency(taxWedge)}/yr goes to estimated tax and clawback.`
      : `At age ${age}, your guaranteed income covers ${formatPct(coverage)} of retirement spending. You need about ${formatCurrency(gross)}/yr from RRSP/RRIF with tax estimates turned off.`;

  mountEl.innerHTML = `
    <article class="subsection insight-banner insight-verdict">
      <h3>Retirement Insight</h3>
      <p class="insight-line"><strong>${sentence}</strong></p>
      <p class="small-copy muted insight-terms">
        Guaranteed income ${tooltipButton("kpiGuaranteedIncome")} |
        Coverage % ${tooltipButton("kpiCoveragePercent")} |
        Gross withdrawal ${tooltipButton("kpiGrossWithdrawal")} |
        Tax drag ${tooltipButton("taxDrag")} |
        <button class="text-link-btn" type="button" data-action="open-methodology">Methodology</button>
      </p>
      ${depletionAge ? `<span class="status-pill off-track">Savings run out around age ${depletionAge}</span>` : ""}
    </article>
  `;
}
