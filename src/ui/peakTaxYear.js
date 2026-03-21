export function renderPeakTaxYear(ctx) {
  const {
    mountEl,
    peak,
    formatCurrency,
  } = ctx;
  if (!mountEl) return;
  if (!peak) {
    mountEl.innerHTML = "";
    return;
  }
  mountEl.innerHTML = `
    <article class="subsection peak-tax-card">
      <h3>Peak Tax Year</h3>
      <p><strong>Highest tax year: age ${peak.age}</strong></p>
      <p class="small-copy muted">Estimated total tax: <strong>${formatCurrency(peak.totalTax)}</strong></p>
      <p class="small-copy muted">Main driver: <strong>${peak.cause}</strong></p>
      <p class="small-copy muted">Federal: ${formatCurrency(peak.federalTax)} | Provincial: ${formatCurrency(peak.provincialTax)} | OAS clawback: ${formatCurrency(peak.clawback)}</p>
      <div class="landing-actions">
        <button type="button" class="btn btn-secondary" data-action="focus-strategies">Try strategies to reduce this</button>
      </div>
    </article>
  `;
}

