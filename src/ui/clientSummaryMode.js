import { STRATEGY_SUGGESTIONS } from "./strategySuggestions.js";

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function severityClass(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "high") return "risk-high";
  if (s === "medium") return "risk-medium";
  return "risk-low";
}

function fmtRange(phase) {
  if (!phase) return "";
  if (Number(phase.startAge) === Number(phase.endAge)) return `Age ${phase.startAge}`;
  return `Age ${phase.startAge}-${phase.endAge}`;
}

export function renderClientSummaryMode(ctx) {
  const {
    mountEl,
    enabled,
    summary,
    risks,
    selectedAge,
    formatCurrency,
    formatPct,
    tooltipButton,
    pendingStrategyKey,
    changeSummary,
    prefs,
  } = ctx;

  if (!mountEl) return;
  mountEl.hidden = !enabled;
  if (!enabled || !summary) {
    mountEl.innerHTML = "";
    return;
  }

  const row = summary.selected;
  const m = summary.metrics;
  const coveragePct = m.coverageRatio;
  const surplus = Math.max(0, m.guaranteed - m.spending);
  const hasSurplus = surplus > 0.5;

  mountEl.innerHTML = `
    <article class="subsection client-summary-mode" aria-live="polite">
      <div class="client-summary-banner">
        <strong>Simplified communication view using your current plan assumptions.</strong>
        <div class="landing-actions">
          <button type="button" class="btn btn-secondary" data-action="print-client-summary">Print Client Report</button>
          <button type="button" class="btn btn-secondary" data-action="exit-client-summary">Open full planner view</button>
        </div>
      </div>

      <div class="subsection client-meta-grid">
        <h3>Prepared details</h3>
        <label>
          <span class="small-copy muted">Prepared for</span>
          <input data-bind="uiState.clientSummary.preparedFor" type="text" value="${esc(prefs.preparedFor || "")}" placeholder="Client or household name" />
        </label>
        <label>
          <span class="small-copy muted">Scenario label</span>
          <input data-bind="uiState.clientSummary.scenarioLabel" type="text" value="${esc(prefs.scenarioLabel || "")}" placeholder="Base plan / Strategy A" />
        </label>
        <label>
          <span class="small-copy muted">Prepared by</span>
          <input data-bind="uiState.clientSummary.preparedBy" type="text" value="${esc(prefs.preparedBy || "")}" placeholder="Advisor or planner" />
        </label>
        <label>
          <span class="small-copy muted">Date</span>
          <input data-bind="uiState.clientSummary.summaryDate" type="date" value="${esc(prefs.summaryDate || "")}" />
        </label>
      </div>

      <section class="subsection">
        <h3>Retirement Readiness Snapshot</h3>
        <p><strong>At age ${row.age}, guaranteed income ${tooltipButton("kpiGuaranteedIncome")} covers <span class="client-summary-number">${formatPct(coveragePct)}</span> of your target spending ${tooltipButton("kpiSpendingTarget")}.</strong> ${hasSurplus
          ? `You are fully covered with an estimated surplus of <strong>${formatCurrency(surplus)}</strong> per year.`
          : `You need about <strong>${formatCurrency(m.grossWithdrawal)}</strong>/yr from RRSP/RRIF ${tooltipButton("kpiGrossWithdrawal")}, and about <strong>${formatCurrency(m.taxWedge)}</strong>/yr goes to tax.`}
        </p>
        <div class="metric-grid metric-grid-wide">
          <article class="metric-card metric-card-primary">
            <span class="label">Coverage</span>
            <span class="value">${formatPct(coveragePct)}</span>
          </article>
          <article class="metric-card metric-card-primary">
            <span class="label">Guaranteed income</span>
            <span class="value">${formatCurrency(m.guaranteed)}</span>
          </article>
          <article class="metric-card metric-card-primary">
            <span class="label">Savings withdrawals</span>
            <span class="value">${formatCurrency(m.grossWithdrawal)}</span>
          </article>
          <article class="metric-card metric-card-primary">
            <span class="label">Estimated taxes</span>
            <span class="value">${formatCurrency(m.taxWedge)}</span>
          </article>
          <article class="metric-card metric-card-primary">
            <span class="label">Net spending available</span>
            <span class="value">${formatCurrency(m.netSpendingAvailable)}</span>
          </article>
        </div>
        <div class="landing-actions">
          ${summary.warnings.clawbackAmount > 0 ? `<span class="risk-badge ${severityClass(summary.warnings.clawbackSeverity)}">OAS clawback risk: ${esc(summary.warnings.clawbackSeverity)}</span>` : ""}
          ${summary.warnings.depletionAge ? `<span class="risk-badge risk-high">Savings run out around age ${summary.warnings.depletionAge}</span>` : ""}
          ${summary.warnings.hasRrifPressure ? `<span class="risk-badge risk-medium">RRIF minimum phase active</span>` : ""}
        </div>
      </section>

      <section class="chart-wrap">
        <div class="chart-head-row">
          <h3>Projection</h3>
        </div>
        <div class="chart-canvas-wrap">
          <canvas id="clientSummaryProjectionChart" width="1000" height="340" aria-label="Client summary projected portfolio balance chart" role="img"></canvas>
        </div>
        <div id="clientSummaryProjectionLegend" class="legend-row"></div>
      </section>

      <section class="subsection">
        <h3>Retirement Income Map</h3>
        <p class="small-copy muted">Where retirement cash flow comes from each year, including tax wedge impact.</p>
        <div id="clientSummaryIncomeMapMount"></div>
      </section>

      <section class="subsection">
        <h3>Income Timeline</h3>
        <div class="client-timeline-grid">
          ${(summary.phases || []).map((phase) => {
            const title = phase.key === "early"
              ? "Early retirement"
              : phase.key === "benefits"
                ? "CPP + OAS phase"
                : "RRIF minimum phase";
            return `
              <button type="button" class="client-phase-card" data-action="set-selected-age" data-value="${phase.startAge}" aria-label="Jump to ${title} at age ${phase.startAge}">
                <strong>${esc(title)}</strong>
                <span>${esc(fmtRange(phase))}</span>
                <p class="small-copy muted">${esc(phase.why || "")}</p>
              </button>
            `;
          }).join("")}
        </div>
      </section>

      <section class="subsection">
        <h3>Key Risks</h3>
        <div class="risk-list compact">
          ${(risks || []).slice(0, 5).map((risk) => `
            <article class="risk-row ${severityClass(risk.severity)}">
              <div class="risk-row-main">
                <h4>${esc(risk.title)}</h4>
                <span class="risk-badge">${esc(risk.severity)}</span>
              </div>
              <p class="small-copy">${esc(risk.detail)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="subsection" id="clientStrategySuggestions">
        <h3>Strategy Suggestions</h3>
        <div class="strategy-grid">
          ${STRATEGY_SUGGESTIONS.map((s) => `
            <article class="strategy-card ${pendingStrategyKey === s.key ? "active" : ""}">
              <strong>${esc(s.title)}</strong>
              <p class="small-copy muted">${esc(s.desc)}</p>
              <button type="button" class="btn btn-secondary" data-action="preview-strategy" data-value="${esc(s.key)}">Preview impact</button>
            </article>
          `).join("")}
        </div>
        ${pendingStrategyKey && changeSummary ? `
          <div class="subsection">
            <strong>What changed?</strong>
            <ul class="plain-list">
              ${(changeSummary.bullets || []).slice(0, 6).map((b) => `<li>${esc(b)}</li>`).join("")}
            </ul>
            <div class="landing-actions">
              <button type="button" class="btn btn-primary" data-action="apply-strategy-preview">Apply</button>
              <button type="button" class="btn btn-secondary" data-action="undo-strategy-preview">Undo preview</button>
            </div>
          </div>
        ` : ""}
      </section>

      <p class="small-copy muted">Planning estimate only - not tax, legal, or financial advice.</p>
    </article>
  `;
}
