export function getPlanEditorConfigView(key, ctx) {
  const {
    state,
    provinces,
    numberField,
    selectField,
    tooltipButton,
    riskButton,
    toPct,
  } = ctx;

  if (key === "retirementAge") {
    return {
      title: "Edit Retirement Age",
      body: `
        ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge")}
      `,
    };
  }
  if (key === "desiredSpending") {
    return {
      title: "Edit Annual Spending",
      body: `
        ${numberField("Desired retirement spending (after-tax, today's dollars)", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
      `,
    };
  }
  if (key === "inflation") {
    return {
      title: "Edit Inflation",
      body: `
        ${numberField("Inflation assumption", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true)}
      `,
    };
  }
  if (key === "returnProfile") {
    return {
      title: "Edit Investment Return Profile",
      body: `
        <div class="label-row">Risk profile ${tooltipButton("riskProfile")}</div>
        <div class="inline-radio-row">
          ${riskButton("conservative")}
          ${riskButton("balanced")}
          ${riskButton("aggressive")}
        </div>
      `,
    };
  }
  if (key === "cpp") {
    return {
      title: "Edit CPP Income",
      body: `
        ${numberField("Estimated CPP at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65")}
        ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge")}
      `,
    };
  }
  if (key === "oas") {
    return {
      title: "Edit OAS Income",
      body: `
        ${numberField("Estimated OAS at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65")}
        ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge")}
      `,
    };
  }
  if (key === "pension") {
    return {
      title: "Edit Private Pension",
      body: `
        <label class="inline-check form-span-full">
          <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
          Enable private/workplace pension
        </label>
        ${numberField("Pension amount", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled)}
        ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled)}
      `,
    };
  }
  if (key === "savings") {
    return {
      title: "Edit Savings Balance",
      body: `
        ${numberField("Current registered savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
      `,
    };
  }
  if (key === "contribution") {
    return {
      title: "Edit Contributions",
      body: `
        ${numberField("Annual contribution", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
        ${numberField("Contribution increase (%/yr)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true)}
      `,
    };
  }
  if (key === "province") {
    return {
      title: "Edit Province",
      body: `
        ${selectField("Province", "profile.province", Object.entries(provinces).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
      `,
    };
  }
  return null;
}
