import { TAX_BRACKETS } from "./constants.js";

function computeBracketTax(income, bracket, inflation, yearOffset, inflateBrackets) {
  const inflationFactor = inflateBrackets ? Math.pow(1 + inflation, yearOffset) : 1;
  const thresholds = bracket.thresholds.map((t) => t * inflationFactor);
  let tax = 0;
  for (let i = 0; i < bracket.rates.length; i += 1) {
    const floor = thresholds[i];
    const ceiling = thresholds[i + 1] ?? Number.POSITIVE_INFINITY;
    const taxableInBand = Math.max(0, Math.min(income, ceiling) - floor);
    if (taxableInBand > 0) tax += taxableInBand * bracket.rates[i];
  }
  return tax;
}

function causeLabel(row) {
  const reasons = [];
  if ((row.oasClawback || 0) > 0) reasons.push({ k: "clawback", v: row.oasClawback });
  if ((row.rrifMinimum || 0) > 0 && (row.withdrawal || 0) >= (row.rrifMinimum || 0)) reasons.push({ k: "rrif", v: row.rrifMinimum });
  if ((row.withdrawal || 0) > 35000) reasons.push({ k: "withdrawal", v: row.withdrawal });
  if ((row.pension || 0) + (row.cpp || 0) + (row.oas || 0) > 35000) reasons.push({ k: "overlap", v: (row.pension || 0) + (row.cpp || 0) + (row.oas || 0) });
  reasons.sort((a, b) => b.v - a.v);
  const top = reasons[0]?.k || "combination";
  if (top === "rrif") return "RRIF minimum withdrawals";
  if (top === "clawback") return "OAS clawback";
  if (top === "withdrawal") return "High registered withdrawals";
  if (top === "overlap") return "Pension + CPP/OAS overlap";
  return "Combination of income sources";
}

export function findPeakTaxYear(plan, model) {
  const rows = (model?.base?.rows || []).filter((r) => r.age >= plan.profile.retirementAge);
  if (!rows.length) return null;
  let best = rows[0];
  let bestTax = (best.tax || 0) + (best.oasClawback || 0);
  for (const row of rows) {
    const t = (row.tax || 0) + (row.oasClawback || 0);
    if (t > bestTax) {
      best = row;
      bestTax = t;
    }
  }
  const yearOffset = Math.max(0, best.year - new Date().getFullYear());
  const taxableIncome = Math.max(0, best.taxableIncome || 0);
  const federal = computeBracketTax(
    taxableIncome,
    TAX_BRACKETS.federal,
    plan.assumptions.inflation,
    yearOffset,
    plan.assumptions.taxBracketInflation
  );
  const provincialBracket = TAX_BRACKETS.provincial[plan.profile.province] || TAX_BRACKETS.provincial.NL;
  const provincial = computeBracketTax(
    taxableIncome,
    provincialBracket,
    plan.assumptions.inflation,
    yearOffset,
    plan.assumptions.taxBracketInflation
  );
  return {
    age: best.age,
    year: best.year,
    totalTax: (best.tax || 0) + (best.oasClawback || 0),
    federalTax: federal,
    provincialTax: provincial,
    clawback: best.oasClawback || 0,
    cause: causeLabel(best),
  };
}

