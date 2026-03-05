export function renderTooltipPopover({ key, anchor, tooltipMap, layerEl, escapeHtml }) {
  const tip = tooltipMap[key];
  if (!tip || !anchor || !layerEl) return false;

  clearTooltipLayer(layerEl);

  const rect = anchor.getBoundingClientRect();
  const pop = document.createElement("div");
  pop.className = "tooltip-popover";
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", `${tip.term} information`);
  pop.innerHTML = `
    <h4>${escapeHtml(tip.term)}</h4>
    <p><strong>Plain language:</strong> ${escapeHtml(tip.plain)}</p>
    <p><strong>Why it matters:</strong> ${escapeHtml(tip.why)}</p>
    <p><strong>Typical range:</strong> ${escapeHtml(tip.range)}</p>
    <button class="btn btn-primary" type="button" data-action="tooltip-example" data-value="${escapeHtml(key)}">Show example</button>
    <p class="tooltip-example muted"></p>
  `;

  if (window.matchMedia("(max-width: 900px)").matches) {
    pop.classList.add("mobile-centered");
  } else {
    const top = rect.bottom + 8;
    const left = Math.max(10, Math.min(window.innerWidth - 330, rect.left - 140));
    pop.style.top = `${top}px`;
    pop.style.left = `${left}px`;
  }
  layerEl.appendChild(pop);
  return true;
}

export function clearTooltipLayer(layerEl) {
  if (!layerEl) return;
  layerEl.innerHTML = "";
}

export function renderGlossaryHtml(tooltipMap, escapeHtml) {
  const entries = Object.values(tooltipMap).sort((a, b) => a.term.localeCompare(b.term));
  return entries.map((entry) => `
    <article class="glossary-item">
      <h3>${escapeHtml(entry.term)}</h3>
      <p><strong>Plain language:</strong> ${escapeHtml(entry.plain)}</p>
      <p><strong>Why it matters:</strong> ${escapeHtml(entry.why)}</p>
      <p><strong>Typical range:</strong> ${escapeHtml(entry.range)}</p>
      <p><strong>Example:</strong> ${escapeHtml(entry.example || "-")}</p>
    </article>
  `).join("");
}
