function hasRow(rows, age) {
  return rows.some((row) => row.age === age);
}

export function buildRetirementPhases(plan, rows) {
  const retireAge = Number(plan.profile.retirementAge || 65);
  const lastAge = rows.length ? rows[rows.length - 1].age : retireAge;
  const cppAge = Number(plan.income.cpp.startAge || 65);
  const oasAge = Number(plan.income.oas.startAge || 65);
  const rrifAge = plan.strategy.applyRrifMinimums
    ? Number(plan.strategy.rrifConversionAge || 71)
    : null;

  const firstTransition = Math.min(
    ...[cppAge, oasAge, rrifAge].filter((x) => Number.isFinite(x) && x > retireAge)
  );
  const earlyEnd = Number.isFinite(firstTransition) ? firstTransition - 1 : lastAge;

  const bothBenefitsAge = Math.max(cppAge, oasAge);
  const middleStart = Math.max(retireAge, bothBenefitsAge);
  const middleEnd = rrifAge && rrifAge > middleStart ? rrifAge - 1 : null;

  const phases = [];
  if (earlyEnd >= retireAge && hasRow(rows, retireAge)) {
    phases.push({
      key: "early",
      label: "Early Retirement",
      startAge: retireAge,
      endAge: Math.min(earlyEnd, lastAge),
      why: "Bridge years before full government benefits and/or RRIF minimums.",
    });
  }

  if (middleEnd != null && middleEnd >= middleStart && hasRow(rows, middleStart)) {
    phases.push({
      key: "benefits",
      label: "CPP + OAS Phase",
      startAge: middleStart,
      endAge: Math.min(middleEnd, lastAge),
      why: "CPP and OAS are both active, often reducing withdrawal pressure.",
    });
  }

  if (rrifAge != null && hasRow(rows, rrifAge)) {
    phases.push({
      key: "rrif",
      label: "RRIF Minimum Phase",
      startAge: rrifAge,
      endAge: lastAge,
      why: "Minimum RRIF withdrawals can increase taxable income and tax drag.",
    });
  }

  return phases.filter((p) => p.endAge >= p.startAge);
}

