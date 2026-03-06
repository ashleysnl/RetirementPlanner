export function buildClientSummaryData({ plan, model, selectedAge, rows, phases, risks }) {
  const allRows = Array.isArray(rows) && rows.length
    ? rows
    : (model?.base?.rows || []).filter((r) => r.age >= Number(plan.profile.retirementAge || 65));
  if (!allRows.length) return null;

  const fallbackAge = Number(plan.profile.retirementAge || allRows[0].age);
  const current = allRows.find((r) => Number(r.age) === Number(selectedAge))
    || allRows.find((r) => Number(r.age) === fallbackAge)
    || allRows[0];

  const guaranteed = Number(current.guaranteedNet || 0);
  const spending = Number(current.spending || 0);
  const netGap = Math.max(0, Number(current.netGap || 0));
  const grossWithdrawal = Math.max(0, Number(current.withdrawal || 0));
  const taxWedge = Math.max(0, Number((current.taxOnWithdrawal || 0) + (current.oasClawback || 0)));
  const netSpendingAvailable = Math.max(0, guaranteed + Math.max(0, Number(current.netFromWithdrawal || 0)));
  const coverageRatio = spending > 0 ? guaranteed / spending : 1;

  const depletionAge = model?.kpis?.depletionAge || null;
  const rrifPhaseAge = plan.strategy.applyRrifMinimums
    ? Number(plan.strategy.rrifConversionAge || 71)
    : null;
  const clawbackRisk = risks?.find((r) => r.key === "clawback") || null;

  return {
    selected: current,
    metrics: {
      spending,
      guaranteed,
      netGap,
      grossWithdrawal,
      taxWedge,
      netSpendingAvailable,
      coverageRatio,
      effectiveRate: Number(current.effectiveTaxRate || 0),
    },
    warnings: {
      depletionAge,
      hasRrifPressure: Boolean(rrifPhaseAge && Number(current.age) >= rrifPhaseAge && Number(current.rrifMinimum || 0) > 0),
      clawbackSeverity: clawbackRisk?.severity || "Low",
      clawbackAmount: Number(current.oasClawback || 0),
    },
    phases: Array.isArray(phases) ? phases : [],
  };
}
