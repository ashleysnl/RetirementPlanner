import { RRIF_MIN_WITHDRAWAL, TAX_BRACKETS } from "./constants.js";

export function adjustedCPP(amountAt65, startAge) {
  const ageDiff = startAge - 65;
  if (ageDiff >= 0) return amountAt65 * (1 + ageDiff * 0.084);
  return amountAt65 * Math.max(0.58, 1 + ageDiff * 0.072);
}

export function adjustedOAS(amountAt65, startAge) {
  const safeAge = Math.max(65, startAge);
  const ageDiff = safeAge - 65;
  return amountAt65 * (1 + ageDiff * 0.072);
}

export function estimateOasClawback(plan, taxableIncome, oasAmount, yearOffset) {
  if (!oasAmount) return 0;
  const thresholdBase = 93000;
  const threshold = plan.assumptions.taxBracketInflation
    ? thresholdBase * Math.pow(1 + plan.assumptions.inflation, yearOffset)
    : thresholdBase;
  const excess = Math.max(0, taxableIncome - threshold);
  return Math.min(oasAmount, excess * 0.15);
}

export function estimateEffectiveTaxRate(plan, income, yearOffset) {
  const taxable = Math.max(0, income);
  if (taxable <= 0) return 0;

  const grossTax = estimateTotalTax(plan, taxable, yearOffset);
  const effective = grossTax / taxable;
  return clamp(effective, 0, 0.53);
}

export function estimateTotalTax(plan, income, yearOffset) {
  const taxable = Math.max(0, income);
  const federal = computeBracketTax(taxable, TAX_BRACKETS.federal, plan, yearOffset);
  const provincialBase = TAX_BRACKETS.provincial[plan.profile.province] || TAX_BRACKETS.provincial.NL;
  const provincial = computeBracketTax(taxable, provincialBase, plan, yearOffset);
  return federal + provincial;
}

export function solveGrossWithdrawal(plan, otherTaxableIncome, targetNetFromWithdrawal, yearOffset) {
  const target = Math.max(0, targetNetFromWithdrawal);
  if (target <= 0) return 0;
  const baseTax = estimateTotalTax(plan, otherTaxableIncome, yearOffset);
  let low = target;
  let high = target * 2 + 10000;

  for (let i = 0; i < 16; i += 1) {
    const taxable = otherTaxableIncome + high;
    const totalTax = estimateTotalTax(plan, taxable, yearOffset);
    const taxOnWithdrawal = Math.max(0, totalTax - baseTax);
    const net = high - taxOnWithdrawal;
    if (net >= target) break;
    high *= 1.6;
  }

  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    const taxable = otherTaxableIncome + mid;
    const totalTax = estimateTotalTax(plan, taxable, yearOffset);
    const taxOnWithdrawal = Math.max(0, totalTax - baseTax);
    const net = mid - taxOnWithdrawal;
    if (net >= target) high = mid;
    else low = mid;
  }

  return high;
}

export function getRrifMinimumRequired(plan, age, registeredBalance) {
  if (!plan.strategy.applyRrifMinimums) return 0;
  if (age < plan.strategy.rrifConversionAge) return 0;
  const factor = RRIF_MIN_WITHDRAWAL[age] ?? 0.2;
  return Math.max(0, registeredBalance) * factor;
}

function computeBracketTax(income, bracket, plan, yearOffset) {
  const inflationFactor = plan.assumptions.taxBracketInflation
    ? Math.pow(1 + plan.assumptions.inflation, yearOffset)
    : 1;

  const thresholds = bracket.thresholds.map((t) => t * inflationFactor);
  const rates = bracket.rates;

  let tax = 0;
  for (let i = 0; i < rates.length; i += 1) {
    const floor = thresholds[i];
    const ceiling = thresholds[i + 1] ?? Number.POSITIVE_INFINITY;
    const taxableInBand = Math.max(0, Math.min(income, ceiling) - floor);
    if (taxableInBand <= 0) continue;
    tax += taxableInBand * rates[i];
  }

  return tax;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
