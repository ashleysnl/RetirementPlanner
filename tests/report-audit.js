import { APP, PROVINCES, RISK_RETURNS } from "../src/model/constants.js";
import { LEARN_PROGRESS_ITEMS } from "../src/content/constants.js";
import { createDefaultPlan, ensureValidState } from "../src/model/planSchema.js";
import { buildPlanModel } from "../src/model/projection.js";
import { getRrifMinimumRequired } from "../src/model/calculations.js";
import { getReportMetrics } from "../src/model/reportMetrics.js";
import { buildSummaryHtml } from "../src/ui/printSummary.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function deps() {
  return {
    app: APP,
    provinces: PROVINCES,
    riskReturns: RISK_RETURNS,
    learnProgressItems: LEARN_PROGRESS_ITEMS,
  };
}

function basePlan() {
  const plan = createDefaultPlan(deps());
  ensureValidState(plan, deps());
  return plan;
}

function retirementRow(model, age) {
  return model.base.rows.find((row) => row.age === age) || model.base.rows[0];
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value || 0);
}

function formatPct(value) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

const tests = [
  {
    name: "Taxes disabled zeroes tax outputs",
    run() {
      const plan = basePlan();
      plan.strategy.estimateTaxes = false;
      plan.strategy.oasClawbackModeling = true;
      const model = buildPlanModel(plan);
      const row = retirementRow(model, plan.profile.retirementAge);
      assert(row.tax === 0, "Expected total tax to be zero when tax estimates are disabled.");
      assert(row.taxOnWithdrawal === 0, "Expected tax on withdrawal to be zero when tax estimates are disabled.");
      assert(row.oasClawback === 0, "Expected OAS clawback to be zero when tax estimates are disabled.");
      assert(row.effectiveTaxRate === 0, "Expected effective tax rate to be zero when tax estimates are disabled.");
    },
  },
  {
    name: "Coverage uses after-tax guaranteed income, not gross",
    run() {
      const plan = basePlan();
      plan.profile.desiredSpending = 40000;
      plan.income.pension.enabled = true;
      plan.income.pension.amount = 42000;
      const model = buildPlanModel(plan);
      const row = retirementRow(model, plan.profile.retirementAge);
      const metrics = getReportMetrics(plan, row);
      assert(metrics.guaranteedGross > metrics.guaranteedNet, "Expected gross guaranteed income to exceed net when taxes are enabled.");
      assert(metrics.coverageRatio < 1, "Coverage should remain below 100% if after-tax guaranteed income is below spending.");
    },
  },
  {
    name: "Report labels show after-tax guaranteed basis",
    run() {
      const plan = basePlan();
      const model = buildPlanModel(plan);
      const rowRet = retirementRow(model, plan.profile.retirementAge);
      const row65 = retirementRow(model, 65);
      const row71 = retirementRow(model, 71);
      const html = buildSummaryHtml({
        state: plan,
        rowRet,
        row65,
        row71,
        model,
        formatCurrency,
        formatPct,
        methodologyUrl: "https://retirement.simplekit.app/#methodology",
      });
      assert(html.includes("Guaranteed income after estimated tax"), "Expected report to label guaranteed income as after estimated tax.");
      assert(html.includes("Guaranteed-income coverage"), "Expected report to label coverage precisely.");
      assert(html.includes("nominal dollars for the specific age/year shown"), "Expected report to disclose nominal-dollar basis for yearly outputs.");
    },
  },
  {
    name: "Tax-disabled report hides estimated tax outputs",
    run() {
      const plan = basePlan();
      plan.strategy.estimateTaxes = false;
      const model = buildPlanModel(plan);
      const rowRet = retirementRow(model, plan.profile.retirementAge);
      const row65 = retirementRow(model, 65);
      const row71 = retirementRow(model, 71);
      const html = buildSummaryHtml({
        state: plan,
        rowRet,
        row65,
        row71,
        model,
        formatCurrency,
        formatPct,
        methodologyUrl: "https://retirement.simplekit.app/#methodology",
      });
      assert(html.includes("Tax estimates: Off"), "Expected report to show tax estimates off when disabled.");
      assert(!html.includes("Estimated tax + clawback drag:"), "Expected no estimated-tax drag line when tax estimates are disabled.");
    },
  },
  {
    name: "Income sources start only at configured ages",
    run() {
      const plan = basePlan();
      plan.income.pension.enabled = true;
      plan.income.pension.startAge = 63;
      plan.income.cpp.startAge = 65;
      plan.income.oas.startAge = 67;
      const model = buildPlanModel(plan);
      const age62 = retirementRow(model, 62);
      const age63 = retirementRow(model, 63);
      const age64 = retirementRow(model, 64);
      const age67 = retirementRow(model, 67);
      assert(age62.pension === 0 && age62.cpp === 0 && age62.oas === 0, "No income source should start before its configured age.");
      assert(age63.pension > 0 && age63.cpp === 0 && age63.oas === 0, "Pension should start at its configured age only.");
      assert(age64.cpp === 0, "CPP should not start before its configured age.");
      assert(age67.oas > 0, "OAS should start at its configured age.");
    },
  },
  {
    name: "Depletion age improves with stronger funding assumptions",
    run() {
      const thinPlan = basePlan();
      thinPlan.savings.currentTotal = 100000;
      thinPlan.savings.annualContribution = 0;
      thinPlan.profile.desiredSpending = 80000;
      const thinModel = buildPlanModel(thinPlan);

      const strongerPlan = basePlan();
      strongerPlan.savings.currentTotal = 100000;
      strongerPlan.savings.annualContribution = 20000;
      strongerPlan.profile.desiredSpending = 80000;
      strongerPlan.savings.capitalInjects.push({ id: "inject-1", enabled: true, label: "Downsize", amount: 150000, age: 67 });
      const strongerModel = buildPlanModel(strongerPlan);

      const thinAge = thinModel.kpis.depletionAge || 0;
      const strongAge = strongerModel.kpis.depletionAge || strongerPlan.profile.lifeExpectancy + 1;
      assert(strongAge >= thinAge, "Expected depletion age to improve or disappear with more contributions and lump sums.");
    },
  },
  {
    name: "RRIF minimum uses correct factor by age and balance",
    run() {
      const plan = basePlan();
      plan.strategy.applyRrifMinimums = true;
      plan.strategy.rrifConversionAge = 71;
      const min71 = getRrifMinimumRequired(plan, 71, 600000);
      const min72 = getRrifMinimumRequired(plan, 72, 600000);
      assert(Math.round(min71) === Math.round(600000 * 0.0528), "Age 71 RRIF minimum factor mismatch.");
      assert(Math.round(min72) === Math.round(600000 * 0.054), "Age 72 RRIF minimum factor mismatch.");
    },
  },
];

function runAll() {
  const out = [];
  let passed = 0;
  for (const test of tests) {
    try {
      test.run();
      out.push({ name: test.name, ok: true });
      passed += 1;
    } catch (error) {
      out.push({ name: test.name, ok: false, error: error.message || String(error) });
    }
  }
  return { passed, total: tests.length, out };
}

const results = runAll();
const mount = document.getElementById("results");
if (mount) {
  mount.innerHTML = `
    <h1>Report Audit Tests</h1>
    <p>${results.passed} / ${results.total} passed</p>
    <ul>
      ${results.out.map((item) => `<li><strong>${item.ok ? "PASS" : "FAIL"}</strong> ${item.name}${item.error ? ` - ${item.error}` : ""}</li>`).join("")}
    </ul>
  `;
}

if (results.passed !== results.total) {
  console.error("Report audit tests failed", results.out);
} else {
  console.log("Report audit tests passed");
}
