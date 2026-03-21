export function createUiFieldHelpers({ tooltips, escapeHtml, formatNumber }) {
  function tooltipButton(key) {
    const term = tooltips[key]?.term || key;
    return `<button class="tooltip-trigger" type="button" aria-label="Help: ${escapeHtml(term)}" data-tooltip-key="${escapeHtml(key)}">ⓘ</button>`;
  }

  function numberField(label, bind, value, attrs, tooltipKey, percentInput = false, disabled = false, compact = false) {
    const finalValue = percentInput ? formatNumber(value) : formatNumber(value);
    const attrString = Object.entries(attrs || {})
      .map(([k, v]) => `${k}="${String(v)}"`)
      .join(" ");

    return `
      <label class="${compact ? "compact-field" : ""}">
        <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
        <input
          type="number"
          data-bind="${bind}"
          data-type="number"
          ${percentInput ? 'data-percent-input="1"' : ""}
          value="${finalValue}"
          ${attrString}
          ${disabled ? "disabled" : ""}
          aria-label="${escapeHtml(label)}"
        />
      </label>
    `;
  }

  function learnNumberField(label, bind, value, attrs, tooltipKey, percentInput = false, disabled = false, compact = false) {
    const finalValue = percentInput ? formatNumber(value) : formatNumber(value);
    const attrString = Object.entries(attrs || {})
      .map(([k, v]) => `${k}="${String(v)}"`)
      .join(" ");

    return `
      <label class="${compact ? "compact-field" : ""}">
        <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
        <input
          type="number"
          data-learn-bind="${bind}"
          data-type="number"
          ${percentInput ? 'data-percent-input="1"' : ""}
          value="${finalValue}"
          ${attrString}
          ${disabled ? "disabled" : ""}
          aria-label="${escapeHtml(label)}"
        />
      </label>
    `;
  }

  function selectField(label, bind, options, selected, tooltipKey, compact = false) {
    return `
      <label class="${compact ? "compact-field" : ""}">
        <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
        <select data-bind="${bind}" aria-label="${escapeHtml(label)}">
          ${options.map((opt) => `
            <option value="${opt.value}" ${opt.value === selected ? "selected" : ""}>${escapeHtml(opt.label)}</option>
          `).join("")}
        </select>
      </label>
    `;
  }

  return {
    tooltipButton,
    numberField,
    learnNumberField,
    selectField,
  };
}
