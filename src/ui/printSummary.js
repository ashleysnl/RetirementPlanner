import { getReportMetrics } from "../model/reportMetrics.js";

export function buildSummaryHtml(ctx) {
  const {
    state,
    rowRet,
    row65,
    row71,
    model,
    formatCurrency,
    formatPct,
    methodologyUrl,
  } = ctx;
  const retMetrics = getReportMetrics(state, rowRet);
  const age65Metrics = getReportMetrics(state, row65);
  const age71Metrics = getReportMetrics(state, row71);
  return `
    <section class="print-summary">
      <h1>Canadian Retirement Tax Simulator - Retirement Summary</h1>
      ${
        state.uiState?.clientSummary
          ? `<p><strong>Prepared for:</strong> ${state.uiState.clientSummary.preparedFor || "-"} | <strong>Scenario:</strong> ${state.uiState.clientSummary.scenarioLabel || "Current plan"} | <strong>Prepared by:</strong> ${state.uiState.clientSummary.preparedBy || "-"} | <strong>Date:</strong> ${state.uiState.clientSummary.summaryDate || "-"}</p>`
          : ""
      }
      <p><strong>Province:</strong> ${state.profile.province} | <strong>Retirement age:</strong> ${state.profile.retirementAge} | <strong>Life expectancy:</strong> ${state.profile.lifeExpectancy}</p>
      <p><strong>Inflation:</strong> ${formatPct(state.assumptions.inflation)} | <strong>Risk profile:</strong> ${state.assumptions.riskProfile}</p>
      <p><strong>Basis note:</strong> Annual retirement amounts below are shown in nominal dollars for the specific age/year shown. Your spending input starts in today's dollars and is inflated through the projection.</p>
      <h2>Core results</h2>
      <ul>
        <li>Guaranteed-income coverage at retirement: ${formatPct(retMetrics.coverageRatio)}</li>
        <li>Spending target for retirement year (after-tax, nominal): ${formatCurrency(retMetrics.spending)}</li>
        <li>Guaranteed income for retirement year after estimated tax: ${formatCurrency(retMetrics.guaranteedNet)}</li>
        <li>Guaranteed income for retirement year before tax: ${formatCurrency(retMetrics.guaranteedGross)}</li>
        <li>After-tax gap from savings in retirement year: ${formatCurrency(retMetrics.netGap)}</li>
        <li>Gross RRSP/RRIF withdrawal needed in retirement year: ${formatCurrency(retMetrics.grossWithdrawal)}</li>
        <li>${retMetrics.estimateTaxes ? `Estimated tax + clawback drag: ${formatCurrency(retMetrics.dragAmount)}` : "Tax estimates: Off"}</li>
        <li>Estimated OAS clawback in retirement year: ${formatCurrency(retMetrics.clawback)}</li>
        <li>Mandatory RRIF minimum withdrawal at age 71: ${formatCurrency(row71.rrifMinimum || 0)}</li>
        <li>Depletion age: ${model.kpis.depletionAge ? `Age ${model.kpis.depletionAge}` : "No depletion"}</li>
      </ul>
      <h2>Key years</h2>
      <table>
        <thead><tr><th>Year</th><th>Age</th><th>Spend (after tax, nominal)</th><th>Guaranteed (after tax, nominal)</th><th>Net gap</th><th>Gross withdrawal</th><th>Tax + clawback drag</th></tr></thead>
        <tbody>
          <tr><td>Retirement</td><td>${rowRet.age}</td><td>${formatCurrency(retMetrics.spending)}</td><td>${formatCurrency(retMetrics.guaranteedNet)}</td><td>${formatCurrency(retMetrics.netGap)}</td><td>${formatCurrency(retMetrics.grossWithdrawal)}</td><td>${formatCurrency(retMetrics.dragAmount)}</td></tr>
          <tr><td>Age 65</td><td>${row65.age}</td><td>${formatCurrency(age65Metrics.spending)}</td><td>${formatCurrency(age65Metrics.guaranteedNet)}</td><td>${formatCurrency(age65Metrics.netGap)}</td><td>${formatCurrency(age65Metrics.grossWithdrawal)}</td><td>${formatCurrency(age65Metrics.dragAmount)}</td></tr>
          <tr><td>Age 71</td><td>${row71.age}</td><td>${formatCurrency(age71Metrics.spending)}</td><td>${formatCurrency(age71Metrics.guaranteedNet)}</td><td>${formatCurrency(age71Metrics.netGap)}</td><td>${formatCurrency(age71Metrics.grossWithdrawal)}</td><td>${formatCurrency(age71Metrics.dragAmount)}</td></tr>
        </tbody>
      </table>
      <p><strong>Planning estimate only.</strong> Not tax, legal, or financial advice.</p>
      <p>Methodology: ${methodologyUrl}</p>
    </section>
  `;
}

export function openPrintWindow(summaryHtml) {
  const w = window.open("", "_blank", "width=980,height=860");
  if (!w) return false;
  const printWhenReady = () => {
    try { w.focus(); } catch {}
    try { w.print(); } catch {}
  };
  w.document.open();
  w.document.write(`
    <html><head><title>Retirement Summary</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#132033}
        h1,h2{margin:0 0 10px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #dbe5f2;padding:6px;font-size:12px;text-align:left}
        ul{margin-top:0}
      </style>
    </head><body>${summaryHtml}</body></html>
  `);
  w.document.close();
  if (typeof w.addEventListener === "function") {
    w.addEventListener("load", () => setTimeout(printWhenReady, 120), { once: true });
  }
  setTimeout(printWhenReady, 220);
  return true;
}
