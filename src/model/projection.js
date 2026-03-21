import { APP, RISK_RETURNS } from "./constants.js";
import {
  adjustedCPP,
  adjustedOAS,
  estimateOasClawback,
  estimateEffectiveTaxRate,
  estimateTotalTax,
  solveGrossWithdrawal,
  getRrifMinimumRequired,
} from "./calculations.js";

export function buildPlanModel(plan) {
  const currentAge = currentAgeForPlan(plan);
  const baseReturn = getReturnRate(plan);
  const base = runSimpleProjection(plan, {
    returnRate: baseReturn,
    inflationRate: plan.assumptions.inflation,
    currentAge,
  });
  const baseNoMeltdown = runSimpleProjection(plan, {
    returnRate: baseReturn,
    inflationRate: plan.assumptions.inflation,
    currentAge,
    disableMeltdown: true,
  });

  const spread = plan.assumptions.scenarioSpread;
  const scenarioDefs = [
    { key: "best", label: "Best", returnRate: baseReturn + spread },
    { key: "base", label: "Base", returnRate: baseReturn },
    { key: "worst", label: "Worst", returnRate: Math.max(0.01, baseReturn - spread) },
  ];

  const scenarioRuns = scenarioDefs.map((def) => {
    const res = runSimpleProjection(plan, {
      returnRate: def.returnRate,
      inflationRate: plan.assumptions.inflation,
      currentAge,
    });
    return {
      key: def.key,
      label: def.label,
      returnRate: def.returnRate,
      balanceAtRetirement: res.kpis.balanceAtRetirement,
      depletionAge: res.kpis.depletionAge,
      firstYearGap: res.kpis.firstYearGap,
      rows: res.rows,
    };
  });

  const scenarioRows = scenarioRuns.map((row) => ({
    label: row.label,
    returnRate: row.returnRate,
    balanceAtRetirement: row.balanceAtRetirement,
    depletionAge: row.depletionAge,
    firstYearGap: row.firstYearGap,
  }));

  const best = scenarioRuns.find((x) => x.key === "best") || { rows: base.rows };
  const worst = scenarioRuns.find((x) => x.key === "worst") || { rows: base.rows };

  const stressMatrix = [];
  const returnShifts = [-0.02, 0, 0.02];
  const inflationShifts = [-0.01, 0, 0.01];
  for (const rShift of returnShifts) {
    for (const iShift of inflationShifts) {
      const r = Math.max(0.01, baseReturn + rShift);
      const inf = clamp(plan.assumptions.inflation + iShift, 0.005, 0.08);
      const res = runSimpleProjection(plan, {
        returnRate: r,
        inflationRate: inf,
        currentAge,
      });
      stressMatrix.push({
        returnShift: rShift,
        inflationShift: iShift,
        balanceAtRetirement: res.kpis.balanceAtRetirement,
        depletionAge: res.kpis.depletionAge,
        firstYearGap: res.kpis.firstYearGap,
      });
    }
  }

  const strategyComparisons = [
    runStrategyProjection(plan, "tax-smart", currentAge),
    runStrategyProjection(plan, "rrsp-first", currentAge),
    runStrategyProjection(plan, "tfsa-first", currentAge),
  ];

  const firstRet = base.rows.find((row) => row.age === plan.profile.retirementAge) || base.rows[0];
  const spouseCurrentIncome = plan.profile.hasSpouse && plan.income.spouse.enabled
    ? Math.max(0, plan.income.spouse.pensionAmount)
    : 0;
  const taxCurrentIncome = Math.max(0, plan.income.pension.enabled ? plan.income.pension.amount : 0) + spouseCurrentIncome;
  const taxRetIncome = Math.max(0, firstRet.taxableIncome);

  return {
    base,
    baseNoMeltdown,
    best,
    worst,
    scenarioRows,
    stressMatrix,
    strategyComparisons,
    tax: {
      currentEffectiveRate: estimateEffectiveTaxRate(plan, taxCurrentIncome, 0),
      firstRetirementEffectiveRate: estimateEffectiveTaxRate(plan, taxRetIncome, Math.max(0, plan.profile.retirementAge - currentAge)),
    },
    kpis: base.kpis,
  };
}

export function getReturnRate(plan) {
  const profile = plan.assumptions.riskProfile;
  return plan.assumptions.returns?.[profile]
    || plan.assumptions.returns?.balanced
    || RISK_RETURNS[profile]
    || RISK_RETURNS.balanced;
}

