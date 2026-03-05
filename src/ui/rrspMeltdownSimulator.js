export function renderRrspMeltdownSimulator(ctx) {
  const {
    mountEl,
    plan,
    comparison,
    numberField,
    tooltipButton,
    formatCurrency,
    formatPct,
  } = ctx;
  if (!mountEl || !comparison) return;

  const before = comparison.before;
  const after = comparison.after;
  const d = {
    peakTax: after.peakEffectiveTax - before.peakEffectiveTax,
    clawback: after.totalClawback - before.totalClawback,
    rrifShock: after.rrifShockAt71 - before.rrifShockAt71,
    depletion: (after.depletionAge || 0) - (before.depletionAge || 0),
    totalTax: after.totalTax - before.totalTax,
  };

  mountEl.innerHTML = `
    <article class="subsection">
      <h3>RRSP Meltdown Strategy (Optional) ${tooltipButton("rrspMeltdown")}</h3>
      <p class="small-copy muted">Illustration only. Planned early RRSP withdrawals can reduce later RRIF pressure and clawback exposure.</p>
      <div class="form-grid compact-mobile-two">
        <label class="inline-check form-span-full">
          <input type="checkbox" data-bind="strategy.meltdownEnabled" ${plan.strategy.meltdownEnabled ? "checked" : ""} />
          Enable planned early RRSP withdrawals
        </label>
        ${numberField("Extra RRSP withdrawal / year", "strategy.meltdownAmount", plan.strategy.meltdownAmount, { min: 0, max: 50000, step: 500 }, "rrsp", false, !plan.strategy.meltdownEnabled, true)}
        ${numberField("Start age", "strategy.meltdownStartAge", plan.strategy.meltdownStartAge, { min: 50, max: 71, step: 1 }, "retirementAge", false, !plan.strategy.meltdownEnabled, true)}
        ${numberField("End age", "strategy.meltdownEndAge", plan.strategy.meltdownEndAge, { min: 55, max: 75, step: 1 }, "rrifConversionAge", false, !plan.strategy.meltdownEnabled, true)}
        ${numberField("Income ceiling (optional)", "strategy.meltdownIncomeCeiling", plan.strategy.meltdownIncomeCeiling, { min: 0, max: 250000, step: 1000 }, "learnTaxGrossUp", false, !plan.strategy.meltdownEnabled, true)}
      </div>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Peak effective tax</strong><span>${formatPct(d.peakTax)}</span></div>
        <div class="preview-kpi-item"><strong>Total OAS clawback</strong><span>${formatCurrency(d.clawback)}</span></div>
        <div class="preview-kpi-item"><strong>RRIF shock at 71</strong><span>${formatCurrency(d.rrifShock)}</span></div>
        <div class="preview-kpi-item"><strong>Total tax estimate</strong><span>${formatCurrency(d.totalTax)}</span></div>
        <div class="preview-kpi-item"><strong>Depletion age change</strong><span>${before.depletionAge && after.depletionAge ? `${d.depletion >= 0 ? "+" : ""}${d.depletion} years` : "No depletion change"}</span></div>
      </div>
      <p class="small-copy muted">This is a strategy illustration. Real planning requires personal details.</p>
      <p class="small-copy muted">Tax wedge ${tooltipButton("learnTaxGrossUp")} | RRIF minimums ${tooltipButton("rrifMinimums")} | OAS clawback ${tooltipButton("oasClawback")}</p>
    </article>
  `;
}
