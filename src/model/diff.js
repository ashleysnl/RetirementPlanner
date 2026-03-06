function rowAt(rows, age) {
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows.find((r) => r.age === age) || rows[0];
}

function formatDelta(value) {
  const n = Number(value || 0);
  if (Math.abs(n) < 0.5) return "$0";
  if (n > 0) return `+$${Math.round(n).toLocaleString()}`;
  return `-$${Math.abs(Math.round(n)).toLocaleString()}`;
}

function formatYearDelta(value) {
  const n = Number(value || 0);
  if (n > 0) return `+${n} years`;
  if (n < 0) return `${n} years`;
  return "no change";
}

export function buildChangeSummary(beforeModel, afterModel, plan) {
  if (!beforeModel || !afterModel) return null;
  const retirementAge = Number(plan.profile.retirementAge || 65);
  const before65 = rowAt(beforeModel.base.rows, 65);
  const after65 = rowAt(afterModel.base.rows, 65);
  const before71 = rowAt(beforeModel.base.rows, 71);
  const after71 = rowAt(afterModel.base.rows, 71);

  const depletionBefore = beforeModel.kpis.depletionAge || null;
  const depletionAfter = afterModel.kpis.depletionAge || null;
  const depletionDelta = (depletionAfter != null && depletionBefore != null)
    ? depletionAfter - depletionBefore
    : null;
  const beforeRows = beforeModel.base.rows.filter((r) => r.age >= retirementAge);
  const afterRows = afterModel.base.rows.filter((r) => r.age >= retirementAge);
  const sum = (rows, key) => rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
  const peak = (rows, key) => rows.reduce((max, row) => Math.max(max, Number(row[key] || 0)), 0);
  const beforeClawbackPeak = peak(beforeRows, "oasClawback");
  const afterClawbackPeak = peak(afterRows, "oasClawback");
  const beforeCoverage = before65?.spending > 0 ? (before65.guaranteedNet / before65.spending) : 1;
  const afterCoverage = after65?.spending > 0 ? (after65.guaranteedNet / after65.spending) : 1;
  const beforeWedge = Number((before65?.taxOnWithdrawal || 0) + (before65?.oasClawback || 0));
  const afterWedge = Number((after65?.taxOnWithdrawal || 0) + (after65?.oasClawback || 0));

  return {
    title: "What changed?",
    bullets: [
      `OAS clawback at age 65: ${formatDelta((after65?.oasClawback || 0) - (before65?.oasClawback || 0))}; peak clawback: ${formatDelta(afterClawbackPeak - beforeClawbackPeak)}.`,
      `Gross withdrawal at age 65: ${formatDelta((after65?.withdrawal || 0) - (before65?.withdrawal || 0))}.`,
      `Tax wedge at age 65: ${formatDelta(afterWedge - beforeWedge)}.`,
      `RRIF minimum at age 71: ${formatDelta((after71?.rrifMinimum || 0) - (before71?.rrifMinimum || 0))}.`,
      `Coverage at age 65: ${((afterCoverage - beforeCoverage) * 100).toFixed(1)} percentage points.`,
      depletionDelta == null
        ? `Depletion age changed from ${depletionBefore ?? "none"} to ${depletionAfter ?? "none"}.`
        : `Depletion age: ${formatYearDelta(depletionDelta)}.`,
    ],
    before: {
      age65: {
        gross: before65?.withdrawal || 0,
        tax: before65?.tax || 0,
        wedge: beforeWedge,
        clawback: before65?.oasClawback || 0,
        coverage: beforeCoverage,
      },
      age71: {
        rrifMinimum: before71?.rrifMinimum || 0,
      },
      retirementTaxTotal: sum(beforeRows, "tax"),
      depletionAge: depletionBefore,
    },
    after: {
      age65: {
        gross: after65?.withdrawal || 0,
        tax: after65?.tax || 0,
        wedge: afterWedge,
        clawback: after65?.oasClawback || 0,
        coverage: afterCoverage,
      },
      age71: {
        rrifMinimum: after71?.rrifMinimum || 0,
      },
      retirementTaxTotal: sum(afterRows, "tax"),
      depletionAge: depletionAfter,
    },
    createdAt: Date.now(),
  };
}