function runSimpleProjection(plan, options) {
  const currentAge = Number.isFinite(options.currentAge) ? options.currentAge : currentAgeForPlan(plan);
  const startYear = APP.currentYear;
  const endYear = startYear + Math.max(1, plan.profile.lifeExpectancy - currentAge);
  const retireAge = plan.profile.retirementAge;
  const birthYear = plan.profile.birthYear;
  const returnRate = options.returnRate;
  const inflationRate = options.inflationRate;
  const contributionIncrease = plan.savings.contributionIncrease;
  const disableMeltdown = Boolean(options.disableMeltdown);

  let balance = plan.savings.currentTotal;
  let depletionAge = null;
  let balanceAtRetirement = plan.savings.currentTotal;
  let totalRetirementTax = 0;

  const rows = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const age = year - birthYear;
    const retired = age >= retireAge;
    const yearsFromStart = Math.max(0, year - startYear);
    const capitalInject = getCapitalInjectAtAge(plan, age);
    const contribution = retired
      ? 0
      : plan.savings.annualContribution * Math.pow(1 + contributionIncrease, yearsFromStart);

    const pension = plan.income.pension.enabled && age >= plan.income.pension.startAge ? plan.income.pension.amount : 0;
    const cpp = age >= plan.income.cpp.startAge ? adjustedCPP(plan.income.cpp.amountAt65, plan.income.cpp.startAge) : 0;
    const oas = age >= plan.income.oas.startAge ? adjustedOAS(plan.income.oas.amountAt65, plan.income.oas.startAge) : 0;

    const spouseEnabled = plan.profile.hasSpouse && plan.income.spouse.enabled;
    const spousePension = spouseEnabled && age >= plan.income.spouse.pensionStartAge ? plan.income.spouse.pensionAmount : 0;
    const spouseCpp = spouseEnabled && age >= plan.income.spouse.cppStartAge ? adjustedCPP(plan.income.spouse.cppAmountAt65, plan.income.spouse.cppStartAge) : 0;
    const spouseOas = spouseEnabled && age >= plan.income.spouse.oasStartAge ? adjustedOAS(plan.income.spouse.oasAmountAt65, plan.income.spouse.oasStartAge) : 0;

    const guaranteedGross = pension + cpp + oas + spousePension + spouseCpp + spouseOas;

    const yearsFromRetirementStart = Math.max(0, age - retireAge);
    const targetAfterTax = retired
      ? inflateAmountToRetirement(plan.profile.desiredSpending, inflationRate, Math.max(0, retireAge - currentAge))
        * Math.pow(1 + inflationRate, yearsFromRetirementStart)
      : 0;

    let withdrawal = 0;
    let tax = 0;
    let taxableIncome = guaranteedGross;
    let guaranteedTax = 0;
    let guaranteedNet = guaranteedGross;
    let pensionNet = pension;
    let cppNet = cpp;
    let oasNet = oas;
    let spousePensionNet = spousePension;
    let spouseCppNet = spouseCpp;
    let spouseOasNet = spouseOas;
    let netFromWithdrawal = 0;
    let taxOnWithdrawal = 0;
    let netGap = 0;
    let oasClawback = 0;
    let rrifMinimum = 0;
    let plannedMeltdownWithdrawal = 0;
    let gap = 0;

    if (retired) {
      const yearOffset = Math.max(0, year - startYear);
      guaranteedTax = estimateTotalTax(plan, guaranteedGross, yearOffset);
      guaranteedNet = Math.max(0, guaranteedGross - guaranteedTax);
      const netFactor = guaranteedGross > 0 ? guaranteedNet / guaranteedGross : 1;
      pensionNet = pension * netFactor;
      cppNet = cpp * netFactor;
      oasNet = oas * netFactor;
      spousePensionNet = spousePension * netFactor;
      spouseCppNet = spouseCpp * netFactor;
      spouseOasNet = spouseOas * netFactor;
      netGap = Math.max(0, targetAfterTax - guaranteedNet);
      const requiredWithdrawal = solveGrossWithdrawal(plan, guaranteedGross, netGap, yearOffset);
      const availableForWithdrawal = Math.max(0, balance + capitalInject);
      rrifMinimum = getRrifMinimumRequired(plan, age, availableForWithdrawal);
      plannedMeltdownWithdrawal = disableMeltdown ? 0 : getPlannedMeltdownWithdrawal(plan, age, guaranteedGross, availableForWithdrawal);
      const baseNeed = Math.max(requiredWithdrawal, rrifMinimum);
      withdrawal = Math.min(baseNeed + plannedMeltdownWithdrawal, availableForWithdrawal);
      taxableIncome = guaranteedGross + withdrawal;
      tax = estimateTotalTax(plan, taxableIncome, yearOffset);
      taxOnWithdrawal = Math.max(0, tax - guaranteedTax);
      oasClawback = plan.strategy.oasClawbackModeling ? estimateOasClawback(plan, taxableIncome, oas + spouseOas, yearOffset) : 0;
      netFromWithdrawal = Math.max(0, withdrawal - taxOnWithdrawal - oasClawback);
      const netIncome = guaranteedNet + netFromWithdrawal;
      gap = netIncome - targetAfterTax;
      totalRetirementTax += tax + oasClawback;
    } else {
      tax = estimateTotalTax(plan, guaranteedGross, Math.max(0, year - startYear));
      guaranteedTax = tax;
      guaranteedNet = Math.max(0, guaranteedGross - guaranteedTax);
      const netFactor = guaranteedGross > 0 ? guaranteedNet / guaranteedGross : 1;
      pensionNet = pension * netFactor;
      cppNet = cpp * netFactor;
      oasNet = oas * netFactor;
      spousePensionNet = spousePension * netFactor;
      spouseCppNet = spouseCpp * netFactor;
      spouseOasNet = spouseOas * netFactor;
    }

    const preGrowth = retired
      ? Math.max(0, balance + capitalInject - withdrawal)
      : balance + contribution + capitalInject;
    balance = preGrowth * (1 + returnRate);

    if (!depletionAge && retired && preGrowth <= 0) depletionAge = age;
    if (age === retireAge) balanceAtRetirement = preGrowth;

    rows.push({
      year,
      age,
      balance,
      balanceStart: retired ? Math.max(0, preGrowth + withdrawal) : balance - contribution,
      contribution,
      capitalInject,
      withdrawal,
      spending: targetAfterTax,
      tax,
      taxableIncome,
      effectiveTaxRate: taxableIncome > 0 ? tax / taxableIncome : 0,
      pension,
      cpp,
      oas,
      spousePension,
      spouseCpp,
      spouseOas,
      pensionNet,
      cppNet,
      oasNet,
      spousePensionNet,
      spouseCppNet,
      spouseOasNet,
      guaranteedGross,
      guaranteedTax,
      guaranteedNet,
      netGap,
      netFromWithdrawal,
      taxOnWithdrawal,
      oasClawback,
      rrifMinimum,
      plannedMeltdownWithdrawal,
      gap,
    });
  }

  const firstRet = rows.find((row) => row.age === retireAge) || rows[0];
  const sustainableIncome = estimateSustainableIncome(rows, retireAge);

  const kpis = {
    balanceAtRetirement,
    firstYearGap: firstRet ? firstRet.gap : 0,
    depletionAge,
    firstYearGuaranteed: firstRet ? firstRet.guaranteedGross : 0,
    firstYearSpendingTarget: firstRet ? firstRet.spending : 0,
    firstYearNetGap: firstRet ? firstRet.netGap : 0,
    firstYearGrossWithdrawal: firstRet ? firstRet.withdrawal : 0,
    firstYearTaxWedge: firstRet ? firstRet.taxOnWithdrawal : 0,
    firstYearOasClawback: firstRet ? firstRet.oasClawback : 0,
    firstYearRrifMinimum: firstRet ? firstRet.rrifMinimum : 0,
    totalRetirementTax,
    firstRetirementBreakdown: {
      pension: firstRet ? firstRet.pension : 0,
      cpp: firstRet ? firstRet.cpp : 0,
      oas: firstRet ? firstRet.oas : 0,
      withdrawal: firstRet ? firstRet.withdrawal : 0,
    },
    sustainableIncome,
  };

  return { rows, kpis, returnRate };
}

