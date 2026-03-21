import { computeCoverageScore } from "./score.js";
import { buildRiskDiagnostics } from "./risks.js";

export const PLAN_STATUS_THRESHOLDS = {
  strongScore: 85,
  mostlyOnTrackScore: 72,
  tightScore: 58,
  strongCoverage: 1,
  workableCoverage: 0.9,
  tightCoverage: 0.75,
  highTaxDrag: 0.28,
};

function firstRetirementRow(plan, model) {
  const rows = model?.base?.rows || [];
  return rows.find((row) => row.age === plan.profile.retirementAge) || rows[0] || null;
}

function peakClawback(rows) {
  return (rows || []).reduce((max, row) => Math.max(max, Number(row.oasClawback || 0)), 0);
}

function avgTaxDrag(rows) {
  const retirementRows = (rows || []).filter((row) => row.age != null);
  if (!retirementRows.length) return 0;
  return retirementRows.reduce((sum, row) => {
    const gross = Number(row.withdrawal || 0);
    const wedge = Number((row.taxOnWithdrawal || 0) + (row.oasClawback || 0));
    return sum + (gross > 0 ? wedge / gross : 0);
  }, 0) / retirementRows.length;
}

export function buildPlanStatus(plan, model) {
  const score = computeCoverageScore(plan, model);
  const row = firstRetirementRow(plan, model);
  const rows = (model?.base?.rows || []).filter((r) => r.age >= plan.profile.retirementAge);
  const coverageRatio = score.metrics.coverageRatio || 0;
  const depletionAge = model?.kpis?.depletionAge || null;
  const worst = (model?.scenarioRows || []).find((item) => item.label === "Worst") || null;
  const taxDrag = avgTaxDrag(rows);
  const clawbackPeak = peakClawback(rows);
  const risks = buildRiskDiagnostics(plan, model, row?.age || plan.profile.retirementAge);
  const biggestRisk = risks.find((risk) => risk.severity === "High")
    || risks.find((risk) => risk.severity === "Medium")
    || risks[0]
    || null;

  let status = "Mostly On Track";
  let summary = "Your plan appears broadly workable under the current assumptions, with some areas worth reviewing.";

  if (coverageRatio >= PLAN_STATUS_THRESHOLDS.strongCoverage && !depletionAge && score.total >= PLAN_STATUS_THRESHOLDS.strongScore) {
    status = taxDrag >= PLAN_STATUS_THRESHOLDS.highTaxDrag
      ? "Strong but Tax-Inefficient"
      : clawbackPeak > 0
        ? "Sustainable but Clawback Exposure"
        : "On Track";
    summary = taxDrag >= PLAN_STATUS_THRESHOLDS.highTaxDrag
      ? "Your plan looks sustainable, but taxes reduce flexibility more than necessary under the current withdrawal pattern."
      : clawbackPeak > 0
        ? "Your plan looks sustainable, but later-income levels appear high enough to create OAS clawback exposure."
        : "Your current assumptions support retirement spending and portfolio longevity reasonably well.";
  } else if (coverageRatio >= PLAN_STATUS_THRESHOLDS.workableCoverage && score.total >= PLAN_STATUS_THRESHOLDS.mostlyOnTrackScore) {
    status = "Mostly On Track";
    summary = "Your current plan appears broadly workable, but later-life taxes, withdrawals, or stress outcomes deserve a review.";
  } else if (coverageRatio >= PLAN_STATUS_THRESHOLDS.tightCoverage && score.total >= PLAN_STATUS_THRESHOLDS.tightScore) {
    status = "Tight / Needs Review";
    summary = "The plan may work, but it relies on narrower assumptions or meaningful savings withdrawals to stay on course.";
  } else {
    status = "Shortfall Likely";
    summary = "The current assumptions likely create a funding gap, early depletion, or both unless something changes.";
  }

  const keyDrivers = [
    `How much of your target income is covered: ${Math.round(coverageRatio * 100)}%`,
    depletionAge ? `Savings last to about age ${depletionAge}` : `Savings project beyond age ${plan.profile.lifeExpectancy}`,
    clawbackPeak > 0
      ? `Peak OAS clawback estimate: $${Math.round(clawbackPeak).toLocaleString()}`
      : `Average tax drag on withdrawals: ${Math.round(taxDrag * 100)}%`,
  ];

  let nextBestAction = {
    label: "Compare scenarios",
    detail: "Test a later retirement age, lower spending, or alternate withdrawal strategy.",
    action: "open-scenario-compare",
  };

  if (biggestRisk?.key === "clawback") {
    nextBestAction = {
      label: "Use the OAS Clawback Calculator",
      detail: "Look at the clawback issue directly, then bring that learning back into the full planner.",
      href: "./oas-clawback-calculator.html",
    };
  } else if (biggestRisk?.key === "rrif") {
    nextBestAction = {
      label: "Use the RRIF Withdrawal Calculator",
      detail: "Review how required withdrawals may change taxes and income later in retirement.",
      href: "./rrif-withdrawal-calculator.html",
    };
  } else if (biggestRisk?.key === "tax-drag") {
    nextBestAction = {
      label: "Review withdrawal strategy",
      detail: "Compare withdrawal order and earlier RRSP withdrawals to reduce drag.",
      action: "focus-meltdown-sim",
    };
  } else if (biggestRisk?.key === "depletion") {
    nextBestAction = {
      label: "Test a later retirement age",
      detail: "A later retirement date or lower spending target is usually the fastest way to improve sustainability.",
      action: "open-scenario-compare",
    };
  }

  return {
    status,
    summary,
    score,
    keyDrivers,
    biggestRisk,
    nextBestAction,
  };
}
