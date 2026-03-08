import { getReportMetrics } from "../model/reportMetrics.js";
import { buildPlanStatus } from "../model/planStatus.js";
import { buildRiskDiagnostics } from "../model/risks.js";

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function fmtListItems(items) {
  return items.map((item) => `<li>${esc(item)}</li>`).join("");
}

function renderLegend(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `
    <div class="print-legend">
      ${items.map((item) => `
        <span class="print-legend-item">
          <span class="print-legend-swatch" style="background:${item.color};"></span>
          ${esc(item.label)}
        </span>
      `).join("")}
    </div>
  `;
}

function qrCodeUrl(value, size = 132) {
  const url = String(value || "").trim();
  if (!url) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

function bandClass(band) {
  if (band === "Very Strong" || band === "Strong") return "good";
  if (band === "Moderate") return "medium";
  return "warn";
}

function severityClass(severity) {
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

function buildSnapshotCards({ score, retMetrics, model, formatCurrency, formatPct }) {
  const depletionAge = model.kpis.depletionAge ? `Age ${model.kpis.depletionAge}` : "Beyond plan";
  const taxDragText = retMetrics.estimateTaxes
    ? `${formatCurrency(retMetrics.dragAmount)} (${formatPct(retMetrics.effectiveTaxRate)})`
    : "Tax estimates off";
  return [
    { label: "How much of your target income is covered", value: formatPct(retMetrics.coverageRatio), sub: "Guaranteed income coverage" },
    { label: "Savings projected to last", value: depletionAge, sub: "Longevity buffer" },
    { label: "Tax efficiency", value: taxDragText, sub: "Estimated tax drag" },
    { label: "Overall readiness", value: `${score.total}/100`, sub: score.band },
  ];
}

function buildMeaningSummary({ planStatus, retMetrics, rowRet, formatCurrency, formatPct }) {
  const statements = [];
  statements.push(`Guaranteed income covers ${formatPct(retMetrics.coverageRatio)} of your retirement-year spending target.`);
  if (retMetrics.netGap > 0) {
    statements.push(`Savings act as a top-up: about ${formatCurrency(retMetrics.grossWithdrawal)} of gross RRSP/RRIF withdrawals are needed in the retirement year.`);
  } else {
    statements.push(`Guaranteed income appears sufficient for the retirement-year target without required savings withdrawals.`);
  }
  if (rowRet.rrifMinimum > 0) {
    statements.push(`Later retirement years should still be watched because RRIF minimums can force taxable withdrawals.`);
  } else {
    statements.push(`The plan appears broadly workable under the current assumptions, but later taxes and withdrawals still matter.`);
  }
  if (planStatus.status === "Shortfall Likely" || planStatus.status === "Tight / Needs Review") {
    statements[2] = `The plan may need adjustment because longevity, withdrawal pressure, or tax drag reduce flexibility.`;
  }
  return statements;
}

function buildRecommendedMoves({ planStatus, risks }) {
  const moves = [];
  if (planStatus?.nextBestAction) {
    moves.push({
      title: planStatus.nextBestAction.label,
      detail: planStatus.nextBestAction.detail || "This is the clearest next test based on the current plan output.",
    });
  }
  for (const risk of risks || []) {
    if (moves.length >= 4) break;
    const exists = moves.some((item) => item.title === risk.actionLabel);
    if (risk.actionLabel && !exists) {
      moves.push({
        title: risk.actionLabel,
        detail: risk.detail,
      });
    }
  }
  if (moves.length < 4) {
    const fallback = [
      { title: "Compare another retirement age", detail: "A small age change often improves both coverage and longevity." },
      { title: "Test lower retirement spending", detail: "A spending sensitivity test quickly shows how much margin exists in the plan." },
      { title: "Review CPP timing", detail: "CPP timing changes both guaranteed income and later withdrawal pressure." },
      { title: "Open the full planner online", detail: "The interactive planner lets you test assumptions, scenarios, and strategies." },
    ];
    for (const item of fallback) {
      if (moves.length >= 4) break;
      if (!moves.some((existing) => existing.title === item.title)) moves.push(item);
    }
  }
  return moves.slice(0, 4);
}

function buildInputSets(state, formatCurrency, formatPct) {
  const spouse = state.income?.spouse || {};
  const injects = Array.isArray(state.savings?.capitalInjects)
    ? state.savings.capitalInjects.filter((x) => x && x.enabled)
    : [];
  return {
    summary: [
      `Province: ${state.profile.province}`,
      `Birth year: ${state.profile.birthYear}`,
      `Retirement age: ${state.profile.retirementAge}`,
      `Life expectancy: ${state.profile.lifeExpectancy}`,
      `Spending target (today's dollars): ${formatCurrency(state.profile.desiredSpending)}`,
      `Inflation: ${formatPct(state.assumptions.inflation)}`,
      `Risk profile: ${state.assumptions.riskProfile}`,
      `Current savings: ${formatCurrency(state.savings.currentTotal)}`,
      `Annual contribution: ${formatCurrency(state.savings.annualContribution)}`,
      `Private pension: ${state.income.pension.enabled ? `${formatCurrency(state.income.pension.amount)} from age ${state.income.pension.startAge}` : "Not modeled"}`,
      `CPP: ${formatCurrency(state.income.cpp.amountAt65)} from age ${state.income.cpp.startAge}`,
      `OAS: ${formatCurrency(state.income.oas.amountAt65)} from age ${state.income.oas.startAge}`,
      `Withdrawal strategy: ${state.strategy.withdrawal}`,
    ],
    appendix: {
      Profile: [
        `Province: ${state.profile.province}`,
        `Year of birth: ${state.profile.birthYear}`,
        `Retirement age: ${state.profile.retirementAge}`,
        `Life expectancy: ${state.profile.lifeExpectancy}`,
        `Desired retirement spending (today's dollars): ${formatCurrency(state.profile.desiredSpending)}`,
        `Spouse planning enabled: ${yesNo(state.profile.hasSpouse)}`,
      ],
      Assumptions: [
        `Inflation: ${formatPct(state.assumptions.inflation)}`,
        `Risk profile: ${state.assumptions.riskProfile}`,
        `Conservative return: ${formatPct(state.assumptions.returns.conservative)}`,
        `Balanced return: ${formatPct(state.assumptions.returns.balanced)}`,
        `Aggressive return: ${formatPct(state.assumptions.returns.aggressive)}`,
        `Scenario spread: ${formatPct(state.assumptions.scenarioSpread)}`,
        `Index tax brackets with inflation: ${yesNo(state.assumptions.taxBracketInflation)}`,
      ],
      Savings: [
        `Current savings: ${formatCurrency(state.savings.currentTotal)}`,
        `Annual contribution: ${formatCurrency(state.savings.annualContribution)}`,
        `Contribution increase YoY: ${formatPct(state.savings.contributionIncrease || 0)}`,
        `Capital injections: ${injects.length ? injects.map((x) => `${x.label || "Lump sum"} ${formatCurrency(x.amount)} at age ${x.age}`).join("; ") : "None"}`,
      ],
      Income: [
        `Private pension enabled: ${yesNo(state.income.pension.enabled)}`,
        `Private pension amount / start age: ${formatCurrency(state.income.pension.amount)} / ${state.income.pension.startAge}`,
        `CPP amount at 65 / start age: ${formatCurrency(state.income.cpp.amountAt65)} / ${state.income.cpp.startAge}`,
        `OAS amount at 65 / start age: ${formatCurrency(state.income.oas.amountAt65)} / ${state.income.oas.startAge}`,
        `Spousal income enabled: ${yesNo(spouse.enabled)}`,
        `Spouse pension amount / start age: ${formatCurrency(spouse.pensionAmount || 0)} / ${spouse.pensionStartAge || "-"}`,
        `Spouse CPP amount / start age: ${formatCurrency(spouse.cppAmountAt65 || 0)} / ${spouse.cppStartAge || "-"}`,
        `Spouse OAS amount / start age: ${formatCurrency(spouse.oasAmountAt65 || 0)} / ${spouse.oasStartAge || "-"}`,
      ],
      Accounts: [
        `RRSP/RRIF: ${formatCurrency(state.accounts.rrsp)}`,
        `TFSA: ${formatCurrency(state.accounts.tfsa)}`,
        `Non-registered: ${formatCurrency(state.accounts.nonRegistered)}`,
        `Cash: ${formatCurrency(state.accounts.cash)}`,
      ],
      Strategy: [
        `Withdrawal strategy: ${state.strategy.withdrawal}`,
        `Estimate taxes: ${yesNo(state.strategy.estimateTaxes !== false)}`,
        `OAS clawback modeling: ${yesNo(state.strategy.oasClawbackModeling)}`,
        `Apply RRIF minimums: ${yesNo(state.strategy.applyRrifMinimums)}`,
        `RRIF conversion age: ${state.strategy.rrifConversionAge}`,
        `RRSP meltdown enabled: ${yesNo(state.strategy.meltdownEnabled)}`,
        `RRSP meltdown amount: ${formatCurrency(state.strategy.meltdownAmount || 0)}`,
        `RRSP meltdown range: ${state.strategy.meltdownStartAge || "-"} to ${state.strategy.meltdownEndAge || "-"}`,
        `RRSP meltdown income ceiling: ${formatCurrency(state.strategy.meltdownIncomeCeiling || 0)}`,
      ],
    },
  };
}

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
    toolUrl,
    supportUrl,
    chartImages,
    projectionLegend,
    coverageLegend,
  } = ctx;

  const planStatus = buildPlanStatus(state, model);
  const risks = buildRiskDiagnostics(state, model, state.profile.retirementAge);
  const retMetrics = getReportMetrics(state, rowRet);
  const age65Metrics = getReportMetrics(state, row65);
  const age71Metrics = getReportMetrics(state, row71);
  const snapshot = buildSnapshotCards({ score: planStatus.score, retMetrics, model, formatCurrency, formatPct });
  const meaning = buildMeaningSummary({ planStatus, retMetrics, rowRet, formatCurrency, formatPct });
  const moves = buildRecommendedMoves({ planStatus, risks });
  const inputs = buildInputSets(state, formatCurrency, formatPct);
  const prefs = state.uiState?.clientSummary || {};
  const plannerHref = esc(toolUrl || "https://retirement.simplekit.app");
  const supportHref = esc(supportUrl || "https://buymeacoffee.com/ashleysnl");
  const plannerQr = qrCodeUrl(toolUrl || "https://retirement.simplekit.app");
  const supportQr = qrCodeUrl(supportUrl || "https://buymeacoffee.com/ashleysnl");

  return `
    <section class="print-summary report-shell">
      <section class="report-page report-cover">
        <div class="report-header">
          <div>
            <p class="report-kicker">SimpleKit Retirement Planner</p>
            <h1>Canadian Retirement Planning Summary</h1>
            <p class="report-subtitle">A planning-level retirement summary based on your current assumptions, taxes, government benefits, and withdrawal strategy.</p>
          </div>
          <div class="report-meta-card">
            <div><span>Prepared date</span><strong>${esc(prefs.summaryDate || new Date().toISOString().slice(0, 10))}</strong></div>
            <div><span>Scenario</span><strong>${esc(prefs.scenarioLabel || "Current plan")}</strong></div>
            <div><span>Prepared for</span><strong>${esc(prefs.preparedFor || "-")}</strong></div>
          </div>
        </div>

        <div class="report-hero-card ${bandClass(planStatus.score.band)}">
          <div>
            <p class="report-label">Retirement status</p>
            <h2>${esc(planStatus.status)}</h2>
            <p>${esc(planStatus.summary)}</p>
          </div>
          <div class="report-score">
            <strong>${planStatus.score.total}</strong>
            <span>${esc(planStatus.score.band)}</span>
          </div>
        </div>

        <div class="report-scorecard-grid">
          ${snapshot.map((item) => `
            <article class="report-metric-card">
              <span class="report-metric-label">${esc(item.label)}</span>
              <strong>${esc(item.value)}</strong>
              <span class="report-metric-sub">${esc(item.sub)}</span>
            </article>
          `).join("")}
        </div>

        <div class="report-grid-two">
          <section class="report-panel">
            <h3>What this means</h3>
            <ul class="report-clean-list">
              ${meaning.map((line) => `<li>${esc(line)}</li>`).join("")}
            </ul>
          </section>
          <section class="report-panel">
            <h3>Retirement score snapshot</h3>
            <div class="report-mini-score-grid">
              <div><span>Coverage</span><strong>${planStatus.score.subs.coverage}/35</strong></div>
              <div><span>Longevity</span><strong>${planStatus.score.subs.longevity}/30</strong></div>
              <div><span>Tax efficiency</span><strong>${planStatus.score.subs.taxDrag}/15</strong></div>
              <div><span>Clawback</span><strong>${planStatus.score.subs.clawback}/10</strong></div>
              <div><span>RRIF shock</span><strong>${planStatus.score.subs.rrifShock}/10</strong></div>
            </div>
            <p class="report-footnote">This score is a planning heuristic, not a guarantee. It summarizes coverage, longevity, tax drag, clawback pressure, and RRIF shock under the current assumptions.</p>
          </section>
        </div>

        <section class="report-cta-band">
          <div class="report-cta-copy">
            <h3>Where to click next</h3>
            <p>Use the interactive planner to test retirement age, CPP timing, spending, inflation, and withdrawal strategy. If this report helped, you can also support future improvements.</p>
          </div>
          <div class="report-cta-grid">
            <a class="report-cta-card primary" href="${plannerHref}" target="_blank" rel="noopener noreferrer">
              <span>Open the Interactive Calculator</span>
              <strong>${plannerHref}</strong>
            </a>
            <a class="report-cta-card" href="${supportHref}" target="_blank" rel="noopener noreferrer">
              <span>Support this Free Tool</span>
              <strong>buymeacoffee.com/ashleysnl</strong>
            </a>
          </div>
          <div class="report-qr-row">
            ${plannerQr ? `<figure class="report-qr-card"><img class="print-qr" src="${plannerQr}" alt="QR code linking to the calculator" /><figcaption>Calculator</figcaption></figure>` : ""}
            ${supportQr ? `<figure class="report-qr-card"><img class="print-qr" src="${supportQr}" alt="QR code linking to Buy Me a Coffee" /><figcaption>☕ Support</figcaption></figure>` : ""}
          </div>
        </section>
      </section>

      <section class="report-page">
        <section class="report-panel">
          <h2>Portfolio Projection</h2>
          <p class="report-intro">This chart shows how savings are expected to build and then be drawn down over time under the current assumptions. Use it to spot whether the portfolio appears durable and when major retirement phases begin.</p>
          ${chartImages?.projection
            ? `<figure class="print-chart"><img src="${chartImages.projection}" alt="Projection chart" /><figcaption>Projection from today's age through the full planning horizon. Milestones to watch: retirement age ${state.profile.retirementAge}, age 65 for government benefits, and age ${state.strategy.rrifConversionAge || 71} for RRIF conversion.</figcaption>${renderLegend(projectionLegend)}</figure>`
            : "<p class=\"report-footnote\">Projection chart was unavailable in this export.</p>"
          }
        </section>

        <section class="report-panel">
          <h2>Income Timeline / Income Map</h2>
          <p class="report-intro">The stacked bars show where retirement cash flow comes from each year. Pension, CPP, and OAS form the income floor. RRSP/RRIF withdrawals fill the remaining gap. The tax wedge shows the part of gross withdrawals that goes to tax instead of spending.</p>
          ${chartImages?.coverage
            ? `<figure class="print-chart"><img src="${chartImages.coverage}" alt="Income coverage chart" /><figcaption>The spending line is your after-tax target. The tax wedge helps explain why gross RRSP/RRIF withdrawals can exceed the net spending gap.</figcaption>${renderLegend(coverageLegend)}</figure>`
            : "<p class=\"report-footnote\">Income map chart was unavailable in this export.</p>"
          }
          <div class="report-grid-two compact">
            <div class="report-callout">
              <span class="report-callout-label">Retirement start</span>
              <strong>Age ${rowRet.age}</strong>
              <p>Spending target: ${formatCurrency(retMetrics.spending)} | Guaranteed income after estimated tax: ${formatCurrency(retMetrics.guaranteedNet)}</p>
            </div>
            <div class="report-callout">
              <span class="report-callout-label">Age 65</span>
              <strong>Government benefits phase</strong>
              <p>Guaranteed income after estimated tax: ${formatCurrency(age65Metrics.guaranteedNet)} | Gross withdrawal: ${formatCurrency(age65Metrics.grossWithdrawal)}</p>
            </div>
            <div class="report-callout">
              <span class="report-callout-label">Age ${row71.age}</span>
              <strong>RRIF minimum phase</strong>
              <p>Mandatory RRIF minimum: ${formatCurrency(row71.rrifMinimum || 0)} | Tax drag: ${formatCurrency(age71Metrics.dragAmount)}</p>
            </div>
          </div>
        </section>
      </section>

      <section class="report-page">
        <section class="report-panel">
          <h2>Retirement Watchlist</h2>
          <div class="report-watchlist">
            ${(risks || []).slice(0, 5).map((risk) => `
              <article class="report-watch-card ${severityClass(risk.severity)}">
                <div class="report-watch-head">
                  <h3>${esc(risk.title)}</h3>
                  <span class="report-severity">${esc(risk.severity)}</span>
                </div>
                <p>${esc(risk.detail)}</p>
                <p class="report-footnote">Why it matters: ${esc(risk.actionLabel || "This is worth stress-testing in the interactive planner.")}</p>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="report-panel">
          <h2>Recommended Next Moves</h2>
          <div class="report-actions">
            ${moves.map((move, index) => `
              <article class="report-action-card">
                <span class="report-action-step">${index + 1}</span>
                <div>
                  <h3>${esc(move.title)}</h3>
                  <p>${esc(move.detail)}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="report-cta-band report-cta-band-secondary">
          <div class="report-cta-copy">
            <h3>Test another scenario online</h3>
            <p>Change retirement age, savings, inflation, pension income, and withdrawal strategy in the interactive planner to see how the outcome changes.</p>
          </div>
          <div class="report-cta-grid">
            <a class="report-cta-card primary" href="${plannerHref}" target="_blank" rel="noopener noreferrer">
              <span>Explore Your Plan Online</span>
              <strong>retirement.simplekit.app</strong>
            </a>
            <a class="report-cta-card" href="${supportHref}" target="_blank" rel="noopener noreferrer">
              <span>Found this helpful?</span>
              <strong>Buy me a coffee</strong>
            </a>
          </div>
        </section>
      </section>

      <section class="report-page">
        <section class="report-panel">
          <h2>Plan Inputs Summary</h2>
          <div class="report-summary-grid">
            ${inputs.summary.map((item) => `<div class="report-summary-item">${esc(item)}</div>`).join("")}
          </div>
          <p class="report-footnote">Annual retirement outputs in this report are shown in nominal dollars for the age/year shown. Spending starts as today's dollars in the planner and is inflated through the projection.</p>
        </section>

        <section class="report-panel">
          <h2>Appendix: Detailed Inputs</h2>
          <div class="report-appendix-grid">
            ${Object.entries(inputs.appendix).map(([title, items]) => `
              <article class="report-appendix-card">
                <h3>${esc(title)}</h3>
                <ul class="report-clean-list">${fmtListItems(items)}</ul>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="report-footer-panel">
          <div>
            <h3>Disclaimer</h3>
            <p>This is an educational planning estimate only. It is not tax, legal, investment, or financial advice. Results depend on the assumptions shown in this report and real-world outcomes will differ.</p>
          </div>
          <div>
            <h3>Methodology</h3>
            <p>Tax estimates, government benefits, withdrawal logic, stress assumptions, and RRIF rules are described in the online methodology.</p>
            <p><a href="${esc(methodologyUrl)}" target="_blank" rel="noopener noreferrer">${esc(methodologyUrl)}</a></p>
          </div>
        </section>
      </section>
    </section>
  `;
}

export function openPrintWindow(summaryHtml) {
  const w = window.open("", "_blank");
  if (!w) return false;
  const printWhenReady = () => {
    try { w.focus(); } catch {}
    try { w.print(); } catch {}
  };
  w.document.open();
  w.document.write(`
    <html><head><title>Retirement Summary</title>
      <style>
        :root{
          --ink:#132033;
          --muted:#5f6b7d;
          --line:#dbe5f2;
          --soft:#f6f9fd;
          --panel:#ffffff;
          --brand:#0f6abf;
          --brand-soft:#eaf4ff;
          --good:#0a7a49;
          --good-soft:#e9f8f0;
          --warn:#b65015;
          --warn-soft:#fff2e8;
          --medium:#7a5b00;
          --medium-soft:#fff9df;
        }
        *{box-sizing:border-box}
        body{font-family:Arial,sans-serif;margin:0;padding:24px;color:var(--ink);background:#fff;line-height:1.45}
        h1,h2,h3,p,ul,figure{margin:0}
        img{max-width:100%;height:auto}
        a{color:#0b4f8f;text-decoration:none}
        .report-shell{display:flex;flex-direction:column;gap:22px}
        .report-page{display:flex;flex-direction:column;gap:18px;page-break-after:always}
        .report-page:last-child{page-break-after:auto}
        .report-header{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(260px,1fr);gap:18px;align-items:start}
        .report-kicker{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--brand)}
        .report-subtitle{margin-top:8px;color:var(--muted);max-width:52rem}
        .report-meta-card,.report-panel,.report-footer-panel,.report-hero-card,.report-cta-band,.report-watch-card,.report-action-card,.report-metric-card,.report-appendix-card{border:1px solid var(--line);border-radius:16px;background:var(--panel)}
        .report-meta-card{padding:16px;display:grid;gap:10px}
        .report-meta-card span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
        .report-meta-card strong{font-size:15px}
        .report-hero-card{padding:20px 22px;display:flex;justify-content:space-between;gap:18px;align-items:flex-start;background:linear-gradient(180deg,var(--brand-soft),#fff)}
        .report-hero-card.good{background:linear-gradient(180deg,#eef8f3,#fff)}
        .report-hero-card.warn{background:linear-gradient(180deg,#fff2ef,#fff)}
        .report-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px}
        .report-score{min-width:124px;text-align:center;padding:14px 12px;border-radius:14px;background:#fff;border:1px solid var(--line)}
        .report-score strong{display:block;font-size:40px;line-height:1;color:var(--brand)}
        .report-score span{display:block;margin-top:6px;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
        .report-scorecard-grid,.report-summary-grid,.report-appendix-grid,.report-watchlist,.report-actions{display:grid;gap:14px}
        .report-scorecard-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
        .report-metric-card{padding:16px}
        .report-metric-label{display:block;font-size:12px;color:var(--muted);margin-bottom:8px}
        .report-metric-card strong{display:block;font-size:24px;line-height:1.15}
        .report-metric-sub{display:block;margin-top:8px;font-size:12px;color:var(--muted)}
        .report-grid-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .report-grid-two.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
        .report-panel{padding:18px}
        .report-panel h2,.report-panel h3{margin-bottom:10px}
        .report-clean-list{padding-left:18px;display:grid;gap:8px}
        .report-mini-score-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .report-mini-score-grid div{padding:12px;border-radius:12px;background:var(--soft);border:1px solid var(--line)}
        .report-mini-score-grid span{display:block;font-size:12px;color:var(--muted)}
        .report-mini-score-grid strong{display:block;margin-top:4px;font-size:18px}
        .report-footnote,.print-chart figcaption{font-size:12px;color:var(--muted)}
        .report-cta-band{padding:18px;border-radius:18px;background:linear-gradient(180deg,#f7fbff,#fff);display:grid;gap:16px}
        .report-cta-band-secondary{background:linear-gradient(180deg,#f8fbff,#fff)}
        .report-cta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .report-cta-card{display:block;padding:16px 18px;border-radius:14px;border:1px solid var(--line);background:#fff}
        .report-cta-card.primary{border-color:#9fc8f0;background:var(--brand-soft)}
        .report-cta-card span{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
        .report-cta-card strong{display:block;margin-top:8px;font-size:18px;color:var(--ink);word-break:break-word}
        .report-qr-row{display:flex;gap:12px;flex-wrap:wrap}
        .report-qr-card{display:flex;flex-direction:column;align-items:center;gap:6px}
        .print-qr{width:120px;height:120px;border:1px solid var(--line);border-radius:10px;background:#fff}
        .print-chart{display:grid;gap:8px}
        .print-chart img{display:block;border:1px solid var(--line);border-radius:14px}
        .print-legend{display:flex;flex-wrap:wrap;gap:12px}
        .print-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#334155}
        .print-legend-swatch{width:10px;height:10px;border-radius:999px;display:inline-block;border:1px solid rgba(0,0,0,.08)}
        .report-callout{padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--soft)}
        .report-callout-label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:6px}
        .report-watchlist{grid-template-columns:repeat(2,minmax(0,1fr))}
        .report-watch-card{padding:16px}
        .report-watch-card.high{background:#fff3f1}
        .report-watch-card.medium{background:#fff9e8}
        .report-watch-card.low{background:#f4fbf7}
        .report-watch-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:8px}
        .report-severity{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
        .report-actions{grid-template-columns:1fr}
        .report-action-card{padding:16px;display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;align-items:start}
        .report-action-step{width:44px;height:44px;border-radius:999px;background:var(--brand-soft);display:grid;place-items:center;font-weight:700;color:var(--brand)}
        .report-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .report-summary-item{padding:12px 14px;border-radius:12px;background:var(--soft);border:1px solid var(--line)}
        .report-appendix-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .report-appendix-card{padding:16px}
        .report-footer-panel{padding:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;background:linear-gradient(180deg,#fbfdff,#fff)}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid var(--line);padding:8px 10px;font-size:12px;text-align:left}
        @page{margin:14mm}
        @media (max-width:900px){
          .report-header,.report-grid-two,.report-grid-two.compact,.report-scorecard-grid,.report-watchlist,.report-summary-grid,.report-appendix-grid,.report-footer-panel,.report-cta-grid{grid-template-columns:1fr}
          .report-hero-card{flex-direction:column}
          .report-score{min-width:auto}
        }
        @media print{
          body{padding:0;color:#000;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          a{text-decoration:none;color:#0b4f8f}
        }
      </style>
    </head><body>${summaryHtml}</body></html>
  `);
  w.document.close();
  if (typeof w.addEventListener === "function") {
    w.addEventListener("load", () => setTimeout(printWhenReady, 140), { once: true });
  }
  setTimeout(printWhenReady, 260);
  return true;
}