function getPlannedMeltdownWithdrawal(plan, age, guaranteedGross, availableForWithdrawal) {
  if (!plan.strategy?.meltdownEnabled) return 0;
  const start = Number(plan.strategy.meltdownStartAge || plan.profile.retirementAge || 60);
  const end = Number(plan.strategy.meltdownEndAge || 65);
  if (age < start || age > end) return 0;
  let amount = Math.max(0, Number(plan.strategy.meltdownAmount || 0));
  const ceiling = Math.max(0, Number(plan.strategy.meltdownIncomeCeiling || 0));
  if (ceiling > 0) {
    amount = Math.max(0, Math.min(amount, ceiling - guaranteedGross));
  }
  return Math.min(amount, Math.max(0, availableForWithdrawal));
}

function runStrategyProjection(plan, strategyKey, currentAge) {
  const ageNowValue = Number.isFinite(currentAge) ? currentAge : currentAgeForPlan(plan);
  const retireAge = plan.profile.retirementAge;
  const deathAge = plan.profile.lifeExpectancy;
  const yearsToRetirement = Math.max(0, retireAge - ageNowValue);
  const returnRate = getReturnRate(plan);
  const inflationRate = plan.assumptions.inflation;

  const balances = growAccountsToRetirement(
    plan,
    plan.accounts,
    plan.savings.annualContribution,
    plan.savings.contributionIncrease,
    returnRate,
    yearsToRetirement
  );

  let totalTax = 0;
  let totalClawback = 0;
  let depletionAge = null;
  const snapshotsByAge = {};

  for (let age = retireAge; age <= deathAge; age += 1) {
    const yearOffset = Math.max(0, age - ageNowValue);
    const spend = inflateAmountToRetirement(plan.profile.desiredSpending, inflationRate, yearsToRetirement)
      * Math.pow(1 + inflationRate, Math.max(0, age - retireAge));

    const pension = plan.income.pension.enabled && age >= plan.income.pension.startAge ? plan.income.pension.amount : 0;
    const cpp = age >= plan.income.cpp.startAge ? adjustedCPP(plan.income.cpp.amountAt65, plan.income.cpp.startAge) : 0;
    const oas = age >= plan.income.oas.startAge ? adjustedOAS(plan.income.oas.amountAt65, plan.income.oas.startAge) : 0;
    const spouseEnabled = plan.profile.hasSpouse && plan.income.spouse.enabled;
    const spousePension = spouseEnabled && age >= plan.income.spouse.pensionStartAge ? plan.income.spouse.pensionAmount : 0;
    const spouseCpp = spouseEnabled && age >= plan.income.spouse.cppStartAge ? adjustedCPP(plan.income.spouse.cppAmountAt65, plan.income.spouse.cppStartAge) : 0;
    const spouseOas = spouseEnabled && age >= plan.income.spouse.oasStartAge ? adjustedOAS(plan.income.spouse.oasAmountAt65, plan.income.spouse.oasStartAge) : 0;
    const guaranteedGross = pension + cpp + oas + spousePension + spouseCpp + spouseOas;
    const capitalInject = getCapitalInjectAtAge(plan, age);
    if (capitalInject > 0) balances.cash += capitalInject;

    let guessNeed = Math.max(0, spend - guaranteedGross * (1 - estimateEffectiveTaxRate(plan, guaranteedGross, yearOffset)));
    let chosen = { rrsp: 0, tfsa: 0, nonRegistered: 0, cash: 0, total: 0 };
    let taxes = 0;
    let clawback = 0;

    for (let i = 0; i < 5; i += 1) {
      const order = getWithdrawalOrder(strategyKey, {
        balances,
        taxableBeforeWithdrawals: guaranteedGross,
        oas,
      });
      chosen = distributeFromAccounts(order, balances, guessNeed);
      const taxableDraw = chosen.rrsp + chosen.nonRegistered * 0.3;
      const taxableTotal = guaranteedGross + taxableDraw;
      taxes = taxableTotal * estimateEffectiveTaxRate(plan, taxableTotal, yearOffset);
      clawback = plan.strategy.oasClawbackModeling ? estimateOasClawback(plan, taxableTotal, oas, yearOffset) : 0;
      const net = guaranteedGross + chosen.total - taxes - clawback;
      const short = spend - net;
      if (Math.abs(short) < 10) break;
      guessNeed = Math.max(0, guessNeed + short);
      if (sumAccounts(balances) <= 0) break;
    }

    totalTax += taxes;
    totalClawback += clawback;

    if (age === retireAge || age === 65 || age === 71) {
      snapshotsByAge[age] = {
        age,
        guaranteedGross,
        spend,
        tax: taxes,
        clawback,
        accountWithdrawals: {
          rrsp: chosen.rrsp,
          tfsa: chosen.tfsa,
          nonRegistered: chosen.nonRegistered,
          cash: chosen.cash,
          total: chosen.total,
        },
      };
    }

    if (!depletionAge && sumAccounts(balances) <= 0) depletionAge = age;

    for (const key of Object.keys(balances)) {
      balances[key] *= 1 + returnRate;
    }
  }

  const reasons = strategyReasons(strategyKey);

  return {
    key: strategyKey,
    label: strategyLabel(strategyKey),
    totalTax,
    totalClawback,
    depletionAge,
    reasons,
    snapshotsByAge,
  };
}

