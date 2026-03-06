function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function phaseTitle(key) {
  if (key === "early") return "Early retirement";
  if (key === "benefits") return "CPP + OAS phase";
  return "RRIF minimum phase";
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function fmtListItems(items) {
  return items.map((item) => `<li>${esc(item)}</li>`).join("");
}

export function buildClientSummaryHtml(ctx) {
  const {
    state,
    summary,
    risks,
    strategySuggestions,
    formatCurrency,
    formatPct,
    methodologyUrl,
    chartImages,
  } = ctx;

  const row = summary.selected;
  const m = summary.metrics;
  const prefs = state.uiState.clientSummary || {};
  const dateValue = prefs.summaryDate || new Date().toISOString().slice(0, 10);
  const spouse = state.income?.spouse || {};
  const injects = Array.isArray(state.savings?.capitalInjects)
    ? state.savings.capitalInjects.filter((x) => x && x.enabled)
    : [];
  const detailedInputs = {
    profile: [
      `Province: ${state.profile.province}`,
      `Year of birth: ${state.profile.birthYear}`,
      `Retirement age: ${state.profile.retirementAge}`,
      `Life expectancy: ${state.profile.lifeExpectancy}`,
      `After-tax spending target (today's dollars): ${formatCurrency(state.profile.desiredSpending)}`,
      `Has spouse plan: ${yesNo(state.profile.hasSpouse)}`,
    ],
    assumptions: [
      `Inflation: ${formatPct(state.assumptions.inflation)}`,
      `Risk profile: ${state.assumptions.riskProfile}`,
      `Conservative return: ${formatPct(state.assumptions.returns.conservative)}`,
      `Balanced return: ${formatPct(state.assumptions.returns.balanced)}`,
      `Aggressive return: ${formatPct(state.assumptions.returns.aggressive)}`,
      `Scenario spread: ${formatPct(state.assumptions.scenarioSpread)}`,
      `Tax brackets indexed with inflation: ${yesNo(state.assumptions.indexTaxBrackets)}`,
    ],
    savings: [
      `Current savings: ${formatCurrency(state.savings.currentTotal)}`,
      `Annual contribution: ${formatCurrency(state.savings.annualContribution)}`,
      `Contribution increase YoY: ${formatPct(state.savings.contributionIncrease || 0)}`,
      `Capital injections: ${injects.length ? injects.map((x) => `${x.label || "Lump sum"} ${formatCurrency(x.amount)} at age ${x.age}`).join("; ") : "None"}`,
    ],
    income: [
      `Private pension enabled: ${yesNo(state.income.pension.enabled)}`,
      `Private pension amount: ${formatCurrency(state.income.pension.amount)}`,
      `Private pension start age: ${state.income.pension.startAge}`,
      `CPP amount at 65: ${formatCurrency(state.income.cpp.amountAt65)}`,
      `CPP start age: ${state.income.cpp.startAge}`,
      `OAS amount at 65: ${formatCurrency(state.income.oas.amountAt65)}`,
      `OAS start age: ${state.income.oas.startAge}`,
      `Spousal income enabled: ${yesNo(spouse.enabled)}`,
      `Spouse pension amount / start age: ${formatCurrency(spouse.pensionAmount || 0)} / ${spouse.pensionStartAge || "-"}`,
      `Spouse CPP amount / start age: ${formatCurrency(spouse.cppAmountAt65 || 0)} / ${spouse.cppStartAge || "-"}`,
      `Spouse OAS amount / start age: ${formatCurrency(spouse.oasAmountAt65 || 0)} / ${spouse.oasStartAge || "-"}`,
    ],
    accounts: [
      `RRSP/RRIF: ${formatCurrency(state.accounts.rrsp)}`,
      `TFSA: ${formatCurrency(state.accounts.tfsa)}`,
      `Non-registered: ${formatCurrency(state.accounts.nonRegistered)}`,
      `Cash: ${formatCurrency(state.accounts.cash)}`,
    ],
    strategy: [
      `Withdrawal strategy: ${state.strategy.withdrawal}`,
      `Estimate taxes: ${yesNo(state.strategy.estimateTaxes)}`,
      `OAS clawback modeling: ${yesNo(state.strategy.oasClawbackModeling)}`,
      `Apply RRIF minimums: ${yesNo(state.strategy.applyRrifMinimums)}`,
      `RRIF conversion age: ${state.strategy.rrifConversionAge}`,
      `RRSP meltdown enabled: ${yesNo(state.strategy.meltdownEnabled)}`,
      `Meltdown amount per year: ${formatCurrency(state.strategy.meltdownAmount || 0)}`,
      `Meltdown age range: ${state.strategy.meltdownStartAge || "-"} to ${state.strategy.meltdownEndAge || "-"}`,
      `Meltdown taxable income ceiling: ${formatCurrency(state.strategy.meltdownIncomeCeiling || 0)}`,
    ],
  };

  return `
    <section class="print-summary client-summary-print">
      <h1>Canadian Retirement Tax Simulator - Client Summary</h1>
      <p><strong>Prepared for:</strong> ${esc(prefs.preparedFor || "-")} | <strong>Scenario:</strong> ${esc(prefs.scenarioLabel || "Current plan")}</p>
      <p><strong>Prepared by:</strong> ${esc(prefs.preparedBy || "-")} | <strong>Date:</strong> ${esc(dateValue)}</p>

      <h2>Retirement Readiness Snapshot (Age ${row.age})</h2>
      <ul>
        <li>Coverage: ${formatPct(m.coverageRatio)}</li>
        <li>Guaranteed income: ${formatCurrency(m.guaranteed)}</li>
        <li>Savings withdrawals needed (gross): ${formatCurrency(m.grossWithdrawal)}</li>
        <li>Estimated taxes (tax wedge): ${formatCurrency(m.taxWedge)}</li>
        <li>Net spending available: ${formatCurrency(m.netSpendingAvailable)}</li>
      </ul>
      ${chartImages?.projection
        ? `<figure class="print-chart"><img src="${chartImages.projection}" alt="Projection chart" /><figcaption>Projection chart (from current client summary view)</figcaption></figure>`
        : ""
      }

      <h2>Income Timeline</h2>
      <ul>
        ${(summary.phases || []).map((phase) => {
          const range = Number(phase.startAge) === Number(phase.endAge)
            ? `Age ${phase.startAge}`
            : `Age ${phase.startAge}-${phase.endAge}`;
          return `<li><strong>${phaseTitle(phase.key)} (${range})</strong>: ${esc(phase.why || "")}</li>`;
        }).join("")}
      </ul>
      ${chartImages?.incomeMap
        ? `<figure class="print-chart"><img src="${chartImages.incomeMap}" alt="Retirement income map chart" /><figcaption>Retirement income map (from current client summary view)</figcaption></figure>`
        : ""
      }

      <h2>Key Risks</h2>
      <ul>
        ${(risks || []).slice(0, 5).map((risk) => `<li><strong>${esc(risk.title)} (${esc(risk.severity)})</strong>: ${esc(risk.detail)}</li>`).join("")}
      </ul>

      <h2>Strategy Suggestions</h2>
      <ul>
        ${(strategySuggestions || []).map((s) => `<li><strong>${esc(s.title)}</strong>: ${esc(s.desc)}</li>`).join("")}
      </ul>

      <h2>Detailed Plan Inputs</h2>
      <h3>Profile</h3>
      <ul>${fmtListItems(detailedInputs.profile)}</ul>
      <h3>Assumptions</h3>
      <ul>${fmtListItems(detailedInputs.assumptions)}</ul>
      <h3>Savings</h3>
      <ul>${fmtListItems(detailedInputs.savings)}</ul>
      <h3>Income Sources</h3>
      <ul>${fmtListItems(detailedInputs.income)}</ul>
      <h3>Accounts</h3>
      <ul>${fmtListItems(detailedInputs.accounts)}</ul>
      <h3>Strategy Settings</h3>
      <ul>${fmtListItems(detailedInputs.strategy)}</ul>

      <p><strong>Planning estimate only.</strong> Not tax, legal, or financial advice.</p>
      <p>Methodology: ${esc(methodologyUrl)}</p>
    </section>
  `;
}

export function openClientSummaryPrintWindow(summaryHtml) {
  const w = window.open("", "_blank", "width=980,height=860");
  if (!w) return false;
  const printWhenReady = () => {
    try { w.focus(); } catch {}
    try { w.print(); } catch {}
  };
  w.document.open();
  w.document.write(`
    <html><head><title>Client Summary</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#132033}
        h1,h2{margin:0 0 10px}
        ul{margin:0 0 14px;padding-left:18px}
        li{margin:0 0 6px}
        .print-chart{margin:10px 0 16px}
        .print-chart img{display:block;max-width:100%;height:auto;border:1px solid #dbe5f2;border-radius:8px}
        .print-chart figcaption{font-size:11px;color:#5f6b7d;margin-top:4px}
        @media print { body{color:#000;background:#fff} }
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
