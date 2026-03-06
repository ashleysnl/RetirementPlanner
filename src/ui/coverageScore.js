export function renderCoverageScore(ctx) {
  const { mountEl, score, tooltipButton, formatPct } = ctx;
  if (!mountEl || !score) return;
  const improveTarget = score.total < 60 ? "open-advanced" : "open-stress";
  mountEl.innerHTML = `
    <article class="subsection">
      <h3>Plan Health Score ${tooltipButton("retirementScore")}</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Total</strong><span>${score.total}/100</span></div>
        <div class="preview-kpi-item"><strong>Status</strong><span>${score.band}</span></div>
        <div class="preview-kpi-item"><strong>Coverage</strong><span>${score.subs.coverage}/35</span></div>
        <div class="preview-kpi-item"><strong>Longevity</strong><span>${score.subs.longevity}/30</span></div>
        <div class="preview-kpi-item"><strong>Tax drag</strong><span>${score.subs.taxDrag}/15</span></div>
        <div class="preview-kpi-item"><strong>Clawback</strong><span>${score.subs.clawback}/10</span></div>
        <div class="preview-kpi-item"><strong>RRIF shock</strong><span>${score.subs.rrifShock}/10</span></div>
      </div>
      <details>
        <summary>How this score is calculated ${tooltipButton("coverageScoreWeights")}</summary>
        <ul class="plain-list small-copy muted">
          <li>Coverage ratio (0-35): guaranteed income vs spending in early retirement.</li>
          <li>Longevity risk (0-30): depletion age vs life expectancy.</li>
          <li>Tax drag (0-15): average tax wedge rate on registered withdrawals.</li>
          <li>Clawback exposure (0-10): estimated OAS clawback as a share of OAS.</li>
          <li>RRIF shock (0-10): taxable-income jump around RRIF minimum years.</li>
        </ul>
      </details>
      <div class="landing-actions">
        <button class="btn btn-secondary" type="button" data-action="${improveTarget}">Improve this score</button>
      </div>
      <p class="small-copy muted">Planning estimate only. Not advice.</p>
      <p class="small-copy muted">Average tax wedge in retirement: ${formatPct(score.metrics.avgTaxWedgeRate)}</p>
    </article>
  `;
}
