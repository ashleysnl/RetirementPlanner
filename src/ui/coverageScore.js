export function renderCoverageScore(ctx) {
  const { mountEl, score, tooltipButton, formatPct } = ctx;
  if (!mountEl || !score) return;
  mountEl.innerHTML = `
    <article class="subsection">
      <h3>Retirement Coverage Score ${tooltipButton("retirementScore")}</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Total</strong><span>${score.total}/100</span></div>
        <div class="preview-kpi-item"><strong>Status</strong><span>${score.band}</span></div>
        <div class="preview-kpi-item"><strong>Coverage</strong><span>${score.subs.coverage}/40</span></div>
        <div class="preview-kpi-item"><strong>Longevity</strong><span>${score.subs.longevity}/30</span></div>
        <div class="preview-kpi-item"><strong>Tax</strong><span>${score.subs.taxEfficiency}/20</span></div>
        <div class="preview-kpi-item"><strong>Clawback</strong><span>${score.subs.clawback}/10</span></div>
      </div>
      <details>
        <summary>How this score is calculated ${tooltipButton("coverageScoreWeights")}</summary>
        <ul class="plain-list small-copy muted">
          <li>Coverage ratio (0-40): guaranteed income vs spending in early retirement.</li>
          <li>Longevity risk (0-30): depletion age vs life expectancy.</li>
          <li>Tax efficiency (0-20): average effective tax rate in retirement years.</li>
          <li>Clawback exposure (0-10): estimated OAS clawback as a share of OAS.</li>
        </ul>
      </details>
      <p class="small-copy muted">Planning estimate only. Not advice.</p>
      <p class="small-copy muted">Average effective tax in retirement: ${formatPct(score.metrics.avgEffectiveTaxRate)}</p>
    </article>
  `;
}
