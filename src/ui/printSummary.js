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
  return `
    <section class="print-summary">
      <h1>Canadian Retirement Tax Simulator - Retirement Summary</h1>
      <p><strong>Province:</strong> ${state.profile.province} | <strong>Retirement age:</strong> ${state.profile.retirementAge} | <strong>Life expectancy:</strong> ${state.profile.lifeExpectancy}</p>
      <p><strong>Inflation:</strong> ${formatPct(state.assumptions.inflation)} | <strong>Risk profile:</strong> ${state.assumptions.riskProfile}</p>
      <h2>Core results</h2>
      <ul>
        <li>Coverage at retirement: ${formatPct((rowRet.guaranteedNet || 0) / Math.max(1, rowRet.spending || 1))}</li>
        <li>Spending target: ${formatCurrency(rowRet.spending || 0)}</li>
        <li>Guaranteed income: ${formatCurrency(rowRet.guaranteedGross || 0)}</li>
        <li>Net gap: ${formatCurrency(rowRet.netGap || 0)}</li>
        <li>Gross withdrawal: ${formatCurrency(rowRet.withdrawal || 0)}</li>
        <li>Tax wedge: ${formatCurrency((rowRet.taxOnWithdrawal || 0) + (rowRet.oasClawback || 0))}</li>
        <li>OAS clawback: ${formatCurrency(rowRet.oasClawback || 0)}</li>
        <li>RRIF minimum at 71: ${formatCurrency(row71.rrifMinimum || 0)}</li>
        <li>Depletion age: ${model.kpis.depletionAge ? `Age ${model.kpis.depletionAge}` : "No depletion"}</li>
      </ul>
      <h2>Key years</h2>
      <table>
        <thead><tr><th>Year</th><th>Age</th><th>Spend</th><th>Guaranteed</th><th>Net gap</th><th>Gross</th><th>Tax wedge</th></tr></thead>
        <tbody>
          <tr><td>Retirement</td><td>${rowRet.age}</td><td>${formatCurrency(rowRet.spending || 0)}</td><td>${formatCurrency(rowRet.guaranteedGross || 0)}</td><td>${formatCurrency(rowRet.netGap || 0)}</td><td>${formatCurrency(rowRet.withdrawal || 0)}</td><td>${formatCurrency((rowRet.taxOnWithdrawal || 0) + (rowRet.oasClawback || 0))}</td></tr>
          <tr><td>Age 65</td><td>${row65.age}</td><td>${formatCurrency(row65.spending || 0)}</td><td>${formatCurrency(row65.guaranteedGross || 0)}</td><td>${formatCurrency(row65.netGap || 0)}</td><td>${formatCurrency(row65.withdrawal || 0)}</td><td>${formatCurrency((row65.taxOnWithdrawal || 0) + (row65.oasClawback || 0))}</td></tr>
          <tr><td>Age 71</td><td>${row71.age}</td><td>${formatCurrency(row71.spending || 0)}</td><td>${formatCurrency(row71.guaranteedGross || 0)}</td><td>${formatCurrency(row71.netGap || 0)}</td><td>${formatCurrency(row71.withdrawal || 0)}</td><td>${formatCurrency((row71.taxOnWithdrawal || 0) + (row71.oasClawback || 0))}</td></tr>
        </tbody>
      </table>
      <p><strong>Planning estimate only.</strong> Not tax, legal, or financial advice.</p>
      <p>Methodology: ${methodologyUrl}</p>
    </section>
  `;
}

export function openPrintWindow(summaryHtml) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=980,height=860");
  if (!w) return false;
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
  w.focus();
  w.print();
  return true;
}

