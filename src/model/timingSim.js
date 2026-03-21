function rowAt(rows, age) {
  return rows.find((r) => r.age === age) || rows[0] || null;
}

function cumulativeBenefit(rows, keyA, keyB = null) {
  return rows.reduce((sum, row) => {
    const a = Number(row[keyA] || 0);
    const b = keyB ? Number(row[keyB] || 0) : 0;
    return sum + a + b;
  }, 0);
}

export function buildTimingPreview({ plan, sim, buildModel }) {
  const baseModel = buildModel(plan);
  const previewPlan = (typeof structuredClone === "function")
    ? structuredClone(plan)
    : JSON.parse(JSON.stringify(plan));

  previewPlan.income.cpp.startAge = Number(sim.cppStartAge);
  previewPlan.income.oas.startAge = Number(sim.oasStartAge);
  if (sim.linkTiming) {
    const delta = Number(sim.cppStartAge) - 60;
    previewPlan.income.oas.startAge = Math.min(70, Math.max(65, 65 + delta));
  }

  const previewModel = buildModel(previewPlan);
  const retireAge = Number(plan.profile.retirementAge || 65);
  const baseRow = rowAt(baseModel.base.rows, retireAge);
  const previewRow = rowAt(previewModel.base.rows, retireAge);

  const baseRows = baseModel.base.rows.filter((r) => r.age >= retireAge);
  const previewRows = previewModel.base.rows.filter((r) => r.age >= retireAge);

  const baseLifetimeBenefits = cumulativeBenefit(baseRows, "cpp", "oas");
  const previewLifetimeBenefits = cumulativeBenefit(previewRows, "cpp", "oas");

  return {
    plan: previewPlan,
    model: previewModel,
    deltas: {
      lifetimeBenefits: previewLifetimeBenefits - baseLifetimeBenefits,
      effectiveTaxAtRetire: (previewRow?.effectiveTaxRate || 0) - (baseRow?.effectiveTaxRate || 0),
      clawbackAtRetire: (previewRow?.oasClawback || 0) - (baseRow?.oasClawback || 0),
      grossWithdrawalAtRetire: (previewRow?.withdrawal || 0) - (baseRow?.withdrawal || 0),
    },
    baseRow,
    previewRow,
  };
}

