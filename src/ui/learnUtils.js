export function learnCallouts(titleA, bodyA, titleB, bodyB, escapeHtml) {
  return `
    <div class="learn-callout-grid">
      <article class="learn-callout">
        <strong>${escapeHtml(titleA)}</strong>
        <p>${escapeHtml(bodyA)}</p>
      </article>
      <article class="learn-callout">
        <strong>${escapeHtml(titleB)}</strong>
        <p>${escapeHtml(bodyB)}</p>
      </article>
    </div>
  `;
}

export function calculatePhaseWeightedSpending(phases) {
  const totalYears = Math.max(1, Number(phases.goYears) + Number(phases.slowYears) + Number(phases.noYears));
  const totalAmount = Number(phases.base) * (
    Number(phases.goYears) * Number(phases.goPct)
    + Number(phases.slowYears) * Number(phases.slowPct)
    + Number(phases.noYears) * Number(phases.noPct)
  );
  return totalAmount / totalYears;
}