function growAccountsToRetirement(plan, accounts, annualContribution, contributionIncrease, returnRate, years) {
  const next = {
    rrsp: Math.max(0, accounts.rrsp),
    tfsa: Math.max(0, accounts.tfsa),
    nonRegistered: Math.max(0, accounts.nonRegistered),
    cash: Math.max(0, accounts.cash),
  };

  const total = sumAccounts(next);
  if (total <= 0) {
    next.rrsp = plan.savings.currentTotal * 0.5;
    next.tfsa = plan.savings.currentTotal * 0.3;
    next.nonRegistered = plan.savings.currentTotal * 0.15;
    next.cash = plan.savings.currentTotal * 0.05;
  }

  const startAge = currentAgeForPlan(plan);
  for (let i = 0; i < years; i += 1) {
    const age = startAge + i;
    const capitalInject = getCapitalInjectAtAge(plan, age);
    if (capitalInject > 0) next.cash += capitalInject;
    const contributionThisYear = annualContribution * Math.pow(1 + contributionIncrease, i);
    next.rrsp = (next.rrsp + contributionThisYear * 0.5) * (1 + returnRate);
    next.tfsa = (next.tfsa + contributionThisYear * 0.35) * (1 + returnRate);
    next.nonRegistered = (next.nonRegistered + contributionThisYear * 0.1) * (1 + returnRate);
    next.cash += contributionThisYear * 0.05;
  }

  return next;
}

