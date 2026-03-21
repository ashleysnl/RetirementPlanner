function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getReportMetrics(plan, row) {
  const estimateTaxes = plan?.strategy?.estimateTaxes !== false;
  const spending = Math.max(0, num(row?.spending));
  const guaranteedGross = Math.max(0, num(row?.guaranteedGross));
  const guaranteedNet = Math.max(0, estimateTaxes ? num(row?.guaranteedNet) : guaranteedGross);
  const netGap = Math.max(0, num(row?.netGap));
  const grossWithdrawal = Math.max(0, num(row?.withdrawal));
  const incomeTax = Math.max(0, estimateTaxes ? num(row?.taxOnWithdrawal) : 0);
  const clawback = Math.max(0, estimateTaxes ? num(row?.oasClawback) : 0);
  const dragAmount = incomeTax + clawback;
  const netWithdrawal = Math.max(0, estimateTaxes ? num(row?.netFromWithdrawal) : grossWithdrawal);
  const totalSpendable = guaranteedNet + netWithdrawal;
  const coverageRatio = spending > 0 ? guaranteedNet / spending : 1;
  const surplus = Math.max(0, guaranteedNet - spending);
  const effectiveTaxRate = estimateTaxes ? num(row?.effectiveTaxRate) : 0;

  return {
    estimateTaxes,
    spending,
    guaranteedGross,
    guaranteedNet,
    netGap,
    grossWithdrawal,
    netWithdrawal,
    incomeTax,
    clawback,
    dragAmount,
    totalSpendable,
    coverageRatio,
    surplus,
    effectiveTaxRate,
  };
}
