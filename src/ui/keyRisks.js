function severityClass(level) {
  const norm = String(level || "").toLowerCase();
  if (norm === "high") return "risk-high";
  if (norm === "medium") return "risk-medium";
  return "risk-low";
}

export function renderKeyRisks(ctx) {
  const {
    mountEl,
    risks,
    tooltipButton,
  } = ctx;
  if (!mountEl) return;
  if (!Array.isArray(risks) || !risks.length) {
    mountEl.innerHTML = "";
    return;
  }
  mountEl.innerHTML = `
    <article class="subsection key-risks">
      <h3>Key Retirement Risks ${tooltipButton("retirementScore")}</h3>
      <div class="risk-list">
        ${risks.map((risk) => `
          <article class="risk-row ${severityClass(risk.severity)}">
            <div class="risk-row-main">
              <h4>${risk.title}</h4>
              <span class="risk-badge">${risk.severity}</span>
            </div>
            <p class="small-copy">${risk.detail}</p>
            <div class="landing-actions">
              <button class="btn btn-secondary" type="button" data-nav-target="${risk.learnTarget || "learn"}">${risk.learnLabel || "Learn more"}</button>
              ${risk.action ? `<button class="btn btn-secondary" type="button" data-action="${risk.action}">${risk.actionLabel || "Take action"}</button>` : ""}
            </div>
          </article>
        `).join("")}
      </div>
    </article>
  `;
}

