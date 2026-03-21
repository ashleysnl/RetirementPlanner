export function buildYearBreakdown(plan, model) {
  const rows = (model?.base?.rows || []).filter((row) => row.age >= plan.profile.retirementAge);
  return rows.map((row) => {
    const pensionGross = Number(row.pension || 0) + Number(row.spousePension || 0);
    const cppGross = Number(row.cpp || 0) + Number(row.spouseCpp || 0);
    const oasGross = Number(row.oas || 0) + Number(row.spouseOas || 0);
    const taxOnWithdrawal = Number(row.taxOnWithdrawal || 0);
    const clawback = Number(row.oasClawback || 0);
    const withdrawalGross = Number(row.withdrawal || 0);
    const withdrawalNet = Math.max(0, Number(row.netFromWithdrawal || 0));
    return {
      age: Number(row.age),
      year: Number(row.year),
      spendingAfterTax: Number(row.spending || 0),
      pensionGross,
      cppGross,
      oasGross,
      guaranteedGross: Number(row.guaranteedGross || 0),
      guaranteedNet: Number(row.guaranteedNet || 0),
      withdrawalGross,
      withdrawalNet,
      taxOnWithdrawal,
      oasClawback: clawback,
      taxTotal: Number(row.tax || 0) + clawback,
      rrifMin: Number(row.rrifMinimum || 0),
      portfolioBalanceStart: Number(row.balanceStart || 0),
      portfolioBalanceEnd: Number(row.balance || 0),
      coveragePct: Number(row.spending || 0) > 0 ? (Number(row.guaranteedNet || 0) / Number(row.spending || 0)) : 1,
    };
  });
}

