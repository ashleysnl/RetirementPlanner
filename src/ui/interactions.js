export function bindTooltipTriggers(container, { ui, openTooltip, closeTooltip }) {
  if (!(container instanceof HTMLElement)) return;
  const buttons = container.querySelectorAll("[data-tooltip-key]");
  buttons.forEach((button) => {
    if (!(button instanceof HTMLElement)) return;
    if (button.dataset.tipBound === "1") return;
    button.dataset.tipBound = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const key = button.getAttribute("data-tooltip-key") || "";
      if (!key) return;
      if (ui.tooltipKey === key) closeTooltip();
      else openTooltip(key, button);
    });
    button.addEventListener("keydown", (event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      const key = button.getAttribute("data-tooltip-key") || "";
      if (!key) return;
      if (ui.tooltipKey === key) closeTooltip();
      else openTooltip(key, button);
    });
  });
}

export function renderCoverageHover(event, {
  model,
  state,
  chartEl,
  hoverEl,
  amountForDisplay,
  formatCurrency,
  clamp,
}) {
  if (!model || !chartEl || !hoverEl) return;
  const rows = model.base.rows.filter((row) => row.age >= state.profile.retirementAge);
  if (!rows.length) return;
  const rect = chartEl.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const idx = clamp(Math.round((x / rect.width) * (rows.length - 1)), 0, rows.length - 1);
  const row = rows[idx];
  const pension = amountForDisplay(row, row.pensionNet + row.spousePensionNet);
  const cpp = amountForDisplay(row, row.cppNet + row.spouseCppNet);
  const oas = amountForDisplay(row, row.oasNet + row.spouseOasNet);
  const netW = amountForDisplay(row, row.netFromWithdrawal);
  const taxW = amountForDisplay(row, row.taxOnWithdrawal + row.oasClawback);
  const spend = amountForDisplay(row, row.spending);
  hoverEl.innerHTML = `
    <strong>Age ${row.age}</strong><br>
    Pension: ${formatCurrency(pension)}<br>
    CPP: ${formatCurrency(cpp)}<br>
    OAS: ${formatCurrency(oas)}<br>
    Net withdrawal: ${formatCurrency(netW)}<br>
    Tax wedge (tax + clawback): ${formatCurrency(taxW)}<br>
    Spending target: ${formatCurrency(spend)}
  `;
  hoverEl.hidden = false;
  hoverEl.style.left = `${clamp(x + 10, 8, rect.width - 220)}px`;
  hoverEl.style.top = "8px";
}

export function renderBalanceHover(event, {
  model,
  chartEl,
  hoverEl,
  formatCurrency,
  clamp,
}) {
  if (!model || !chartEl || !hoverEl) return;
  const rows = model.base.rows;
  if (!rows.length) return;
  const rect = chartEl.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const idx = clamp(Math.round((x / rect.width) * (rows.length - 1)), 0, rows.length - 1);
  const row = rows[idx];
  hoverEl.innerHTML = `<strong>Age ${row.age}</strong><br>Balance: ${formatCurrency(row.balance)}`;
  hoverEl.hidden = false;
  hoverEl.style.left = `${clamp(x + 10, 8, rect.width - 190)}px`;
  hoverEl.style.top = "8px";
}
