function rowAt(rows, age) {
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows.find((r) => r.age === age) || rows[0];
}

function formatDelta(value) {
  const n = Number(value || 0);
  if (n > 0) return `+${n}`;
  return `${n}`;
}

export function buildChangeSummary(beforeModel, afterModel, plan) {
  if (!beforeModel || !afterModel) return null;
  const retirementAge = Number(plan.profile.retirementAge || 65);
  const before65 = rowAt(beforeModel.base.rows, 65);
  const after65 = rowAt(afterModel.base.rows, 65);
  const beforeRet = rowAt(beforeModel.base.rows, retirementAge);
  const afterRet = rowAt(afterModel.base.rows, retirementAge);

  const depletionBefore = beforeModel.kpis.depletionAge || null;
  const depletionAfter = afterModel.kpis.depletionAge || null;
  const depletionDelta = (depletionAfter != null && depletionBefore != null)
    ? depletionAfter - depletionBefore
    : null;

  return {
    title: "What changed?",
    bullets: [
      `OAS clawback changed by ${formatDelta(Math.round((after65?.oasClawback || 0) - (before65?.oasClawback || 0)))} at age 65.`,
      `Gross withdrawals changed by ${formatDelta(Math.round((after65?.withdrawal || 0) - (before65?.withdrawal || 0)))} at age 65.`,
      `Estimated taxes changed by ${formatDelta(Math.round((after65?.tax || 0) - (before65?.tax || 0)))} at age 65.`,
      `RRIF minimum changed by ${formatDelta(Math.round((after65?.rrifMinimum || 0) - (before65?.rrifMinimum || 0)))} at age 65.`,
      depletionDelta == null
        ? `Depletion age changed from ${depletionBefore ?? "none"} to ${depletionAfter ?? "none"}.`
        : `Depletion age changed by ${formatDelta(depletionDelta)} years.`,
    ],
    before: {
      retirement: {
        gross: beforeRet?.withdrawal || 0,
        tax: beforeRet?.tax || 0,
      },
      age65: {
        gross: before65?.withdrawal || 0,
        tax: before65?.tax || 0,
        clawback: before65?.oasClawback || 0,
      },
      depletionAge: depletionBefore,
    },
    after: {
      retirement: {
        gross: afterRet?.withdrawal || 0,
        tax: afterRet?.tax || 0,
      },
      age65: {
        gross: after65?.withdrawal || 0,
        tax: after65?.tax || 0,
        clawback: after65?.oasClawback || 0,
      },
      depletionAge: depletionAfter,
    },
    createdAt: Date.now(),
  };
}

