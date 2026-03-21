export function renderWhatChangedPanel(ctx) {
  const { mountEl, summary } = ctx;
  if (!mountEl) return;
  if (!summary) {
    mountEl.innerHTML = "";
    return;
  }
  mountEl.innerHTML = `
    <details class="subsection" open>
      <summary>${summary.title}</summary>
      <ul class="plain-list">
        ${(summary.bullets || []).map((b) => `<li>${b}</li>`).join("")}
      </ul>
      <div class="landing-actions">
        <button class="btn btn-secondary" type="button" data-action="dismiss-last-change">Dismiss</button>
        <button class="btn btn-primary" type="button" data-action="undo-last-change">Undo</button>
      </div>
    </details>
  `;
}

