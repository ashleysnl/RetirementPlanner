export function getOasRiskLevel(amount) {
  const value = Math.max(0, Number(amount || 0));
  if (value < 500) return { label: "Low", className: "risk-low" };
  if (value < 3000) return { label: "Med", className: "risk-med" };
  return { label: "High", className: "risk-high" };
}

export function amountForDisplay(row, amount, { showTodaysDollars, currentYear, inflationRate }) {
  if (!showTodaysDollars) return amount;
  const yearsFromNow = Math.max(0, row.year - currentYear);
  return amount / Math.pow(1 + inflationRate, yearsFromNow);
}

export function findRowByAge(rows, age) {
  if (!rows.length) return null;
  const exact = rows.find((row) => row.age === age);
  if (exact) return exact;
  let best = rows[0];
  let bestDistance = Math.abs(best.age - age);
  for (const row of rows) {
    const d = Math.abs(row.age - age);
    if (d < bestDistance) {
      best = row;
      bestDistance = d;
    }
  }
  return best;
}

export function findFirstRetirementRow(rows, retirementAge) {
  return rows.find((row) => row.age >= retirementAge) || rows[0] || null;
}

export function getBalanceLegendItems(showStressBand) {
  const items = [["Portfolio balance", "#0f6abf"]];
  if (showStressBand) items.push(["Stress band (best/worst)", "#7aa7d8"]);
  return items;
}

export function getCoverageLegendItems() {
  return [
    ["Guaranteed income: Pension", "#f59e0b"],
    ["Guaranteed income: CPP", "#16a34a"],
    ["Guaranteed income: OAS", "#0ea5a8"],
    ["From savings: RRSP/RRIF withdrawal (net)", "#0f6abf"],
    ["Tax on withdrawal + clawback (drag)", "#d9485f"],
    ["After-tax spending target", "#111827"],
  ];
}

export function buildNextActions(model, advancedUnlocked) {
  const actions = [];
  if (model.kpis.firstYearGap < 0) {
    actions.push("Test a later retirement age or a lower spending target first.");
    actions.push("If the gap still remains, increase annual savings or add more guaranteed income.");
  } else {
    actions.push("Your base case looks workable. Pressure-test it with the stress check before relying on it.");
  }

  if (model.kpis.depletionAge) {
    actions.push(`Savings deplete at age ${model.kpis.depletionAge}. Compare lower spending, later retirement, or stronger income timing.`);
  } else {
    actions.push("Savings remain through the planning horizon under the base assumptions.");
  }

  actions.push("Use the niche calculators when you want to go deeper on one issue, then bring the result back into the full planner.");
  if (!advancedUnlocked) actions.push("Finish guided setup to unlock tax-aware strategy comparisons and advanced assumptions.");
  return actions;
}