function distributeFromAccounts(order, balances, amount) {
  let remaining = Math.max(0, amount);
  const draw = { rrsp: 0, tfsa: 0, nonRegistered: 0, cash: 0, total: 0 };

  for (const key of order) {
    if (remaining <= 0) break;
    const available = Math.max(0, balances[key]);
    const used = Math.min(available, remaining);
    balances[key] = available - used;
    draw[key] += used;
    draw.total += used;
    remaining -= used;
  }

  return draw;
}

function getWithdrawalOrder(strategyKey, context) {
  if (strategyKey === "rrsp-first") return ["rrsp", "nonRegistered", "tfsa", "cash"];
  if (strategyKey === "tfsa-first") return ["tfsa", "cash", "nonRegistered", "rrsp"];

  const threshold = 93000;
  if (context.taxableBeforeWithdrawals > threshold * 0.9) return ["tfsa", "cash", "nonRegistered", "rrsp"];
  if (context.taxableBeforeWithdrawals < 50000 && context.balances.rrsp > context.balances.tfsa) {
    return ["rrsp", "nonRegistered", "tfsa", "cash"];
  }
  return ["nonRegistered", "tfsa", "rrsp", "cash"];
}

function strategyReasons(strategyKey) {
  if (strategyKey === "rrsp-first") {
    return [
      "Draws taxable registered funds earlier to reduce future forced RRIF pressure.",
      "Can work when current taxable income is relatively low.",
      "May reduce late-retirement concentration in fully taxable accounts.",
    ];
  }
  if (strategyKey === "tfsa-first") {
    return [
      "Uses tax-free balances first to reduce immediate tax drag.",
      "Keeps taxable income lower in early years.",
      "Can increase later taxes if registered balances remain large.",
    ];
  }
  return [
    "Prioritizes lower immediate tax impact while monitoring clawback risk.",
    "Adjusts order based on taxable income level and account mix.",
    "Targets smoother taxes across retirement years rather than one strict order.",
  ];
}

function strategyLabel(key) {
  if (key === "rrsp-first") return "RRSP-first";
  if (key === "tfsa-first") return "TFSA-first";
  return "Tax-smart";
}

function estimateSustainableIncome(rows, retireAge) {
  const retirementRows = rows.filter((row) => row.age >= retireAge);
  if (!retirementRows.length) return 0;
  const withdrawals = retirementRows.map((row) => row.withdrawal);
  const avg = withdrawals.reduce((sum, value) => sum + value, 0) / withdrawals.length;
  return avg;
}

function inflateAmountToRetirement(amount, inflationRate, years) {
  return amount * Math.pow(1 + inflationRate, Math.max(0, years));
}

function getCapitalInjectAtAge(plan, age) {
  const items = Array.isArray(plan.savings?.capitalInjects) ? plan.savings.capitalInjects : [];
  return items.reduce((sum, item) => {
    if (!item.enabled) return sum;
    return Number(item.age) === Number(age) ? sum + Math.max(0, Number(item.amount || 0)) : sum;
  }, 0);
}

function sumAccounts(accounts) {
  return Math.max(0, accounts.rrsp) + Math.max(0, accounts.tfsa) + Math.max(0, accounts.nonRegistered) + Math.max(0, accounts.cash);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function currentAgeForPlan(plan) {
  return APP.currentYear - Number(plan.profile?.birthYear || APP.currentYear);
}
