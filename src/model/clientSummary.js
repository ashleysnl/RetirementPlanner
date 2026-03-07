import { getReportMetrics } from "./reportMetrics.js";

export function buildClientSummaryData({ plan, model, selectedAge, rows, phases, risks }) {
  const allRows = Array.isArray(rows) && rows.length
    ? rows
    : (model?.base?.rows || []).filter((r) => r.age >= Number(plan.profile.retirementAge || 65));
  if (!allRows.length) return null;

  const fallbackAge = Number(plan.profile.retirementAge || allRows[0].age);
  const current = allRows.find((r) => Number(r.age) === Number(selectedAge))
    || allRows.find((r) => Number(r.age) === fallbackAge)
    || allRows[0];

  const report = getReportMetrics(plan, current);

  const depletionAge = model?.kpis?.depletionAge || null;
  const rrifPhaseAge = plan.strategy.applyRrifMinimums
    ? Number(plan.strategy.rrifConversionAge || 71)
    : null;
  const clawbackRisk = risks?.find((r) => r.key === "clawback") || null;

  return {
    selected: current,
    metrics: {
      spending: report.spending,
      guaranteed: report.guaranteedNet,
      guaranteedGross: report.guaranteedGross,
      netGap: report.netGap,
      grossWithdrawal: report.grossWithdrawal,
      taxWedge: report.dragAmount,
      incomeTax: report.incomeTax,
      clawback: report.clawback,
      netSpendingAvailable: report.totalSpendable,
      coverageRatio: report.coverageRatio,
      effectiveRate: report.effectiveTaxRate,
      estimateTaxes: report.estimateTaxes,
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
