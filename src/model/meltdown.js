function rowAt(rows, age) {
  return rows.find((r) => r.age === age) || null;
}

export function buildMeltdownComparison(model, plan) {
  const withRows = model?.base?.rows || [];
  const baseRows = model?.baseNoMeltdown?.rows || withRows;
  const startAge = Number(plan.profile.retirementAge || 65);
  const age71With = rowAt(withRows, 71);
  const age71Base = rowAt(baseRows, 71);

  const withRetirementRows = withRows.filter((r) => r.age >= startAge);
  const baseRetirementRows = baseRows.filter((r) => r.age >= startAge);

  const sum = (rows, key) => rows.reduce((acc, r) => acc + Number(r[key] || 0), 0);
  const maxRate = (rows) => rows.reduce((m, r) => Math.max(m, Number(r.effectiveTaxRate || 0)), 0);

  const baseClawback = sum(baseRetirementRows, "oasClawback");
  const withClawback = sum(withRetirementRows, "oasClawback");
  const baseTax = sum(baseRetirementRows, "tax");
  const withTax = sum(withRetirementRows, "tax");

  return {
    enabled: Boolean(plan.strategy.meltdownEnabled),
    before: {
      peakEffectiveTax: maxRate(baseRetirementRows),
      totalClawback: baseClawback,
      totalTax: baseTax,
      rrifShockAt71: age71Base ? age71Base.rrifMinimum : 0,
      depletionAge: model?.baseNoMeltdown?.kpis?.depletionAge ?? model?.kpis?.depletionAge ?? null,
    },
    after: {
      peakEffectiveTax: maxRate(withRetirementRows),
      totalClawback: withClawback,
      totalTax: withTax,
      rrifShockAt71: age71With ? age71With.rrifMinimum : 0,
      depletionAge: model?.kpis?.depletionAge ?? null,
    },
  };
}

