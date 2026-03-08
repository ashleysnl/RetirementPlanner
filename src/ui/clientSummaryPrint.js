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

function severityClass(severity) {
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
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
    toolUrl,
    supportUrl,
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
    "Plan inputs summary": [
      `Province: ${state.profile.province}`,
      `Year of birth: ${state.profile.birthYear}`,
      `Retirement age: ${state.profile.retirementAge}`,
      `Life expectancy: ${state.profile.lifeExpectancy}`,
      `After-tax spending target (today's dollars): ${formatCurrency(state.profile.desiredSpending)}`,
      `Inflation: ${formatPct(state.assumptions.inflation)}`,
      `Risk profile: ${state.assumptions.riskProfile}`,
      `Current savings: ${formatCurrency(state.savings.currentTotal)}`,
      `Annual contribution: ${formatCurrency(state.savings.annualContribution)}`,
      `Private pension: ${state.income.pension.enabled ? `${formatCurrency(state.income.pension.amount)} from age ${state.income.pension.startAge}` : "Not modeled"}`,
      `CPP: ${formatCurrency(state.income.cpp.amountAt65)} from age ${state.income.cpp.startAge}`,
      `OAS: ${formatCurrency(state.income.oas.amountAt65)} from age ${state.income.oas.startAge}`,
      `Withdrawal strategy: ${state.strategy.withdrawal}`,
    ],
    "Appendix: Assumptions": [
      `Conservative return: ${formatPct(state.assumptions.returns.conservative)}`,
      `Balanced return: ${formatPct(state.assumptions.returns.balanced)}`,
      `Aggressive return: ${formatPct(state.assumptions.returns.aggressive)}`,
      `Scenario spread: ${formatPct(state.assumptions.scenarioSpread)}`,
      `Tax brackets indexed with inflation: ${yesNo(state.assumptions.taxBracketInflation)}`,
    ],
    "Appendix: Savings and accounts": [
      `Contribution increase YoY: ${formatPct(state.savings.contributionIncrease || 0)}`,
      `Capital injections: ${injects.length ? injects.map((x) => `${x.label || "Lump sum"} ${formatCurrency(x.amount)} at age ${x.age}`).join("; ") : "None"}`,
      `RRSP/RRIF: ${formatCurrency(state.accounts.rrsp)}`,
      `TFSA: ${formatCurrency(state.accounts.tfsa)}`,
      `Non-registered: ${formatCurrency(state.accounts.nonRegistered)}`,
      `Cash: ${formatCurrency(state.accounts.cash)}`,
    ],
    "Appendix: Income and strategy": [
      `Private pension enabled: ${yesNo(state.income.pension.enabled)}`,
      `CPP amount at 65 / start age: ${formatCurrency(state.income.cpp.amountAt65)} / ${state.income.cpp.startAge}`,
      `OAS amount at 65 / start age: ${formatCurrency(state.income.oas.amountAt65)} / ${state.income.oas.startAge}`,
      `Spousal income enabled: ${yesNo(spouse.enabled)}`,
      `Spouse pension amount / start age: ${formatCurrency(spouse.pensionAmount || 0)} / ${spouse.pensionStartAge || "-"}`,
      `Spouse CPP amount / start age: ${formatCurrency(spouse.cppAmountAt65 || 0)} / ${spouse.cppStartAge || "-"}`,
      `Spouse OAS amount / start age: ${formatCurrency(spouse.oasAmountAt65 || 0)} / ${spouse.oasStartAge || "-"}`,
      `Estimate taxes: ${yesNo(state.strategy.estimateTaxes !== false)}`,
      `OAS clawback modeling: ${yesNo(state.strategy.oasClawbackModeling)}`,
      `Apply RRIF minimums: ${yesNo(state.strategy.applyRrifMinimums)}`,
      `RRIF conversion age: ${state.strategy.rrifConversionAge}`,
      `RRSP meltdown enabled: ${yesNo(state.strategy.meltdownEnabled)}`,
      `Meltdown amount / range: ${formatCurrency(state.strategy.meltdownAmount || 0)} | ${state.strategy.meltdownStartAge || "-"} to ${state.strategy.meltdownEndAge || "-"}`,
      `Meltdown income ceiling: ${formatCurrency(state.strategy.meltdownIncomeCeiling || 0)}`,
    ],
  };

  const plannerHref = esc(toolUrl || "https://retirement.simplekit.app");
  const supportHref = esc(supportUrl || "https://buymeacoffee.com/ashleysnl");
  const plannerQr = qrCodeUrl(toolUrl || "https://retirement.simplekit.app");
  const supportQr = qrCodeUrl(supportUrl || "https://buymeacoffee.com/ashleysnl");
  const coverageBand = m.coverageRatio >= 1 ? "Strong" : m.coverageRatio >= 0.85 ? "Mostly on track" : "Needs review";

  return `
    <section class="print-summary report-shell">
      <section class="report-page">
        <div class="report-section report-header">
          <div>
            <p class="report-kicker">SimpleKit Retirement Planner</p>
            <h1>Client Retirement Summary</h1>
            <p class="report-subtitle">A presentation-friendly summary of the current plan, built from the same assumptions and calculations used in the interactive planner.</p>
          </div>
          <div class="report-meta-card">
            <div><span>Prepared for</span><strong>${esc(prefs.preparedFor || "-")}</strong></div>
            <div><span>Scenario</span><strong>${esc(prefs.scenarioLabel || "Current plan")}</strong></div>
            <div><span>Prepared by</span><strong>${esc(prefs.preparedBy || "-")}</strong></div>
            <div><span>Date</span><strong>${esc(dateValue)}</strong></div>
          </div>
        </div>

        <div class="report-section report-hero-card ${m.coverageRatio >= 1 ? "good" : "warn"}">
          <div>
            <p class="report-label">Retirement readiness snapshot</p>
            <h2>${coverageBand}</h2>
            <p>At age ${row.age}, guaranteed income covers ${formatPct(m.coverageRatio)} of the spending target. ${m.netGap > 0 ? `The rest comes from RRSP/RRIF withdrawals, with about ${formatCurrency(m.taxWedge)} going to tax and clawback.` : "Guaranteed income appears to cover the target without required withdrawals in that year."}</p>
          </div>
          <div class="report-score">
            <strong>${Math.round(m.coverageRatio * 100)}%</strong>
            <span>Coverage</span>
          </div>
        </div>

        <div class="report-section report-scorecard-grid report-card-grid">
          <article class="report-metric-card">
            <span class="report-metric-label">Guaranteed income</span>
            <strong>${formatCurrency(m.guaranteed)}</strong>
            <span class="report-metric-sub">${m.estimateTaxes ? "After estimated tax" : "Tax estimates off"}</span>
          </article>
          <article class="report-metric-card">
            <span class="report-metric-label">Savings withdrawals needed</span>
            <strong>${formatCurrency(m.grossWithdrawal)}</strong>
            <span class="report-metric-sub">Gross RRSP/RRIF withdrawal</span>
          </article>
          <article class="report-metric-card">
            <span class="report-metric-label">Estimated tax drag</span>
            <strong>${m.estimateTaxes ? formatCurrency(m.taxWedge) : "Off"}</strong>
            <span class="report-metric-sub">${m.estimateTaxes ? `Effective rate ${formatPct(m.effectiveRate)}` : "Planning estimate disabled"}</span>
          </article>
          <article class="report-metric-card">
            <span class="report-metric-label">Net spending available</span>
            <strong>${formatCurrency(m.netSpendingAvailable)}</strong>
            <span class="report-metric-sub">Spendable income for this year</span>
          </article>
        </div>

        <section class="report-section report-cta-section report-cta-band">
          <div class="report-cta-copy">
            <h3>Use the interactive planner next</h3>
            <p>Open the calculator to test retirement age, spending, inflation, CPP timing, and withdrawal strategy. If this report helped, you can support the tool’s upkeep as well.</p>
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
        </section>
      </section>

      <section class="report-page">
        <section class="report-section report-panel report-chart-section">
          <h2>Portfolio Projection</h2>
          <p class="report-intro">This chart shows how savings build and then get used over time under the current assumptions. It helps answer whether the plan appears durable through the full planning horizon.</p>
          ${chartImages?.projection
            ? `<figure class="print-chart"><img src="${chartImages.projection}" alt="Projection chart" /><figcaption>Projection chart from the current client summary view.</figcaption>${renderLegend([
              { label: "Portfolio balance", color: "#0f6abf" },
              { label: "Stress band (best/worst)", color: "#7aa7d8" },
            ])}</figure>`
            : "<p class=\"report-footnote\">Projection chart was unavailable in this export.</p>"
          }
        </section>

      </section>

      <section class="report-page">
        <section class="report-section report-panel report-chart-section">
          <h2>Income Timeline / Income Map</h2>
          <p class="report-intro">This chart shows where retirement income comes from each year. Guaranteed income forms the base. RRSP/RRIF withdrawals act as a top-up. The tax wedge shows the part of withdrawals that goes to tax instead of spending.</p>
          ${chartImages?.incomeMap
            ? `<figure class="print-chart"><img src="${chartImages.incomeMap}" alt="Retirement income map chart" /><figcaption>Retirement income map from the current client summary view.</figcaption>${renderLegend([
              { label: "Pension", color: "#f59e0b" },
              { label: "CPP", color: "#16a34a" },
              { label: "OAS", color: "#0ea5a8" },
              { label: "RRSP/RRIF", color: "#0f6abf" },
              { label: "Tax wedge", color: "#d9485f" },
              { label: "Spending target", color: "#111827" },
            ])}</figure>`
            : "<p class=\"report-footnote\">Income map chart was unavailable in this export.</p>"
          }
        </section>

        <section class="report-section report-panel">
          <h2>Income Timeline</h2>
          <div class="report-actions">
            ${(summary.phases || []).map((phase, index) => {
              const range = Number(phase.startAge) === Number(phase.endAge)
                ? `Age ${phase.startAge}`
                : `Age ${phase.startAge}-${phase.endAge}`;
              return `
                <article class="report-action-card">
                  <span class="report-action-step">${index + 1}</span>
                  <div>
                    <h3>${esc(phaseTitle(phase.key))} (${range})</h3>
                    <p>${esc(phase.why || "")}</p>
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        </section>
      </section>

      <section class="report-page">
        <section class="report-section report-panel">
          <h2>Key Risks to Watch</h2>
          <div class="report-watchlist report-card-grid">
            ${(risks || []).slice(0, 5).map((risk) => `
              <article class="report-watch-card ${severityClass(risk.severity)}">
                <div class="report-watch-head">
                  <h3>${esc(risk.title)}</h3>
                  <span class="report-severity">${esc(risk.severity)}</span>
                </div>
                <p>${esc(risk.detail)}</p>
                <p class="report-footnote">Why it matters: ${esc(risk.actionLabel || "This area is worth reviewing in the planner.")}</p>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="report-section report-panel">
          <h2>Recommended Next Moves</h2>
          <div class="report-actions report-card-grid">
            ${(strategySuggestions || []).map((s, index) => `
              <article class="report-action-card">
                <span class="report-action-step">${index + 1}</span>
                <div>
                  <h3>${esc(s.title)}</h3>
                  <p>${esc(s.desc)}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="report-section report-cta-section report-cta-band report-cta-band-secondary">
          <div class="report-cta-copy">
            <h3>Keep planning online</h3>
            <p>Use the full planner to compare scenarios, revisit retirement age, and test different tax-aware withdrawal strategies.</p>
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

      <section class="report-page report-page-start">
        ${Object.entries(detailedInputs).map(([title, items]) => `
          <section class="report-section report-panel report-appendix-section">
            <h2>${esc(title)}</h2>
            <ul class="report-clean-list">${fmtListItems(items)}</ul>
          </section>
        `).join("")}

        <section class="report-section report-cta-section report-cta-band report-cta-band-secondary">
          <div class="report-cta-copy">
            <h3>Reopen this report online</h3>
            <p>Scan or click to reopen the calculator, compare another scenario, or support the tool.</p>
          </div>
          <div class="report-qr-row">
            ${plannerQr ? `<figure class="report-qr-card"><img class="print-qr" src="${plannerQr}" alt="QR code linking to the retirement calculator" /><figcaption>Calculator</figcaption></figure>` : ""}
            ${supportQr ? `<figure class="report-qr-card"><img class="print-qr" src="${supportQr}" alt="QR code linking to Buy Me a Coffee" /><figcaption>☕ Support</figcaption></figure>` : ""}
          </div>
        </section>

        <section class="report-section report-footer-panel">
          <div>
            <h3>Disclaimer</h3>
            <p>This is an educational planning estimate only. It is not tax, legal, investment, or financial advice. Results depend on the assumptions shown in this report and real-world outcomes will differ.</p>
          </div>
          <div>
            <h3>Methodology</h3>
            <p>Government benefits, taxes, withdrawal logic, RRIF rules, and scenario methods are explained in the methodology section online.</p>
            <p><a href="${esc(methodologyUrl)}" target="_blank" rel="noopener noreferrer">${esc(methodologyUrl)}</a></p>
          </div>
        </section>
      </section>
    </section>
  `;
}

export function openClientSummaryPrintWindow(summaryHtml) {
  const w = window.open("", "_blank");
  if (!w) return false;
  const printWhenReady = () => {
    try { w.focus(); } catch {}
    try { w.print(); } catch {}
  };
  w.document.open();
  w.document.write(`
    <html><head><title>Client Summary</title>
      <style>
        :root{
          --ink:#132033;
          --muted:#5f6b7d;
          --line:#dbe5f2;
          --soft:#f6f9fd;
          --panel:#ffffff;
          --brand:#0f6abf;
          --brand-soft:#eaf4ff;
        }
        *{box-sizing:border-box}
        body{font-family:Arial,sans-serif;margin:0;padding:24px;color:var(--ink);background:#fff;line-height:1.45}
        h1,h2,h3,p,ul,figure{margin:0}
        img{max-width:100%;height:auto}
        a{color:#0b4f8f;text-decoration:none}
        .report-shell{display:flex;flex-direction:column;gap:22px}
        .report-page{display:flex;flex-direction:column;gap:18px;page-break-after:always;break-after:page}
        .report-page:last-child{page-break-after:auto}
        .report-page-start{page-break-before:always;break-before:page}
        .report-section,.report-panel,.report-chart-section,.report-cta-section,.report-footer-panel,.report-appendix-section,.report-card-grid,.report-watch-card,.report-action-card,.report-metric-card,.report-meta-card,.report-hero-card,.print-chart,.print-chart img,.print-legend,.print-chart figcaption{break-inside:avoid;page-break-inside:avoid}
        h1,h2,h3{break-after:avoid;page-break-after:avoid}
        .report-panel > h2,.report-panel > h3,.report-intro,.report-footnote{break-after:avoid;page-break-after:avoid}
        .report-header{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(260px,1fr);gap:18px;align-items:start}
        .report-kicker{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--brand)}
        .report-subtitle{margin-top:8px;color:var(--muted);max-width:52rem}
        .report-meta-card,.report-panel,.report-footer-panel,.report-hero-card,.report-cta-band,.report-watch-card,.report-action-card,.report-metric-card{border:1px solid var(--line);border-radius:16px;background:var(--panel)}
        .report-meta-card{padding:16px;display:grid;gap:10px}
        .report-meta-card span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
        .report-meta-card strong{font-size:15px}
        .report-hero-card{padding:20px 22px;display:flex;justify-content:space-between;gap:18px;align-items:flex-start;background:linear-gradient(180deg,#eef8f3,#fff)}
        .report-hero-card.warn{background:linear-gradient(180deg,#fff2ef,#fff)}
        .report-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px}
        .report-score{min-width:124px;text-align:center;padding:14px 12px;border-radius:14px;background:#fff;border:1px solid var(--line)}
        .report-score strong{display:block;font-size:40px;line-height:1;color:var(--brand)}
        .report-score span{display:block;margin-top:6px;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
        .report-scorecard-grid,.report-watchlist,.report-actions,.report-cta-grid{display:grid;gap:14px}
        .report-scorecard-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
        .report-metric-card,.report-panel{padding:16px}
        .report-metric-label{display:block;font-size:12px;color:var(--muted);margin-bottom:8px}
        .report-metric-card strong{display:block;font-size:24px;line-height:1.15}
        .report-metric-sub{display:block;margin-top:8px;font-size:12px;color:var(--muted)}
        .report-intro,.report-footnote,.print-chart figcaption{font-size:12px;color:var(--muted)}
        .print-chart{display:grid;gap:8px}
        .print-chart img{display:block;border:1px solid var(--line);border-radius:14px}
        .print-legend{display:flex;flex-wrap:wrap;gap:12px}
        .print-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#334155}
        .print-legend-swatch{width:10px;height:10px;border-radius:999px;display:inline-block;border:1px solid rgba(0,0,0,.08)}
        .report-watchlist{grid-template-columns:repeat(2,minmax(0,1fr))}
        .report-watch-card{padding:16px}
        .report-watch-card.high{background:#fff3f1}
        .report-watch-card.medium{background:#fff9e8}
        .report-watch-card.low{background:#f4fbf7}
        .report-watch-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:8px}
        .report-severity{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
        .report-action-card{padding:16px;display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;align-items:start}
        .report-action-step{width:44px;height:44px;border-radius:999px;background:var(--brand-soft);display:grid;place-items:center;font-weight:700;color:var(--brand)}
        .report-clean-list{padding-left:18px;display:grid;gap:8px}
        .report-cta-band{padding:16px;border-radius:18px;background:linear-gradient(180deg,#f7fbff,#fff);display:grid;gap:12px}
        .report-cta-band-secondary{background:linear-gradient(180deg,#f8fbff,#fff)}
        .report-cta-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .report-cta-card{display:block;padding:16px 18px;border-radius:14px;border:1px solid var(--line);background:#fff}
        .report-cta-card.primary{border-color:#9fc8f0;background:var(--brand-soft)}
        .report-cta-card span{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
        .report-cta-card strong{display:block;margin-top:8px;font-size:18px;color:var(--ink);word-break:break-word}
        .report-qr-row{display:flex;gap:10px;flex-wrap:wrap}
        .report-qr-card{display:flex;flex-direction:column;align-items:center;gap:6px}
        .print-qr{width:104px;height:104px;border:1px solid var(--line);border-radius:10px;background:#fff}
        .report-footer-panel{padding:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;background:linear-gradient(180deg,#fbfdff,#fff)}
        @page{margin:14mm}
        @media (max-width:900px){
          .report-header,.report-scorecard-grid,.report-watchlist,.report-cta-grid,.report-footer-panel{grid-template-columns:1fr}
          .report-hero-card{flex-direction:column}
          .report-score{min-width:auto}
        }
        @media print{
          body{padding:0;color:#000;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          a{text-decoration:none;color:#0b4f8f}
          .report-cta-band{padding:14px}
          .report-panel{padding:14px}
          .report-metric-card,.report-action-card,.report-watch-card{padding:14px}
          .print-chart img{max-height:300mm;object-fit:contain}
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
