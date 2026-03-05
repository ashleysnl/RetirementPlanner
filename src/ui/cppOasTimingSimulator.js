export function renderCppOasTimingSimulator(ctx) {
  const {
    mountEl,
    sim,
    preview,
    tooltipButton,
    numberField,
    formatCurrency,
    formatPct,
  } = ctx;
  if (!mountEl || !preview) return;
  mountEl.innerHTML = `
    <article class="subsection">
      <h3>CPP & OAS Start Age Simulator ${tooltipButton("cppOasTimingSim")}</h3>
      <p class="small-copy muted">Preview only. Compare timing tradeoffs, then apply if you want.</p>
      <div class="form-grid compact-mobile-two">
        ${numberField("CPP start age", "uiState.timingSim.cppStartAge", sim.cppStartAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
        ${numberField("OAS start age", "uiState.timingSim.oasStartAge", sim.oasStartAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
        <label class="inline-check form-span-full"><input type="checkbox" data-bind="uiState.timingSim.linkTiming" ${sim.linkTiming ? "checked" : ""} />Link timing</label>
      </div>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Lifetime CPP+OAS</strong><span>${formatCurrency(preview.deltas.lifetimeBenefits)}</span><small class="muted">Delta vs current</small></div>
        <div class="preview-kpi-item"><strong>Retirement gross draw</strong><span>${formatCurrency(preview.deltas.grossWithdrawalAtRetire)}</span><small class="muted">Delta at retirement start</small></div>
        <div class="preview-kpi-item"><strong>Tax rate</strong><span>${formatPct(preview.deltas.effectiveTaxAtRetire)}</span><small class="muted">Delta at retirement start</small></div>
        <div class="preview-kpi-item"><strong>OAS clawback</strong><span>${formatCurrency(preview.deltas.clawbackAtRetire)}</span><small class="muted">Delta at retirement start</small></div>
      </div>
      <div class="landing-actions">
        <button class="btn btn-primary" type="button" data-action="apply-timing-preview">Apply timing</button>
        <button class="btn btn-secondary" type="button" data-action="reset-timing-preview">Reset preview</button>
      </div>
      <p class="small-copy muted">Tradeoff: starting earlier gives more years of smaller payments. Starting later gives fewer years of larger payments and can raise taxable income later.</p>
      <p class="small-copy muted">Guaranteed income ${tooltipButton("kpiGuaranteedIncome")} | Tax wedge ${tooltipButton("learnTaxGrossUp")} | OAS clawback ${tooltipButton("oasClawback")}</p>
    </article>
  `;
}
