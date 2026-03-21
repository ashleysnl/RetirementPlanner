function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function computeCoverageScore(plan, model) {
  const rows = model?.base?.rows || [];
  const retireAge = Number(plan.profile.retirementAge || 65);
  const lifeExpectancy = Number(plan.profile.lifeExpectancy || 90);
  const firstRet = rows.find((r) => r.age === retireAge) || rows[0];
  const retirementRows = rows.filter((r) => r.age >= retireAge);
  const row70 = rows.find((r) => r.age === 70) || firstRet;
  const row71 = rows.find((r) => r.age === 71) || firstRet;

  const coverageRatio = firstRet?.spending > 0 ? firstRet.guaranteedNet / firstRet.spending : 1;
  const coveragePoints = clamp(coverageRatio, 0, 1) * 35;

  const depletionAge = model?.kpis?.depletionAge;
  const longevityRatio = depletionAge
    ? (depletionAge - retireAge) / Math.max(1, lifeExpectancy - retireAge)
    : 1;
  const longevityPoints = clamp(longevityRatio, 0, 1) * 30;

  const avgTaxWedgeRate = retirementRows.length
    ? retirementRows.reduce((sum, r) => {
      const gross = Number(r.withdrawal || 0);
      const wedge = Number((r.taxOnWithdrawal || 0) + (r.oasClawback || 0));
      return sum + (gross > 0 ? wedge / gross : 0);
    }, 0) / retirementRows.length
    : 0;
  const taxEfficiencyPoints = clamp(1 - (avgTaxWedgeRate / 0.45), 0, 1) * 15;

  const oasTotal = retirementRows.reduce((sum, r) => sum + (r.oas || 0) + (r.spouseOas || 0), 0);
  const clawbackTotal = retirementRows.reduce((sum, r) => sum + (r.oasClawback || 0), 0);
  const clawbackRatio = oasTotal > 0 ? clawbackTotal / oasTotal : 0;
  const clawbackPoints = plan.strategy.oasClawbackModeling
    ? clamp(1 - (clawbackRatio / 0.5), 0, 1) * 10
    : 10;

  const rrifShockJump = Math.max(0, Number(row71?.taxableIncome || 0) - Number(row70?.taxableIncome || 0));
  const rrifShockPoints = plan.strategy.applyRrifMinimums
    ? clamp(1 - (rrifShockJump / 50000), 0, 1) * 10
    : 10;

  const total = Math.round(coveragePoints + longevityPoints + taxEfficiencyPoints + clawbackPoints + rrifShockPoints);

  let band = "Very Strong";
  if (total < 60) band = "Needs Attention";
  else if (total < 75) band = "Moderate";
  else if (total < 90) band = "Strong";

  return {
    total,
    band,
    subs: {
      coverage: Math.round(coveragePoints), // /35
      longevity: Math.round(longevityPoints), // /30
      taxDrag: Math.round(taxEfficiencyPoints), // /15
      clawback: Math.round(clawbackPoints), // /10
      rrifShock: Math.round(rrifShockPoints), // /10
    },
    metrics: {
      coverageRatio,
      depletionAge: depletionAge || null,
      avgTaxWedgeRate,
      clawbackRatio,
      rrifShockJump,
    },
  };
}
