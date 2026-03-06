function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildScenarioRow(name, metrics, formatCurrency, formatPct, actionsHtml = "") {
  return `
    <tr>
      <td>${esc(name)}</td>
      <td>${formatPct(metrics.coveragePct || 0)}</td>
      <td>${formatCurrency(metrics.netGap65 || 0)}</td>
      <td>${formatCurrency(metrics.gross65 || 0)}</td>
      <td>${formatCurrency(metrics.taxWedge65 || 0)}</td>
      <td>${formatCurrency(metrics.clawback65 || 0)}</td>
      <td>${metrics.depletionAge ? `Age ${metrics.depletionAge}` : "No depletion"}</td>
      <td>${actionsHtml}</td>
    </tr>
  `;
}

export function renderScenarioCompareModal(ctx) {
  const {
    mountEl,
    baseMetrics,
    strategyMetrics,
    savedScenarios,
    formatCurrency,
    formatPct,
  } = ctx;
  if (!mountEl) return;
  const savedRows = (savedScenarios || []).map((s) => buildScenarioRow(
    s.name,
    s.metrics,
    formatCurrency,
    formatPct,
    `<button class="text-link-btn" data-action="preview-scenario" data-value="${esc(s.id)}">Preview</button> <button class="text-link-btn" data-action="share-scenario" data-value="${esc(s.id)}">Share</button> <button class="text-link-btn" data-action="rename-scenario" data-value="${esc(s.id)}">Rename</button> <button class="text-link-btn" data-action="delete-scenario" data-value="${esc(s.id)}">Delete</button>`
  ));
  const rows = [
    buildScenarioRow("Base plan", baseMetrics, formatCurrency, formatPct),
    ...(strategyMetrics || []).map((s) => buildScenarioRow(s.label, s.metrics, formatCurrency, formatPct)),
    ...savedRows,
  ].join("");
  mountEl.innerHTML = `
    <div class="subsection">
      <h3>Compare scenarios</h3>
      <div class="landing-actions">
        <button class="btn btn-secondary" type="button" data-action="save-current-scenario">Save current as scenario</button>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Coverage %</th>
              <th>Net gap (65)</th>
              <th>Gross (65)</th>
              <th>Tax wedge (65)</th>
              <th>Clawback (65)</th>
              <th>Depletion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}
