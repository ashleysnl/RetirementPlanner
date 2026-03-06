function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function severityFromScore(score) {
  if (score >= 67) return "High";
  if (score >= 34) return "Medium";
  return "Low";
}

function rowAt(rows, age) {
  return (rows || []).find((r) => r.age === age) || null;
}

export function buildRiskDiagnostics(plan, model, selectedAge) {
  const rows = (model?.base?.rows || []).filter((r) => r.age >= plan.profile.retirementAge);
  if (!rows.length) return [];
  const selected = rowAt(rows, selectedAge) || rows[0];
  const risks = [];

  if (!plan.strategy.oasClawbackModeling) {
    risks.push({
      key: "clawback-off",
      title: "OAS clawback modeling is OFF",
      severity: "Medium",
      detail: "Turn it on to estimate potential OAS recovery tax in higher-income years.",
      learnLabel: "Learn OAS clawback",
      learnTarget: "learn",
      actionLabel: "Enable clawback",
      action: "enable-clawback",
    });
  } else {
    const peakClawback = rows.reduce((m, r) => Math.max(m, Number(r.oasClawback || 0)), 0);
    const oasAtSelected = Number((selected.oas || 0) + (selected.spouseOas || 0));
    const clawbackRatio = oasAtSelected > 0 ? Number(selected.oasClawback || 0) / oasAtSelected : 0;
    const score = clamp((peakClawback / 5000) * 100 + (clawbackRatio * 100), 0, 100);
    risks.push({
      key: "clawback",
      title: "OAS clawback risk",
      severity: severityFromScore(score),
      detail: `Selected year clawback: $${Math.round(selected.oasClawback || 0).toLocaleString()} | peak: $${Math.round(peakClawback).toLocaleString()}.`,
      learnLabel: "Learn OAS clawback",
      learnTarget: "learn",
      actionLabel: "Test CPP/OAS timing",
      action: "focus-timing-sim",
    });
  }

  if (!plan.strategy.applyRrifMinimums) {
    risks.push({
      key: "rrif-off",
      title: "RRIF minimum modeling is OFF",
      severity: "Medium",
      detail: "RRIF minimums can force withdrawals later in retirement and raise taxable income.",
      learnLabel: "Learn RRIF basics",
      learnTarget: "learn",
      actionLabel: "Enable RRIF rules",
      action: "enable-rrif",
    });
  } else {
    const convAge = Number(plan.strategy.rrifConversionAge || 71);
    const convRow = rowAt(rows, convAge);
    const prevRow = rowAt(rows, convAge - 1);
    const jump = Math.max(0, Number(convRow?.taxableIncome || 0) - Number(prevRow?.taxableIncome || 0));
    const rrifMin = Number(convRow?.rrifMinimum || 0);
    const baseSpend = Math.max(1, Number(convRow?.spending || selected.spending || 1));
    const shockRatio = rrifMin / baseSpend;
    const score = clamp((shockRatio * 100) + ((jump / 20000) * 100), 0, 100);
    risks.push({
      key: "rrif",
      title: "RRIF shock at conversion age",
      severity: severityFromScore(score),
      detail: `Age ${convAge} RRIF minimum: $${Math.round(rrifMin).toLocaleString()} | taxable income jump: $${Math.round(jump).toLocaleString()}.`,
      learnLabel: "Learn RRIF minimums",
      learnTarget: "learn",
      actionLabel: "Try RRSP meltdown",
      action: "focus-meltdown-sim",
    });
  }

  const gross = Number(selected.withdrawal || 0);
  const wedge = Number((selected.taxOnWithdrawal || 0) + (selected.oasClawback || 0));
  const wedgeRate = gross > 0 ? wedge / gross : 0;
  if (gross > 0) {
    risks.push({
      key: "tax-drag",
      title: "Tax drag risk",
      severity: wedgeRate > 0.3 ? "High" : (wedgeRate > 0.2 ? "Medium" : "Low"),
      detail: `Tax wedge rate this year: ${(wedgeRate * 100).toFixed(1)}% of gross withdrawals.`,
      learnLabel: "Learn gross vs net",
      learnTarget: "learn",
      actionLabel: "Review strategy",
      action: "open-advanced",
    });
  }

  const depletionAge = model?.kpis?.depletionAge;
  const yearsShort = depletionAge ? plan.profile.lifeExpectancy - depletionAge : 0;
  if (depletionAge && yearsShort > 0) {
    risks.push({
      key: "depletion",
      title: "Longevity / depletion risk",
      severity: yearsShort >= 5 ? "High" : "Medium",
      detail: `Savings deplete around age ${depletionAge}, about ${yearsShort} years before life expectancy.`,
      learnLabel: "Learn longevity planning",
      learnTarget: "learn",
      actionLabel: "Run stress test",
      action: "open-stress",
    });
  } else {
    risks.push({
      key: "depletion-buffer",
      title: "Longevity buffer",
      severity: "Low",
      detail: "Projected savings last through the full planning horizon under current assumptions.",
      learnLabel: "Learn stress testing",
      learnTarget: "learn",
      actionLabel: "Run stress test",
      action: "open-stress",
    });
  }

  const dependency = selected.spending > 0 ? (selected.netFromWithdrawal || 0) / selected.spending : 0;
  if (dependency > 0.5) {
    risks.push({
      key: "concentration",
      title: "Income concentration risk",
      severity: dependency > 0.75 ? "High" : "Medium",
      detail: `${Math.round(dependency * 100)}% of spending is funded by savings withdrawals in the selected year.`,
      learnLabel: "Learn income sources",
      learnTarget: "learn",
      actionLabel: "Adjust income timing",
      action: "focus-timing-sim",
    });
  }

  return risks.slice(0, 6);
}

