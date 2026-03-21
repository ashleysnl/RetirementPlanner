function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export const STRATEGY_SUGGESTIONS = [
  {
    key: "delay-cpp",
    title: "Delay CPP to 70",
    desc: "Can reduce early draw pressure and increase later guaranteed income.",
  },
  {
    key: "meltdown",
    title: "Try RRSP meltdown",
    desc: "Test planned early withdrawals to reduce later RRIF/tax pressure.",
  },
  {
    key: "spend-down-10",
    title: "Reduce spending by 10%",
    desc: "Quick sensitivity test for plan resilience.",
  },
  {
    key: "retire-later-2",
    title: "Retire 2 years later",
    desc: "Adds contribution years and shortens drawdown.",
  },
];

export function renderStrategySuggestions(ctx) {
  const { mountEl, pendingKey } = ctx;
  if (!mountEl) return;
  mountEl.innerHTML = `
    <article class="subsection" id="strategySuggestions">
      <h3>Strategies to explore</h3>
      <div class="strategy-grid">
        ${STRATEGY_SUGGESTIONS.map((s) => `
          <article class="strategy-card ${pendingKey === s.key ? "active" : ""}">
            <strong>${esc(s.title)}</strong>
            <p class="small-copy muted">${esc(s.desc)}</p>
            <button type="button" class="btn btn-secondary" data-action="preview-strategy" data-value="${esc(s.key)}">Preview strategy</button>
          </article>
        `).join("")}
      </div>
      ${pendingKey ? `
        <div class="landing-actions">
          <button type="button" class="btn btn-primary" data-action="apply-strategy-preview">Apply</button>
          <button type="button" class="btn btn-secondary" data-action="undo-strategy-preview">Undo preview</button>
        </div>
      ` : ""}
    </article>
  `;
}

