export function renderReferenceLinksList(links, escapeHtml) {
  if (!Array.isArray(links) || !links.length) {
    return `<p class="small-copy muted">No links available yet.</p>`;
  }
  return `
    <ul class="plain-list reference-links-list">
      ${links.map((item) => `
        <li class="reference-item">
          <a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.title)} (opens external link)">
            ${escapeHtml(item.title)} ↗
          </a>
          <p class="small-copy muted">${escapeHtml(item.description)}</p>
          <p class="small-copy muted">${escapeHtml(item.source)} • Last reviewed: ${escapeHtml(item.reviewed)}</p>
        </li>
      `).join("")}
    </ul>
  `;
}

