function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function computeCoverageScore(plan, model) {
  const rows = model?.base?.rows || [];
  const retireAge = Number(plan.profile.retirementAge || 65);
  const lifeExpectancy = Number(plan.profile.lifeExpectancy || 90);
  const firstRet = rows.find((r) => r.age === retireAge) || rows[0];
  const retirementRows = rows.filter((r) => r.age >= retireAge);

  const coverageRatio = firstRet?.spending > 0 ? firstRet.guaranteedNet / firstRet.spending : 1;
  const coveragePoints = clamp(coverageRatio, 0, 1) * 40;

  const depletionAge = model?.kpis?.depletionAge;
  const longevityRatio = depletionAge
    ? (depletionAge - retireAge) / Math.max(1, lifeExpectancy - retireAge)
    : 1;
  const longevityPoints = clamp(longevityRatio, 0, 1) * 30;

  const avgEffectiveTaxRate = retirementRows.length
    ? retirementRows.reduce((sum, r) => sum + (r.effectiveTaxRate || 0), 0) / retirementRows.length
    : 0;
  const taxEfficiencyPoints = clamp(1 - (avgEffectiveTaxRate / 0.45), 0, 1) * 20;

  const oasTotal = retirementRows.reduce((sum, r) => sum + (r.oas || 0) + (r.spouseOas || 0), 0);
  const clawbackTotal = retirementRows.reduce((sum, r) => sum + (r.oasClawback || 0), 0);
  const clawbackRatio = oasTotal > 0 ? clawbackTotal / oasTotal : 0;
  const clawbackPoints = plan.strategy.oasClawbackModeling
    ? clamp(1 - (clawbackRatio / 0.5), 0, 1) * 10
    : 10;

  const total = Math.round(coveragePoints + longevityPoints + taxEfficiencyPoints + clawbackPoints);

  let band = "On track";
  if (total < 60) band = "Significant gap";
  else if (total < 80) band = "Moderate gap";

  return {
    total,
    band,
    subs: {
      coverage: Math.round(coveragePoints),
      longevity: Math.round(longevityPoints),
      taxEfficiency: Math.round(taxEfficiencyPoints),
      clawback: Math.round(clawbackPoints),
    },
    metrics: {
      coverageRatio,
      depletionAge: depletionAge || null,
      avgEffectiveTaxRate,
      clawbackRatio,
    },
  };
}

