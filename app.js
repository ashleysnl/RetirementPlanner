const APP = {
  storageKey: "retirementPlanner.plan.v2",
  version: 2,
  currentYear: new Date().getFullYear(),
  defaultProvince: "NL",
};

const SUPPORT_URL = "https://retirement.simplekit.app";

const PROVINCES = {
  NL: "Newfoundland and Labrador",
  PE: "Prince Edward Island",
  NS: "Nova Scotia",
  NB: "New Brunswick",
  QC: "Quebec",
  ON: "Ontario",
  MB: "Manitoba",
  SK: "Saskatchewan",
  AB: "Alberta",
  BC: "British Columbia",
};

const RISK_RETURNS = {
  conservative: 0.04,
  balanced: 0.055,
  aggressive: 0.07,
};

const TOOLTIPS = {
  province: {
    term: "Province",
    plain: "Your province changes estimated provincial tax and benefit context.",
    why: "Taxes can materially change retirement income needs.",
    range: "All Canadian provinces are available. Default: NL.",
    example: "A plan in NL may estimate a different tax burden than the same income in ON.",
  },
  birthYear: {
    term: "Year of birth",
    plain: "Used to estimate your age each year in the projection.",
    why: "Age controls CPP/OAS start timing and retirement duration.",
    range: "Typical range: 1940-2008.",
    example: "Born in 1985 means age 65 in 2050.",
  },
  retirementAge: {
    term: "Retirement age",
    plain: "Age when your plan switches from saving to drawing income.",
    why: "Earlier retirement means fewer saving years and longer drawdown years.",
    range: "Typical range: 55-70.",
    example: "Retiring at 60 instead of 65 increases years your savings must support.",
  },
  lifeExpectancy: {
    term: "Life expectancy",
    plain: "How long the model projects your retirement spending.",
    why: "Longer horizon requires more assets or lower annual spending.",
    range: "Typical planning range: 85-100.",
    example: "Planning to age 95 tests longevity risk.",
  },
  desiredSpending: {
    term: "Desired retirement spending",
    plain: "Your annual after-tax spending goal in today’s dollars.",
    why: "This is the target your income sources and savings must cover.",
    range: "Varies by household and location.",
    example: "$60,000 today at 2% inflation is about $73,000 in 10 years.",
  },
  inflation: {
    term: "Inflation",
    plain: "Annual increase applied to future spending and optionally tax brackets.",
    why: "Higher inflation can raise the long-term draw required from savings.",
    range: "Typical long-term assumption: 1.5%-3.0%.",
    example: "At 2%, costs roughly double in about 36 years.",
  },
  currentSavings: {
    term: "Current total savings",
    plain: "Your starting investable balance across all accounts.",
    why: "Starting balance is a major driver of retirement readiness.",
    range: "Any non-negative value.",
    example: "$200,000 today compounds over your remaining working years.",
  },
  annualContribution: {
    term: "Annual contribution",
    plain: "How much you add to savings each year before retirement.",
    why: "Regular contributions can significantly increase retirement assets.",
    range: "Any non-negative value.",
    example: "$8,000 per year for 20 years adds $160,000 before growth.",
  },
  contributionIncrease: {
    term: "Contribution increase (%/year)",
    plain: "Annual percentage increase applied to your savings contribution before retirement.",
    why: "Gradually increasing contributions can materially improve retirement readiness.",
    range: "Typical range: 0%-5% per year.",
    example: "A $10,000 contribution growing 3% yearly becomes about $13,439 in year 10.",
  },
  capitalInjectAmount: {
    term: "Lump-sum amount",
    plain: "A one-time amount added to investable assets at a specific age.",
    why: "Large one-time proceeds can materially improve retirement sustainability.",
    range: "Any non-negative value.",
    example: "Downsizing a home might add a $150,000 one-time injection at age 67.",
  },
  capitalInjectAge: {
    term: "Lump-sum age",
    plain: "The age when the one-time capital injection is received.",
    why: "Timing changes compounding and how long the capital supports spending.",
    range: "Typical planning range: 50-95.",
    example: "A lump sum at 60 has more time to compound than the same amount at 75.",
  },
  riskProfile: {
    term: "Risk profile",
    plain: "Maps to default long-term return assumptions.",
    why: "Expected returns directly affect projected balances.",
    range: "Conservative, Balanced, Aggressive.",
    example: "Balanced defaults near 5.5% nominal annual return.",
  },
  pensionAmount: {
    term: "Workplace pension amount",
    plain: "Annual pension income before tax once it starts.",
    why: "Guaranteed income reduces withdrawal pressure on savings.",
    range: "Depends on pension plan terms.",
    example: "$18,000/year pension can cover a meaningful baseline of spending.",
  },
  pensionStartAge: {
    term: "Pension start age",
    plain: "Age pension payments begin.",
    why: "Later starts create more early-retirement funding needs.",
    range: "Typical range: 55-70.",
    example: "If pension starts at 65 but retirement is 60, savings bridge 5 years.",
  },
  cppAmount65: {
    term: "CPP estimate at 65",
    plain: "Estimated annual CPP amount if started at age 65.",
    why: "CPP is a core retirement income source for many Canadians.",
    range: "Personal estimate from Service Canada statements.",
    example: "$12,000/year at 65 can change with early or late start.",
  },
  cppStartAge: {
    term: "CPP start age",
    plain: "Age you plan to start CPP (60-70).",
    why: "Starting earlier lowers annual amount; delaying raises it.",
    range: "Allowed range: 60-70.",
    example: "Starting at 70 can materially increase annual CPP versus 65.",
  },
  oasAmount65: {
    term: "OAS estimate at 65",
    plain: "Estimated annual OAS amount if started at 65.",
    why: "OAS contributes to baseline retirement income after 65.",
    range: "Based on residency and eligibility.",
    example: "Delaying OAS can increase annual benefit.",
  },
  oasStartAge: {
    term: "OAS start age",
    plain: "Age you plan to start OAS (65-70).",
    why: "Start timing changes annual OAS amount and clawback exposure.",
    range: "Allowed range: 65-70.",
    example: "Starting at 68 increases annual OAS versus 65.",
  },
  spousePensionAmount: {
    term: "Spouse pension amount",
    plain: "Annual workplace/private pension income for spouse before tax.",
    why: "Spousal guaranteed income can reduce household savings withdrawals.",
    range: "Any non-negative value.",
    example: "A spouse pension of $10,000/year lowers portfolio draw needs.",
  },
  spousePensionStartAge: {
    term: "Spouse pension start age",
    plain: "Age when spouse pension starts.",
    why: "Timing determines how much early-retirement gap remains.",
    range: "Typical range: 55-70.",
    example: "If spouse pension starts at 65, years before 65 need other funding.",
  },
  spouseCppAmount65: {
    term: "Spouse CPP estimate at 65",
    plain: "Estimated annual spouse CPP at age 65.",
    why: "Adds household guaranteed income in retirement.",
    range: "Personal estimate from Service Canada statements.",
    example: "Spouse CPP can materially improve first-year retirement coverage.",
  },
  spouseCppStartAge: {
    term: "Spouse CPP start age",
    plain: "Age spouse plans to start CPP (60-70).",
    why: "Earlier or later start changes annual spouse CPP amount.",
    range: "Allowed range: 60-70.",
    example: "Delaying spouse CPP can increase late-retirement guaranteed income.",
  },
  spouseOasAmount65: {
    term: "Spouse OAS estimate at 65",
    plain: "Estimated annual spouse OAS at age 65.",
    why: "Adds to household baseline retirement income.",
    range: "Based on eligibility and residency history.",
    example: "Spouse OAS can reduce total required account withdrawals.",
  },
  spouseOasStartAge: {
    term: "Spouse OAS start age",
    plain: "Age spouse plans to start OAS (65-70).",
    why: "Start timing affects annual benefit and clawback exposure.",
    range: "Allowed range: 65-70.",
    example: "Starting at 67 gives higher annual OAS than 65.",
  },
  scenarioSpread: {
    term: "Scenario spread",
    plain: "Difference used to create best/base/worst deterministic return scenarios.",
    why: "Helps compare sensitivity to return assumptions.",
    range: "Typical range: 1%-3%.",
    example: "Base 5.5% with spread 2% gives 3.5% worst and 7.5% best.",
  },
  volatility: {
    term: "Volatility",
    plain: "Planning volatility input for education and stress framing.",
    why: "Higher volatility means wider range of possible outcomes.",
    range: "Typical long-term annualized range: 6%-15%.",
    example: "A more volatile portfolio may deviate further from base projections.",
  },
  rrsp: {
    term: "RRSP/RRIF account",
    plain: "Tax-deferred account; withdrawals are generally taxable.",
    why: "Withdrawal order affects taxes and government benefit interactions.",
    range: "Any non-negative value.",
    example: "Large RRSP withdrawals can raise taxable income and clawback risk.",
  },
  tfsa: {
    term: "TFSA account",
    plain: "Tax-free savings account; eligible withdrawals are tax-free.",
    why: "Useful for flexible, tax-efficient retirement cash flow.",
    range: "Any non-negative value.",
    example: "Using TFSA withdrawals can reduce taxable income in high-tax years.",
  },
  nonRegistered: {
    term: "Non-registered account",
    plain: "Taxable investment account outside RRSP/TFSA.",
    why: "Some withdrawal amounts may be taxable depending on gains/income type.",
    range: "Any non-negative value.",
    example: "Capital gains are typically taxed more favorably than full-income withdrawals.",
  },
  cash: {
    term: "Cash account",
    plain: "Liquid cash reserve for short-term spending needs.",
    why: "Can reduce forced selling during market stress.",
    range: "Any non-negative value.",
    example: "A cash buffer can help cover 1-2 years of spending gaps.",
  },
  kpiBalanceRetirement: {
    term: "Balance at retirement",
    plain: "Estimated portfolio value at your retirement age.",
    why: "This is your starting pool for retirement withdrawals.",
    range: "Based on your savings, contributions, returns, and timeline.",
    example: "Higher contributions can lift this value materially.",
  },
  kpiSpendingTarget: {
    term: "After-tax spending target",
    plain: "How much spendable cash you want in retirement.",
    why: "This is the benchmark income your plan needs to deliver.",
    range: "Set in guided and advanced inputs.",
    example: "$70,000 means $70,000 to spend after tax.",
  },
  kpiGuaranteedIncome: {
    term: "Guaranteed income",
    plain: "Combined pension, CPP, and OAS for the year.",
    why: "This income reduces how much must come from savings.",
    range: "Depends on benefit amounts and start ages.",
    example: "If guaranteed income covers most spending, withdrawals are lower.",
  },
  kpiNetGap: {
    term: "Net gap from savings",
    plain: "The after-tax spending shortfall not covered by guaranteed income.",
    why: "This is the net amount your savings must provide.",
    range: "Cannot be below zero.",
    example: "If spending is $60k and guaranteed net is $45k, gap is about $15k.",
  },
  kpiGrossWithdrawal: {
    term: "Gross withdrawal required",
    plain: "The pre-tax RRSP/RRIF withdrawal needed to fund the net gap.",
    why: "Withdrawals are taxable, so gross is often higher than net needed.",
    range: "Depends on taxable income and tax rate in that year.",
    example: "A $20k net gap may require a $26k gross withdrawal.",
  },
  registeredAssumption: {
    term: "Registered-only assumption",
    plain: "This dashboard currently treats all savings withdrawals as RRSP/RRIF taxable withdrawals.",
    why: "It makes the tax wedge clear and easier to interpret.",
    range: "TFSA/cash effects are intentionally excluded here.",
    example: "If you had TFSA withdrawals, tax wedge could be smaller than shown.",
  },
  rrifConversionAge: {
    term: "RRIF conversion age",
    plain: "Age when RRSP is treated as RRIF for minimum withdrawal rules.",
    why: "From this age, minimum withdrawals can force taxable income.",
    range: "Typical conversion age: 71.",
    example: "At 71, required RRIF minimums may raise taxable income even if spending is lower.",
  },
  rrifMinimums: {
    term: "RRIF minimum withdrawals",
    plain: "Annual minimum percentage that must be withdrawn from RRIF by age.",
    why: "Can increase taxes and OAS clawback exposure in later retirement.",
    range: "Age-based schedule from CRA.",
    example: "If required minimum exceeds your spending gap, taxable income still rises.",
  },
  oasClawback: {
    term: "OAS clawback",
    plain: "OAS can be reduced when taxable income exceeds the recovery threshold.",
    why: "Higher taxable withdrawals can reduce net OAS received.",
    range: "Calculated using a planning threshold and 15% recovery rate.",
    example: "Large RRIF withdrawals can trigger partial OAS recovery tax.",
  },
  learnInflationCalc: {
    term: "Inflation spending calculator",
    plain: "Shows how a spending amount today grows over time with inflation.",
    why: "Retirement budgets need future-dollar planning, not just today’s prices.",
    range: "Common inflation assumptions are around 1.5%-3.0%.",
    example: "$80,000 today at 2.5% for 10 years is about $102,000.",
  },
  learnTaxGrossUp: {
    term: "Tax gross-up",
    plain: "To receive a net amount after tax, you must withdraw a larger gross amount.",
    why: "This explains why RRSP/RRIF withdrawals can exceed your spending gap.",
    range: "Effective tax rates vary by income and province.",
    example: "If you need $80,000 net and tax is 22%, gross is about $102,564.",
  },
  learnRrifMinimum: {
    term: "RRIF minimum withdrawal",
    plain: "RRIF rules require a minimum annual withdrawal based on age.",
    why: "Minimums can force higher taxable income in later retirement.",
    range: "Starts at age 71 conversion, then rises with age.",
    example: "At age 72, minimum is about 5.40% of RRIF balance.",
  },
  learnOasClawback: {
    term: "OAS clawback estimator",
    plain: "OAS can be reduced when income exceeds the annual recovery threshold.",
    why: "Higher taxable income may reduce government benefits.",
    range: "Recovery tax is 15% of income above threshold (up to full OAS).",
    example: "If income is above threshold, part of OAS is paid back.",
  },
  learnPensionSplit: {
    term: "Spousal pension splitting",
    plain: "Eligible pension income can be shifted between spouses (up to 50%) for tax purposes.",
    why: "Balancing taxable income between spouses can lower total household tax.",
    range: "Split percentage can range from 0% to 50%.",
    example: "Shifting pension from higher-income spouse may reduce combined tax.",
  },
  phaseWeightedSpending: {
    term: "Phase-weighted annual spending",
    plain: "A single average annual spending value based on your Go-Go, Slow-Go, and No-Go years.",
    why: "It summarizes a changing spending path into one planning benchmark.",
    range: "Depends on your base spending, phase percentages, and years in each phase.",
    example: "Higher Go-Go spending and longer Go-Go years raise the weighted average.",
  },
  stressScenario: {
    term: "Stress scenario",
    plain: "A simple what-if case that changes return and inflation assumptions.",
    why: "It helps you see how sensitive your plan is to good or bad environments.",
    range: "Shown as best, base, and downside cases.",
    example: "Downside means lower returns and higher inflation than your base assumptions.",
  },
  stressGapSurplus: {
    term: "First-year gap/surplus",
    plain: "Difference between your retirement spending target and available income in the first retirement year.",
    why: "A gap means savings must fund the shortfall; a surplus gives flexibility.",
    range: "Negative values are gaps, positive values are surpluses.",
    example: "-$8,000 means you need extra savings withdrawals in year one.",
  },
  depletionAge: {
    term: "Depletion age",
    plain: "The age when projected savings reach zero in a scenario.",
    why: "It highlights longevity risk if withdrawals outpace portfolio growth.",
    range: "If assets last through your horizon, depletion is not triggered.",
    example: "Depletion at age 88 means the model runs out of savings at 88.",
  },
  strategyLifetimeTaxes: {
    term: "Estimated lifetime taxes",
    plain: "Total projected taxes paid across your full retirement projection for this strategy.",
    why: "Comparing lifetime tax totals helps evaluate withdrawal order tradeoffs.",
    range: "Planning estimate only; actual taxes will vary by year and rules.",
    example: "A lower lifetime tax total can leave more net spending capacity.",
  },
  strategyLifetimeClawback: {
    term: "Estimated lifetime OAS clawback",
    plain: "Total projected OAS recovery tax across your full retirement projection.",
    why: "Strategies with higher taxable income can increase clawback over time.",
    range: "Zero if income stays below clawback thresholds or OAS is not received.",
    example: "Large RRIF withdrawals can raise lifetime clawback totals.",
  },
};

const TAX_BRACKETS = {
  federal: {
    thresholds: [0, 57375, 114750, 177882, 253414],
    rates: [0.15, 0.205, 0.26, 0.29, 0.33],
  },
  provincial: {
    NL: { thresholds: [0, 43198, 86395, 154244, 215943, 275870, 551739, 1103478], rates: [0.087, 0.145, 0.158, 0.178, 0.198, 0.208, 0.213, 0.218] },
    PE: { thresholds: [0, 32656, 64313, 105000, 140000], rates: [0.098, 0.138, 0.167, 0.176, 0.19] },
    NS: { thresholds: [0, 29590, 59180, 93000, 150000], rates: [0.0879, 0.1495, 0.1667, 0.175, 0.21] },
    NB: { thresholds: [0, 49958, 99916, 185064], rates: [0.094, 0.14, 0.16, 0.195] },
    QC: { thresholds: [0, 51780, 103545, 126000], rates: [0.14, 0.19, 0.24, 0.2575] },
    ON: { thresholds: [0, 52886, 105775, 150000, 220000], rates: [0.0505, 0.0915, 0.1116, 0.1216, 0.1316] },
    MB: { thresholds: [0, 47000, 100000], rates: [0.108, 0.1275, 0.174] },
    SK: { thresholds: [0, 52057, 148734], rates: [0.105, 0.125, 0.145] },
    AB: { thresholds: [0, 151234, 181481, 241974, 362961], rates: [0.1, 0.12, 0.13, 0.14, 0.15] },
    BC: { thresholds: [0, 47937, 95875, 110076, 133664, 181232, 252752], rates: [0.0506, 0.077, 0.105, 0.1229, 0.147, 0.168, 0.205] },
  },
};

const RRIF_MIN_WITHDRAWAL = {
  71: 0.0528,
  72: 0.054,
  73: 0.0553,
  74: 0.0567,
  75: 0.0582,
  76: 0.0598,
  77: 0.0617,
  78: 0.0636,
  79: 0.0658,
  80: 0.0682,
  81: 0.0708,
  82: 0.0738,
  83: 0.0771,
  84: 0.0808,
  85: 0.0851,
  86: 0.0899,
  87: 0.0955,
  88: 0.1021,
  89: 0.1099,
  90: 0.1192,
  91: 0.1306,
  92: 0.1449,
  93: 0.1634,
  94: 0.1879,
  95: 0.2,
};

const OFFICIAL_REFERENCES = [
  {
    label: "CPP retirement pension (overview)",
    href: "https://www.canada.ca/en/services/benefits/publicpensions/cpp.html",
    source: "Canada.ca (Service Canada)",
  },
  {
    label: "CPP start-age timing (60-70)",
    href: "https://www.canada.ca/en/services/benefits/publicpensions/cpp/when-start.html",
    source: "Canada.ca (Service Canada)",
  },
  {
    label: "Old Age Security (OAS) overview",
    href: "https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security.html",
    source: "Canada.ca (Service Canada)",
  },
  {
    label: "OAS start-age timing (65-70)",
    href: "https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/when-start.html",
    source: "Canada.ca (Service Canada)",
  },
  {
    label: "OAS recovery tax (clawback)",
    href: "https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security/recovery-tax.html",
    source: "Canada.ca",
  },
  {
    label: "RRSPs and other registered plans (T4040)",
    href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4040/rrsps-other-registered-plans-retirement.html",
    source: "CRA",
  },
  {
    label: "RRSP deduction limit rules",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/contributing-a-rrsp-prpp/contributions-affect-your-rrsp-prpp-deduction-limit.html",
    source: "CRA",
  },
  {
    label: "Registered Retirement Income Fund (RRIF)",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-retirement-income-fund-rrif.html",
    source: "CRA",
  },
  {
    label: "Personal tax rates and brackets hub",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/rates.html",
    source: "CRA",
  },
  {
    label: "Federal/provincial tax thresholds and rates",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/income-tax/reducing-remuneration-subject-income-tax.html",
    source: "CRA",
  },
  {
    label: "Tax-Free Savings Account (TFSA): opening and eligibility",
    href: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/opening.html",
    source: "CRA",
  },
  {
    label: "Capital gains guide (non-registered investing context)",
    href: "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4037/capital-gains.html",
    source: "CRA",
  },
];

const PLAN_SUMMARY_ROWS = [
  { key: "province", label: "Province", tooltip: "province" },
  { key: "retirementAge", label: "Retirement age", tooltip: "retirementAge" },
  { key: "desiredSpending", label: "Annual spending target", tooltip: "desiredSpending" },
  { key: "inflation", label: "Inflation", tooltip: "inflation" },
  { key: "returnProfile", label: "Investment return profile", tooltip: "riskProfile" },
  { key: "cpp", label: "CPP income at 65", tooltip: "cppAmount65" },
  { key: "oas", label: "OAS income at 65", tooltip: "oasAmount65" },
  { key: "pension", label: "Private/workplace pension", tooltip: "pensionAmount" },
  { key: "savings", label: "Savings balance", tooltip: "currentSavings" },
  { key: "contribution", label: "Annual contributions", tooltip: "annualContribution" },
];

const LEARN_PROGRESS_ITEMS = [
  { key: "inflation", label: "Inflation" },
  { key: "income", label: "Income Sources" },
  { key: "taxes", label: "Taxes" },
  { key: "rrif", label: "RRIF Rules" },
  { key: "oas", label: "OAS Clawback" },
  { key: "strategy", label: "Withdrawal Strategy" },
  { key: "stress", label: "Stress Testing" },
];

const el = {
  landingPanel: document.getElementById("landingPanel"),
  appPanel: document.getElementById("appPanel"),
  startSimpleBtn: document.getElementById("startSimpleBtn"),
  landingDemoBtn: document.getElementById("landingDemoBtn"),
  landingImportBtn: document.getElementById("landingImportBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  exportJsonBtnSecondary: document.getElementById("exportJsonBtnSecondary"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  importJsonBtnSecondary: document.getElementById("importJsonBtnSecondary"),
  loadDemoBtn: document.getElementById("loadDemoBtn"),
  loadDemoBtnSecondary: document.getElementById("loadDemoBtnSecondary"),
  resetBtn: document.getElementById("resetBtn"),
  resetBtnSecondary: document.getElementById("resetBtnSecondary"),
  openGlossaryBtn: document.getElementById("openGlossaryBtn"),
  importJsonFile: document.getElementById("importJsonFile"),

  tabButtons: Array.from(document.querySelectorAll(".tab-btn")),
  navPanels: Array.from(document.querySelectorAll(".nav-panel")),

  kpiGrid: document.getElementById("kpiGrid"),
  kpiContext: document.getElementById("kpiContext"),
  mainChart: document.getElementById("mainChart"),
  balanceHover: document.getElementById("balanceHover"),
  chartLegend: document.getElementById("chartLegend"),
  dashboardStressToggle: document.getElementById("dashboardStressToggle"),
  dollarModeToggle: document.getElementById("dollarModeToggle"),
  yearScrubber: document.getElementById("yearScrubber"),
  yearScrubberValue: document.getElementById("yearScrubberValue"),
  coverageChart: document.getElementById("coverageChart"),
  coverageLegend: document.getElementById("coverageLegend"),
  coverageHover: document.getElementById("coverageHover"),
  walkthroughStrip: document.getElementById("walkthroughStrip"),
  yearCards: document.getElementById("yearCards"),
  dashboardReferences: document.getElementById("dashboardReferences"),
  planInputsPanel: document.getElementById("planInputsPanel"),
  learnPanel: document.getElementById("learnPanel"),
  nextActions: document.getElementById("nextActions"),
  basicsSummary: document.getElementById("basicsSummary"),
  dashboardStatus: document.getElementById("dashboardStatus"),

  wizardProgressBar: document.getElementById("wizardProgressBar"),
  wizardStepLabel: document.getElementById("wizardStepLabel"),
  wizardBody: document.getElementById("wizardBody"),
  wizardBackBtn: document.getElementById("wizardBackBtn"),
  wizardNextBtn: document.getElementById("wizardNextBtn"),

  advancedAccordion: document.getElementById("advancedAccordion"),
  scenarioCompareToggle: document.getElementById("scenarioCompareToggle"),
  scenarioSummary: document.getElementById("scenarioSummary"),
  stressTable: document.getElementById("stressTable"),
  openGlossaryBtnTools: document.getElementById("openGlossaryBtnTools"),

  notesInput: document.getElementById("notesInput"),
  tooltipLayer: document.getElementById("tooltipLayer"),

  glossaryModal: document.getElementById("glossaryModal"),
  openGlossary: document.getElementById("openGlossaryBtn"),
  closeGlossaryBtn: document.getElementById("closeGlossaryBtn"),
  glossaryContent: document.getElementById("glossaryContent"),
  planEditorModal: document.getElementById("planEditorModal"),
  planEditorTitle: document.getElementById("planEditorTitle"),
  planEditorContent: document.getElementById("planEditorContent"),
  closePlanEditorBtn: document.getElementById("closePlanEditorBtn"),

  appToast: document.getElementById("appToast"),
  supportButton: document.getElementById("supportButton"),
  bottomTabs: document.getElementById("bottomTabs"),
};

let state = loadPlan();
let ui = {
  activeNav: state.uiState.activeNav || "dashboard",
  tooltipKey: "",
  toastTimer: null,
  lastModel: null,
  selectedAge: null,
  showStressBand: true,
  showTodaysDollars: false,
  advancedOpen: {
    basics: true,
    assumptions: true,
    income: false,
    accounts: false,
    rrif: false,
    capitalInjects: false,
    withdrawal: false,
    tax: false,
    references: false,
    modules: false,
  },
  learnChartHover: {
    inflation: null,
    indexed: null,
    phases: null,
  },
  planEditorKey: "",
  isMobileLayout: false,
};

init();

function init() {
  const hashNav = navFromHash(location.hash);
  if (hashNav) {
    ui.activeNav = hashNav;
    state.uiState.firstRun = false;
    state.uiState.activeNav = hashNav;
  }
  if (el.supportButton) el.supportButton.href = SUPPORT_URL;
  bindEvents();
  updateResponsiveLayout();
  renderAll();
  registerServiceWorker();
}

function bindEvents() {
  el.startSimpleBtn?.addEventListener("click", () => {
    state.uiState.firstRun = false;
    state.uiState.hasStarted = true;
    state.uiState.activeNav = "start";
    state.uiState.wizardStep = 1;
    ui.activeNav = "start";
    savePlan();
    renderAll();
  });

  el.landingDemoBtn?.addEventListener("click", () => {
    state = createDemoPlan();
    ui.activeNav = "dashboard";
    savePlan();
    renderAll();
    toast("Demo plan loaded.");
  });

  el.loadDemoBtn?.addEventListener("click", () => {
    state = createDemoPlan();
    ui.activeNav = "dashboard";
    savePlan();
    renderAll();
    toast("Demo plan loaded.");
  });

  el.exportJsonBtn?.addEventListener("click", exportJson);
  el.exportJsonBtnSecondary?.addEventListener("click", exportJson);
  el.importJsonBtn?.addEventListener("click", () => el.importJsonFile?.click());
  el.importJsonBtnSecondary?.addEventListener("click", () => el.importJsonFile?.click());
  el.landingImportBtn?.addEventListener("click", () => el.importJsonFile?.click());
  el.importJsonFile?.addEventListener("change", importJsonFromFile);
  el.loadDemoBtnSecondary?.addEventListener("click", () => el.loadDemoBtn?.click());
  el.resetBtnSecondary?.addEventListener("click", () => el.resetBtn?.click());

  el.resetBtn?.addEventListener("click", () => {
    const ok = confirm("Reset your local plan to defaults?");
    if (!ok) return;
    state = createDefaultPlan();
    ui.activeNav = "start";
    savePlan();
    renderAll();
    toast("Plan reset.");
  });

  el.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.navTarget || "dashboard";
      setActiveNav(target);
    });
  });

  el.wizardBackBtn?.addEventListener("click", () => {
    state.uiState.wizardStep = Math.max(1, state.uiState.wizardStep - 1);
    savePlan();
    renderAll();
  });

  el.wizardNextBtn?.addEventListener("click", () => {
    if (state.uiState.wizardStep >= 7) {
      state.uiState.wizardStep = 7;
      state.uiState.unlocked.advanced = true;
      state.uiState.activeNav = "dashboard";
      ui.activeNav = "dashboard";
      savePlan();
      renderAll();
      toast("Advanced features unlocked.");
      return;
    }

    state.uiState.wizardStep = Math.min(7, state.uiState.wizardStep + 1);
    if (state.uiState.wizardStep >= 7) state.uiState.unlocked.advanced = true;
    savePlan();
    renderAll();
  });

  el.notesInput?.addEventListener("input", () => {
    state.notes = el.notesInput.value;
    savePlan();
  });

  el.dashboardStressToggle?.addEventListener("change", () => {
    ui.showStressBand = !!el.dashboardStressToggle.checked;
    renderDashboard();
  });

  el.dollarModeToggle?.addEventListener("change", () => {
    ui.showTodaysDollars = !!el.dollarModeToggle.checked;
    renderDashboard();
  });

  el.yearScrubber?.addEventListener("input", () => {
    ui.selectedAge = Number(el.yearScrubber.value);
    el.yearScrubberValue.textContent = `Age ${ui.selectedAge}`;
    renderKpiCards(ui.lastModel, ui.selectedAge);
    drawCoverageChart(ui.lastModel, ui.selectedAge);
    renderDashboardNarrative(ui.lastModel);
  });

  el.coverageChart?.addEventListener("mousemove", handleCoverageChartPointer);
  el.coverageChart?.addEventListener("mouseleave", () => {
    if (el.coverageHover) el.coverageHover.hidden = true;
  });
  el.mainChart?.addEventListener("mousemove", handleBalanceChartPointer);
  el.mainChart?.addEventListener("mouseleave", () => {
    if (el.balanceHover) el.balanceHover.hidden = true;
  });

  el.scenarioCompareToggle?.addEventListener("change", () => {
    state.uiState.showScenarioCompare = !!el.scenarioCompareToggle.checked;
    savePlan();
    renderStress();
  });

  document.addEventListener("input", handleBoundInput);
  document.addEventListener("change", handleBoundInput);
  document.addEventListener("input", handleLearnBoundInput);
  document.addEventListener("change", handleLearnBoundInput);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("toggle", handleDetailsToggle, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTooltip();
  });
  window.addEventListener("resize", updateResponsiveLayout);
  window.addEventListener("orientationchange", updateResponsiveLayout);

  el.openGlossary?.addEventListener("click", openGlossary);
  el.openGlossaryBtnTools?.addEventListener("click", openGlossary);
  el.closeGlossaryBtn?.addEventListener("click", () => el.glossaryModal?.close());
  el.glossaryModal?.addEventListener("click", (event) => {
    if (event.target === el.glossaryModal) el.glossaryModal.close();
  });
  el.closePlanEditorBtn?.addEventListener("click", closePlanEditor);
  el.planEditorModal?.addEventListener("click", (event) => {
    if (event.target === el.planEditorModal) closePlanEditor();
  });
}

function updateResponsiveLayout() {
  const mobile = window.matchMedia("(max-width: 1100px)").matches;
  ui.isMobileLayout = mobile;
  document.body.classList.toggle("mobile-layout", mobile);
}

function handleDocumentClick(event) {
  const rawTarget = event.target;
  const target = rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement;
  if (!(target instanceof Element)) return;

  const tooltipBtn = target.closest("[data-tooltip-key]");
  if (tooltipBtn) {
    event.preventDefault();
    const key = tooltipBtn.getAttribute("data-tooltip-key") || "";
    if (!key) return;
    if (ui.tooltipKey === key) {
      closeTooltip();
      return;
    }
    openTooltip(key, tooltipBtn);
    return;
  }

  const actionBtn = target.closest("[data-action]");
  if (actionBtn) {
    const action = actionBtn.getAttribute("data-action");
    if (action === "open-learn") {
      setActiveNav("learn");
      return;
    }
    if (action === "edit-plan-row") {
      const key = actionBtn.getAttribute("data-value") || "";
      if (!key) return;
      openPlanEditor(key);
      return;
    }
    if (action === "toggle-learn-progress") {
      const key = actionBtn.getAttribute("data-value") || "";
      if (!key) return;
      const current = Boolean(state.uiState.learningProgress?.[key]);
      if (!state.uiState.learningProgress) state.uiState.learningProgress = createDefaultLearningProgress();
      state.uiState.learningProgress[key] = !current;
      savePlan();
      renderLearn();
      return;
    }
    if (action === "launch-planner") {
      setActiveNav("start");
      return;
    }
    if (action === "open-advanced") {
      state.uiState.unlocked.advanced = true;
      state.uiState.showAdvancedControls = true;
      setActiveNav("advanced");
      savePlan();
      return;
    }
    if (action === "open-stress") {
      setActiveNav("tools");
      return;
    }
    if (action === "open-spouse") {
      state.profile.hasSpouse = true;
      state.uiState.unlocked.spouse = true;
      state.uiState.unlocked.advanced = true;
      setActiveNav("advanced");
      savePlan();
      renderAll();
      return;
    }
    if (action === "risk") {
      const value = actionBtn.getAttribute("data-value") || "balanced";
      state.assumptions.riskProfile = value;
      savePlan();
      renderAll();
      return;
    }
    if (action === "strategy") {
      const value = actionBtn.getAttribute("data-value") || "tax-smart";
      state.strategy.withdrawal = value;
      savePlan();
      renderAll();
      return;
    }
    if (action === "add-capital-inject") {
      state.savings.capitalInjects.push(createCapitalInjectItem());
      savePlan();
      renderAll();
      return;
    }
    if (action === "remove-capital-inject") {
      const id = actionBtn.getAttribute("data-value") || "";
      state.savings.capitalInjects = state.savings.capitalInjects.filter((item) => item.id !== id);
      savePlan();
      renderAll();
      return;
    }
    if (action === "tooltip-example") {
      const key = actionBtn.getAttribute("data-value") || "";
      const body = actionBtn.closest(".tooltip-popover")?.querySelector(".tooltip-example");
      const tip = TOOLTIPS[key];
      if (tip && body) body.textContent = tip.example || "No example available.";
      return;
    }
    if (action === "learn-send-spending") {
      state.profile.desiredSpending = Math.max(12000, Number(state.uiState.learn.inflation.spendingToday || state.profile.desiredSpending));
      state.assumptions.inflation = clamp(normalizePct(state.uiState.learn.inflation.rate), 0.005, 0.08);
      savePlan();
      renderAll();
      toast("Spending and inflation sent to planner.");
      return;
    }
    if (action === "learn-send-tax-rate") {
      state.uiState.learn.taxGrossUp.rate = clamp(normalizePct(state.uiState.learn.taxGrossUp.rate), 0, 0.5);
      savePlan();
      toast("Tax gross-up assumption saved in Learn.");
      return;
    }
    if (action === "learn-send-phases") {
      const weighted = calculatePhaseWeightedSpending(state.uiState.learn.phases);
      state.profile.desiredSpending = Math.max(12000, weighted);
      savePlan();
      renderAll();
      toast("Phase-adjusted spending estimate sent to planner.");
      return;
    }
  }

  if (!target.closest(".tooltip-popover")) closeTooltip();
}

function handleBoundInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.matches("[data-bind]")) return;

  const path = target.getAttribute("data-bind");
  if (!path) return;

  captureAdvancedAccordionState();

  let value;
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    value = target.checked;
  } else {
    value = target.value;
  }

  const type = target.getAttribute("data-type") || "string";
  if (type === "number") {
    const parsed = Number(value);
    value = Number.isFinite(parsed) ? parsed : 0;
  }
  if (target.getAttribute("data-percent-input") === "1" && typeof value === "number") {
    value /= 100;
  }

  setByPath(state, path, value);

  if (path === "income.pension.enabled" && !value) state.income.pension.amount = 0;
  if (path === "profile.retirementAge") {
    state.income.pension.startAge = Math.max(state.income.pension.startAge, 40);
  }

  // Avoid re-rendering while the user is actively editing.
  // Full recalculation runs on committed change events.
  if (event.type === "input" && !(target instanceof HTMLInputElement && target.type === "checkbox")) {
    if (target.getAttribute("data-live-input") === "1") {
      if (path === "uiState.advancedSearch") applyAdvancedSearchFilter();
    }
    savePlan();
    return;
  }

  renderAll();
  savePlan();
}

function handleLearnBoundInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.matches("[data-learn-bind]")) return;

  const path = target.getAttribute("data-learn-bind");
  if (!path) return;

  let value;
  if (target instanceof HTMLInputElement && target.type === "checkbox") value = target.checked;
  else value = target.value;

  const type = target.getAttribute("data-type") || "string";
  if (type === "number") {
    const parsed = Number(value);
    value = Number.isFinite(parsed) ? parsed : 0;
  }
  if (target.getAttribute("data-percent-input") === "1" && typeof value === "number") {
    value /= 100;
  }

  setByPath(state, path, value);
  ensureValidState();
  savePlan();
  updateLearnOutputs();
}

function renderAll() {
  ensureValidState();
  ui.activeNav = normalizeNavTarget(ui.activeNav || state.uiState.activeNav || "dashboard");
  state.uiState.activeNav = ui.activeNav;
  ui.lastModel = buildPlanModel(state);

  const showLanding = state.uiState.firstRun;
  if (el.landingPanel) el.landingPanel.hidden = !showLanding;
  if (el.appPanel) el.appPanel.hidden = showLanding;
  if (el.bottomTabs) el.bottomTabs.hidden = showLanding;

  renderNav();
  renderDashboard();
  renderLearn();
  renderWizard();
  renderPlanInputs();
  renderAdvanced();
  renderStress();
  renderNotes();
  bindInlineTooltipTriggers(document.body);
}

function renderNav() {
  const nav = ui.activeNav;
  el.tabButtons.forEach((btn) => {
    const isActive = (btn.dataset.navTarget || "") === nav;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-current", isActive ? "page" : "false");
  });
  el.navPanels.forEach((panel) => {
    const isActive = panel.dataset.navPanel === nav;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function setActiveNav(next) {
  ui.activeNav = normalizeNavTarget(next);
  state.uiState.firstRun = false;
  state.uiState.activeNav = ui.activeNav;
  state.uiState.hasStarted = true;
  syncNavHash(ui.activeNav);
  savePlan();
  renderAll();
}

function renderDashboard() {
  const model = ui.lastModel;
  if (!model) return;

  const retireRows = model.base.rows.filter((row) => row.age >= state.profile.retirementAge);
  const minAge = retireRows[0]?.age ?? state.profile.retirementAge;
  const maxAge = retireRows[retireRows.length - 1]?.age ?? state.profile.lifeExpectancy;
  if (ui.selectedAge == null) ui.selectedAge = minAge;
  ui.selectedAge = clamp(ui.selectedAge, minAge, maxAge);

  el.dashboardStressToggle.checked = ui.showStressBand;
  el.dollarModeToggle.checked = ui.showTodaysDollars;
  el.yearScrubber.min = String(minAge);
  el.yearScrubber.max = String(maxAge);
  el.yearScrubber.value = String(ui.selectedAge);
  el.yearScrubberValue.textContent = `Age ${ui.selectedAge}`;

  renderKpiCards(model, ui.selectedAge);
  renderBalanceLegend();
  drawMainChart(model.base.rows, model.best.rows, model.worst.rows);
  renderCoverageLegend();
  drawCoverageChart(model, ui.selectedAge);
  renderDashboardNarrative(model);
  renderDashboardReferences();
  renderDashboardStatus(model);

  const actions = buildNextActions(model);
  el.nextActions.innerHTML = actions.map((text) => `<li>${escapeHtml(text)}</li>`).join("");

  el.basicsSummary.innerHTML = [
    `Province: <strong>${PROVINCES[state.profile.province]}</strong>`,
    `Retire at <strong>${state.profile.retirementAge}</strong>, plan through age <strong>${state.profile.lifeExpectancy}</strong>.`,
    `Risk profile: <strong>${capitalize(state.assumptions.riskProfile)}</strong> (${formatPct(model.base.returnRate)} return).`,
    `Estimated first retirement year guaranteed income: <strong>${formatCurrency(model.kpis.firstYearGuaranteed)}</strong>.`,
    `Dashboard assumption: withdrawals are modeled as RRSP/RRIF taxable withdrawals for this explanatory view.`,
  ].join("<br>");
}

function renderDashboardStatus(model) {
  if (!el.dashboardStatus) return;
  const gap = model.kpis.firstYearGap;
  const depletionAge = model.kpis.depletionAge;
  let label = "Borderline";
  let css = "status-pill borderline";

  if (gap >= 0 && !depletionAge) {
    label = "On Track";
    css = "status-pill on-track";
  } else if (gap < -10000 || depletionAge) {
    label = "Off Track";
    css = "status-pill off-track";
  }

  el.dashboardStatus.className = css;
  el.dashboardStatus.textContent = `Are you on track? ${label}`;
}

function renderDashboardReferences() {
  if (!el.dashboardReferences) return;
  el.dashboardReferences.innerHTML = OFFICIAL_REFERENCES.map((item, index) => `
    ${index > 0 ? '<span class="reference-sep" aria-hidden="true">|</span>' : ""}
    <a class="footer-reference-link" href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(item.label)}
    </a>
  `).join("");
}

function renderKpiCards(model, age) {
  const retirementRow = findRowByAge(model.base.rows, state.profile.retirementAge);
  const row = retirementRow || findRowByAge(model.base.rows, age);
  if (!row) return;
  if (el.kpiContext) {
    el.kpiContext.textContent = `All values shown at retirement start (Age ${state.profile.retirementAge}).`;
  }
  const kpis = [
    { label: "Retire Balance", value: formatCurrency(model.kpis.balanceAtRetirement), sub: `Age ${state.profile.retirementAge}`, tip: "kpiBalanceRetirement" },
    { label: "Spend Target", value: formatCurrency(row.spending), sub: `Age ${state.profile.retirementAge}`, tip: "kpiSpendingTarget" },
    { label: "Income Total", value: formatCurrency(row.guaranteedGross), sub: `Age ${state.profile.retirementAge}`, tip: "kpiGuaranteedIncome" },
    { label: "Net Gap", value: row.netGap > 0 ? formatCurrency(row.netGap) : formatCurrency(0), sub: row.netGap > 0 ? "Needs savings funding" : "Covered", tip: "kpiNetGap" },
    { label: "Gross Draw", value: formatCurrency(row.withdrawal), sub: `Tax drag ${formatCurrency(row.taxOnWithdrawal + row.oasClawback)}`, tip: "kpiGrossWithdrawal" },
    { label: "Tax Load", value: formatCurrency(row.tax + row.oasClawback), sub: `${formatPct(row.effectiveTaxRate)} at start`, tip: "oasClawback" },
  ];
  el.kpiGrid.innerHTML = kpis.map((card) => `
    <article class="metric-card">
      <span class="label">${escapeHtml(card.label)} ${tooltipButton(card.tip)}</span>
      <span class="value">${escapeHtml(card.value)}</span>
      <span class="sub">${escapeHtml(card.sub)}</span>
    </article>
  `).join("");
}

function renderDashboardNarrative(model) {
  const current = findRowByAge(model.base.rows, ui.selectedAge || state.profile.retirementAge);
  if (!current) return;
  const coveragePct = current.spending > 0 ? (current.guaranteedNet / current.spending) * 100 : 0;
  el.walkthroughStrip.innerHTML = `
    <article class="walk-step">
      <h4>Step 1 ${tooltipButton("kpiGuaranteedIncome")}</h4>
      <p>Guaranteed income covers <strong>${coveragePct.toFixed(0)}%</strong> of your spending target.</p>
    </article>
    <article class="walk-step">
      <h4>Step 2 ${tooltipButton("kpiNetGap")}</h4>
      <p>Remaining <strong>after-tax gap</strong> is <strong>${formatCurrency(current.netGap)}</strong>.</p>
    </article>
    <article class="walk-step">
      <h4>Step 3 ${tooltipButton("kpiGrossWithdrawal")}</h4>
      <p>You withdraw <strong>${formatCurrency(current.withdrawal)}</strong> gross; tax drag is <strong>${formatCurrency(current.taxOnWithdrawal)}</strong>.</p>
    </article>
  `;
  bindInlineTooltipTriggers(el.walkthroughStrip);
  renderYearCards(model);
}

function bindInlineTooltipTriggers(container) {
  if (!(container instanceof HTMLElement)) return;
  const buttons = container.querySelectorAll("[data-tooltip-key]");
  buttons.forEach((button) => {
    if (!(button instanceof HTMLElement)) return;
    if (button.dataset.tipBound === "1") return;
    button.dataset.tipBound = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const key = button.getAttribute("data-tooltip-key") || "";
      if (!key) return;
      if (ui.tooltipKey === key) closeTooltip();
      else openTooltip(key, button);
    });
    button.addEventListener("keydown", (event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      const key = button.getAttribute("data-tooltip-key") || "";
      if (!key) return;
      if (ui.tooltipKey === key) closeTooltip();
      else openTooltip(key, button);
    });
  });
}

function renderYearCards(model) {
  const firstRetRow = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
  const checkpoints = [
    { label: `First retirement year (Age ${firstRetRow?.age ?? state.profile.retirementAge})`, row: firstRetRow },
    { label: "Age 65", row: findRowByAge(model.base.rows, 65) },
    { label: "RRIF conversion year (Age 71)", row: findRowByAge(model.base.rows, 71) },
  ];

  el.yearCards.innerHTML = checkpoints.map((point) => {
    if (!point.row) return `<article class="withdrawal-card"><h4>${escapeHtml(point.label)}</h4><p class="muted small-copy">Not in projection horizon.</p></article>`;
    const row = point.row;
    const parts = [
      { label: "Guaranteed income", value: row.guaranteedNet, color: "#16a34a" },
      { label: "Net withdrawal", value: row.netFromWithdrawal, color: "#0f6abf" },
      { label: "Tax wedge", value: row.taxOnWithdrawal + row.oasClawback, color: "#d9485f" },
    ];
    const total = Math.max(1, parts.reduce((sum, p) => sum + p.value, 0));
    return `
      <article class="withdrawal-card">
        <h4>${escapeHtml(point.label)}</h4>
        <div class="withdrawal-bar">
          ${parts.map((p) => `<span title="${escapeHtml(p.label)} ${formatCurrency(p.value)}" style="width:${((p.value / total) * 100).toFixed(1)}%; background:${p.color};"></span>`).join("")}
        </div>
        <div class="withdrawal-metrics">
          <div><strong>Spending target (after-tax) ${tooltipButton("kpiSpendingTarget")}</strong><span>${formatCurrency(row.spending)}</span></div>
          <div><strong>Guaranteed income total ${tooltipButton("kpiGuaranteedIncome")}</strong><span>${formatCurrency(row.guaranteedGross)}</span></div>
          <div><strong>Net gap funded by savings ${tooltipButton("kpiNetGap")}</strong><span>${formatCurrency(row.netGap)}</span></div>
          <div><strong>Gross withdrawal required ${tooltipButton("kpiGrossWithdrawal")}</strong><span>${formatCurrency(row.withdrawal)}</span></div>
          <div><strong>Tax on withdrawal ${tooltipButton("learnTaxGrossUp")}</strong><span>${formatCurrency(row.taxOnWithdrawal)}</span></div>
          <div><strong>OAS clawback ${tooltipButton("oasClawback")}</strong><span>${formatCurrency(row.oasClawback)}</span></div>
          <div><strong>RRIF minimum (if applicable) ${tooltipButton("rrifMinimums")}</strong><span>${formatCurrency(row.rrifMinimum)}</span></div>
          <div><strong>Effective tax rate ${tooltipButton("learnTaxGrossUp")}</strong><span>${formatPct(row.effectiveTaxRate)}</span></div>
        </div>
      </article>
    `;
  }).join("");
}

function renderBalanceLegend() {
  const items = [["Portfolio balance", "#0f6abf"]];
  if (ui.showStressBand) items.push(["Stress band (best/worst)", "#7aa7d8"]);
  el.chartLegend.innerHTML = items.map((item) => `
    <span class="legend-item">
      <span class="legend-chip" style="background:${item[1]};"></span>${item[0]}
    </span>
  `).join("");
}

function renderCoverageLegend() {
  const items = [
    ["Guaranteed income: Pension", "#f59e0b"],
    ["Guaranteed income: CPP", "#16a34a"],
    ["Guaranteed income: OAS", "#0ea5a8"],
    ["From savings: RRSP/RRIF withdrawal (net)", "#0f6abf"],
    ["Tax on withdrawal + clawback (drag)", "#d9485f"],
    ["After-tax spending target", "#111827"],
  ];

  el.coverageLegend.innerHTML = items.map((item) => `
    <span class="legend-item"><span class="legend-chip" style="background:${item[1]};"></span>${item[0]}</span>
  `).join("");
}

function handleCoverageChartPointer(event) {
  const model = ui.lastModel;
  if (!model || !el.coverageChart || !el.coverageHover) return;
  const rows = model.base.rows.filter((row) => row.age >= state.profile.retirementAge);
  if (!rows.length) return;
  const rect = el.coverageChart.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const idx = clamp(Math.round((x / rect.width) * (rows.length - 1)), 0, rows.length - 1);
  const row = rows[idx];
  const pension = amountForDisplay(row, row.pensionNet + row.spousePensionNet);
  const cpp = amountForDisplay(row, row.cppNet + row.spouseCppNet);
  const oas = amountForDisplay(row, row.oasNet + row.spouseOasNet);
  const netW = amountForDisplay(row, row.netFromWithdrawal);
  const taxW = amountForDisplay(row, row.taxOnWithdrawal + row.oasClawback);
  const spend = amountForDisplay(row, row.spending);
  el.coverageHover.innerHTML = `
    <strong>Age ${row.age}</strong><br>
    Pension: ${formatCurrency(pension)}<br>
    CPP: ${formatCurrency(cpp)}<br>
    OAS: ${formatCurrency(oas)}<br>
    Net withdrawal: ${formatCurrency(netW)}<br>
    Tax wedge (tax + clawback): ${formatCurrency(taxW)}<br>
    Spending target: ${formatCurrency(spend)}
  `;
  el.coverageHover.hidden = false;
  el.coverageHover.style.left = `${clamp(x + 10, 8, rect.width - 220)}px`;
  el.coverageHover.style.top = "8px";
}

function drawCoverageChart(model, selectedAge) {
  const canvas = el.coverageChart;
  if (!canvas) return;
  const rows = model.base.rows.filter((row) => row.age >= state.profile.retirementAge);
  if (!rows.length) return;

  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(800, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(340 * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = 340;
  const pad = { left: 52, right: 16, top: 16, bottom: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  ctx.clearRect(0, 0, w, h);

  const values = [];
  rows.forEach((r) => {
    values.push(
      amountForDisplay(r, r.guaranteedNet + r.netFromWithdrawal + r.taxOnWithdrawal + r.oasClawback),
      amountForDisplay(r, r.spending)
    );
  });
  const maxY = Math.max(1, ...values) * 1.15;

  const x = (i) => pad.left + (innerW * i) / Math.max(1, rows.length - 1);
  const y = (v) => pad.top + innerH - (v / maxY) * innerH;
  const barW = Math.max(6, Math.min(14, innerW / Math.max(rows.length, 30)));

  ctx.strokeStyle = "#e1e8f3";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const gy = pad.top + (innerH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(w - pad.right, gy);
    ctx.stroke();
  }

  rows.forEach((row, idx) => {
    const cx = x(idx) - barW / 2;
    const pension = amountForDisplay(row, row.pensionNet + row.spousePensionNet);
    const cpp = amountForDisplay(row, row.cppNet + row.spouseCppNet);
    const oas = amountForDisplay(row, row.oasNet + row.spouseOasNet);
    const netW = amountForDisplay(row, row.netFromWithdrawal);
    const taxW = amountForDisplay(row, row.taxOnWithdrawal + row.oasClawback);

    let stack = 0;
    const segments = [
      [pension, "#f59e0b"],
      [cpp, "#16a34a"],
      [oas, "#0ea5a8"],
      [netW, "#0f6abf"],
      [taxW, "#d9485f"],
    ];
    segments.forEach(([value, color]) => {
      if (value <= 0) return;
      const yTop = y(stack + value);
      const yBottom = y(stack);
      ctx.fillStyle = color;
      ctx.fillRect(cx, yTop, barW, Math.max(1, yBottom - yTop));
      stack += value;
    });
  });

  const linePts = rows.map((r, i) => [x(i), y(amountForDisplay(r, r.spending))]);
  plotLine(ctx, linePts, "#111827", 1.8);

  const mark = findRowByAge(rows, selectedAge);
  if (mark) {
    const idx = rows.findIndex((r) => r.age === mark.age);
    const mx = x(idx);
    ctx.strokeStyle = "rgba(15,106,191,0.45)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mx, pad.top);
    ctx.lineTo(mx, pad.top + innerH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "#5f6b7d";
  ctx.font = "12px Avenir Next";
  ctx.fillText(formatCurrency(0), 8, h - 10);
  ctx.fillText(formatCompactCurrency(maxY), 8, pad.top + 4);
  const step = Math.max(1, Math.ceil((rows.length - 1) / Math.max(3, Math.floor(innerW / 110))));
  for (let i = 0; i < rows.length; i += step) {
    const label = `Age ${rows[i].age}`;
    const lx = x(i);
    const lw = ctx.measureText(label).width;
    ctx.fillText(label, clamp(lx - lw / 2, pad.left, w - pad.right - lw), h - 10);
  }
}

function amountForDisplay(row, amount) {
  if (!ui.showTodaysDollars) return amount;
  const yearsFromNow = Math.max(0, row.year - APP.currentYear);
  return amount / Math.pow(1 + state.assumptions.inflation, yearsFromNow);
}

function findRowByAge(rows, age) {
  if (!rows.length) return null;
  const exact = rows.find((row) => row.age === age);
  if (exact) return exact;
  let best = rows[0];
  let bestDistance = Math.abs(best.age - age);
  for (const row of rows) {
    const d = Math.abs(row.age - age);
    if (d < bestDistance) {
      best = row;
      bestDistance = d;
    }
  }
  return best;
}

function findFirstRetirementRow(rows, retirementAge) {
  return rows.find((row) => row.age >= retirementAge) || rows[0] || null;
}

function renderPlanInputs() {
  if (!el.planInputsPanel) return;
  el.planInputsPanel.innerHTML = `
    <p class="what-affects"><strong>Plan inputs:</strong> Edit assumptions directly here. Changes apply instantly.</p>
    <div class="form-grid compact-mobile-two">
      <div class="form-span-full">
        ${selectField("Province", "profile.province", Object.entries(PROVINCES).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
      </div>
      ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
      ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
      ${numberField("Annual spending target", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
      ${numberField("Inflation (%)", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
      <div class="form-span-full">
        <div class="label-row">Investment return profile ${tooltipButton("riskProfile")}</div>
        <div class="inline-radio-row">
          ${riskButton("conservative")}
          ${riskButton("balanced")}
          ${riskButton("aggressive")}
        </div>
      </div>
      ${numberField("CPP income at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65")}
      ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
      ${numberField("OAS income at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65")}
      ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
      <label class="inline-check form-span-full">
        <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
        Enable private/workplace pension
      </label>
      ${numberField("Private pension income", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled)}
      ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
      ${numberField("Savings balance", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
      ${numberField("Annual contributions", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
      ${numberField("Contribution increase (%/yr)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true, false, true)}
    </div>
    <div class="subsection">
      <div class="landing-actions">
        <button class="btn btn-secondary" type="button" data-action="open-learn">Learn before editing</button>
        <button class="btn btn-primary" type="button" data-action="open-advanced">Open advanced settings</button>
      </div>
    </div>
  `;
}

function getPlanSummaryValue(key) {
  if (key === "retirementAge") return `Age ${state.profile.retirementAge}`;
  if (key === "desiredSpending") return `${formatCurrency(state.profile.desiredSpending)} after-tax (today's dollars)`;
  if (key === "inflation") return formatPct(state.assumptions.inflation);
  if (key === "returnProfile") return `${capitalize(state.assumptions.riskProfile)} (${formatPct(getReturnRate(state))})`;
  if (key === "cpp") return `${formatCurrency(state.income.cpp.amountAt65)} at age 65`;
  if (key === "oas") return `${formatCurrency(state.income.oas.amountAt65)} at age 65`;
  if (key === "pension") return state.income.pension.enabled
    ? `${formatCurrency(state.income.pension.amount)} from age ${state.income.pension.startAge}`
    : "Not enabled";
  if (key === "savings") return formatCurrency(state.savings.currentTotal);
  if (key === "contribution") return `${formatCurrency(state.savings.annualContribution)} / year`;
  if (key === "province") return PROVINCES[state.profile.province] || state.profile.province;
  return "-";
}

function openPlanEditor(key) {
  ui.planEditorKey = key;
  if (!el.planEditorModal || !el.planEditorContent || !el.planEditorTitle) return;
  const config = getPlanEditorConfig(key);
  if (!config) return;
  el.planEditorTitle.textContent = config.title;
  el.planEditorContent.innerHTML = config.body;
  bindInlineTooltipTriggers(el.planEditorContent);
  el.planEditorModal.showModal();
}

function closePlanEditor() {
  ui.planEditorKey = "";
  el.planEditorModal?.close();
}

function getPlanEditorConfig(key) {
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
        ${selectField("Province", "profile.province", Object.entries(PROVINCES).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
      `,
    };
  }
  return null;
}

function renderLearn() {
  if (!el.learnPanel) return;
  const learn = state.uiState.learn;
  if (!learn) return;
  const progress = state.uiState.learningProgress || createDefaultLearningProgress();
  const completed = LEARN_PROGRESS_ITEMS.filter((item) => progress[item.key]).length;

  el.learnPanel.innerHTML = `
    <div class="learn-layout">
      <aside class="learn-toc-wrap no-print">
        <nav class="learn-toc" aria-label="Learn table of contents">
          <h3>On this page</h3>
          <a href="#learn-inflation">1. Today Dollars vs Future Dollars (Inflation)</a>
          <a href="#learn-income">2. Retirement Income Sources</a>
          <a href="#learn-indexing">3. What Indexing Means</a>
          <a href="#learn-taxes">4. Taxes in Retirement</a>
          <a href="#learn-rrif">5. RRSP to RRIF Rules</a>
          <a href="#learn-spousal">6. Spousal Tax Sharing</a>
          <a href="#learn-oas">7. OAS Clawback</a>
          <a href="#learn-life">8. Life Expectancy and Planning Horizon</a>
          <a href="#learn-phases">9. Go-Go / Slow-Go / No-Go Retirement Years</a>
          <a href="#learn-together">10. Bringing It All Together</a>
        </nav>
      </aside>
      <div class="learn-content">
        <section class="learn-section">
          <h3>Retirement Knowledge Progress</h3>
          <p class="muted small-copy">${completed}/${LEARN_PROGRESS_ITEMS.length} lessons marked complete.</p>
          <div class="learn-progress-list">
            ${LEARN_PROGRESS_ITEMS.map((item) => `
              <button type="button" class="learn-progress-item ${progress[item.key] ? "done" : ""}" data-action="toggle-learn-progress" data-value="${item.key}" aria-pressed="${progress[item.key] ? "true" : "false"}">
                <span>${progress[item.key] ? "✓" : "○"}</span>
                <span>${escapeHtml(item.label)}</span>
              </button>
            `).join("")}
          </div>
        </section>

        <section class="learn-section" id="learn-inflation">
          <h3>1) Today Dollars vs Future Dollars (Inflation)</h3>
          <p class="muted">A retirement budget set in today’s dollars will be higher in future years. Inflation quietly changes what your money buys.</p>
          ${learnCallouts("Common misconception", "If inflation looks low today, it will not matter over decades.", "Try moving the slider", "Increase years and inflation to see compounding in action.")}
          <div class="form-grid compact-mobile-two">
            ${learnNumberField("Retirement Annual Budget (Today's Dollars)", "uiState.learn.inflation.spendingToday", learn.inflation.spendingToday, { min: 10000, max: 400000, step: 500 }, "learnInflationCalc")}
            ${learnNumberField("Years until retirement", "uiState.learn.inflation.years", learn.inflation.years, { min: 0, max: 45, step: 1 }, "retirementAge", false, false, true)}
            <label class="form-span-full">
              <span class="label-row">Inflation rate <strong id="learnInflationRateValue">${formatNumber(toPct(learn.inflation.rate))}%</strong> ${tooltipButton("inflation")}</span>
              <input type="range" data-learn-bind="uiState.learn.inflation.rate" data-type="number" data-percent-input="1" min="1" max="5" step="0.1" value="${formatNumber(toPct(learn.inflation.rate))}" aria-label="Inflation rate slider" />
            </label>
          </div>
          <div class="preview-kpi" id="learnInflationOut"></div>
          <canvas id="learnInflationChart" width="1000" height="240" aria-label="Inflation spending growth chart" role="img"></canvas>
          <p class="small-copy muted"><strong>Why this matters:</strong> If your spending target is not inflation-aware, your future plan can be underfunded.</p>
        </section>

        <section class="learn-section" id="learn-income">
          <h3>2) Retirement Income Sources</h3>
          <p class="muted">Most plans combine guaranteed income (private pension, CPP, OAS) with withdrawals from savings.</p>
          <ul class="plain-list">
            <li><strong>Private pension:</strong> often starts at a set age and may or may not be indexed.</li>
            <li><strong>CPP:</strong> public pension based on your contribution history.</li>
            <li><strong>OAS:</strong> age-based benefit, separate from CPP, with clawback at higher incomes.</li>
            <li><strong>RRSP/RRIF withdrawals:</strong> taxable income used to fill the remaining gap.</li>
            <li><strong>TFSA savings:</strong> eligible withdrawals are tax-free, including TFSA capital gains.</li>
            <li><strong>Cash / non-registered savings:</strong> growth can create taxable income (for example interest, dividends, or capital gains).</li>
          </ul>
          <p class="small-copy muted"><strong>Tax note:</strong> TFSA capital gains are not taxed when withdrawn. Capital gains from cash/non-registered investing are taxable under current tax rules.</p>
        </section>

        <section class="learn-section" id="learn-indexing">
          <h3>3) What Indexing Means</h3>
          <p class="muted">Indexed income grows with inflation. Non-indexed income stays flat in dollars but loses purchasing power over time.</p>
          ${learnCallouts("Why this matters", "CPP and OAS are indexed. This helps protect spending power as prices rise.", "Try moving the slider", "Raise inflation and compare indexed vs flat income over 25 years.")}
          <div class="form-grid compact-mobile-two">
            ${learnNumberField("Starting income", "uiState.learn.indexedIncome.startIncome", learn.indexedIncome.startIncome, { min: 0, max: 100000, step: 250 }, "cppAmount65")}
            ${learnNumberField("Years", "uiState.learn.indexedIncome.years", learn.indexedIncome.years, { min: 1, max: 40, step: 1 }, "lifeExpectancy", false, false, true)}
            <label class="form-span-full">
              <span class="label-row">Inflation rate <strong id="learnIndexedInflationValue">${formatNumber(toPct(learn.indexedIncome.inflation))}%</strong> ${tooltipButton("inflation")}</span>
              <input type="range" data-learn-bind="uiState.learn.indexedIncome.inflation" data-type="number" data-percent-input="1" min="0" max="5" step="0.1" value="${formatNumber(toPct(learn.indexedIncome.inflation))}" aria-label="Indexed income inflation slider" />
            </label>
          </div>
          <canvas id="learnIndexedChart" width="1000" height="240" aria-label="Indexed vs non-indexed income chart" role="img"></canvas>
          <div class="legend-row learn-chart-legend">
            <span class="legend-item"><span class="legend-chip" style="background:#16a34a;"></span>Indexed income</span>
            <span class="legend-item"><span class="legend-chip" style="background:#f59e0b;"></span>Non-indexed income (nominal)</span>
            <span class="legend-item"><span class="legend-chip" style="background:#d9485f;"></span>Non-indexed purchasing power (today's dollars)</span>
          </div>
          <p class="small-copy muted"><strong>Why this matters:</strong> A flat pension can feel smaller each year when prices rise.</p>
        </section>

        <section class="learn-section" id="learn-taxes">
          <h3>4) Taxes in Retirement</h3>
          <p class="muted">Retirement spending targets are usually after-tax, but withdrawals from RRSP/RRIF are taxable. That creates a gross-up need.</p>
          ${learnCallouts("Common misconception", "If I need $80,000 to spend, I only need to withdraw $80,000.", "Why this matters", "You need to withdraw enough to cover both spending and tax.")}
          <div class="form-grid compact-mobile-two">
            ${learnNumberField("After-tax income goal", "uiState.learn.taxGrossUp.netGoal", learn.taxGrossUp.netGoal, { min: 12000, max: 300000, step: 500 }, "desiredSpending")}
            <label class="form-span-full">
              <span class="label-row">Effective tax rate <strong id="learnTaxRateValue">${formatNumber(toPct(learn.taxGrossUp.rate))}%</strong> ${tooltipButton("learnTaxGrossUp")}</span>
              <input type="range" data-learn-bind="uiState.learn.taxGrossUp.rate" data-type="number" data-percent-input="1" min="5" max="45" step="0.5" value="${formatNumber(toPct(learn.taxGrossUp.rate))}" aria-label="Effective tax rate slider" />
            </label>
          </div>
          <div class="preview-kpi" id="learnTaxOut"></div>
          <p class="small-copy muted">Marginal tax applies to the next dollar. Effective tax is average tax across all dollars.</p>
        </section>

        <section class="learn-section" id="learn-rrif">
          <h3>5) RRSP to RRIF Rules</h3>
          <p class="muted">You must convert RRSP assets to a RRIF (or annuity) by the end of age 71. RRIF has minimum withdrawals that grow with age.</p>
          <div class="form-grid compact-mobile-two">
            <label class="form-span-full">
              <span class="label-row">Age <strong id="learnRrifAgeValue">${formatNumber(learn.rrif.age)}</strong> ${tooltipButton("learnRrifMinimum")}</span>
              <input type="range" data-learn-bind="uiState.learn.rrif.age" data-type="number" min="65" max="95" step="1" value="${formatNumber(learn.rrif.age)}" aria-label="RRIF age slider" />
            </label>
            ${learnNumberField("RRIF balance", "uiState.learn.rrif.balance", learn.rrif.balance, { min: 0, max: 5000000, step: 1000 }, "rrifMinimums")}
          </div>
          <div class="preview-kpi learn-rrif-out" id="learnRrifOut"></div>
          <p class="small-copy muted"><strong>Why this matters:</strong> Even when spending drops, RRIF minimums can keep taxable income elevated.</p>
        </section>

        <section class="learn-section" id="learn-spousal">
          <h3>6) Spousal Tax Sharing</h3>
          <p class="muted">Pension income splitting can move up to 50% of eligible pension income between spouses, potentially reducing combined tax.</p>
          <div class="form-grid compact-mobile-two">
            ${learnNumberField("Spouse A Income", "uiState.learn.spousalSplit.spouseA", learn.spousalSplit.spouseA, { min: 0, max: 300000, step: 500 }, "learnPensionSplit")}
            ${learnNumberField("Spouse B Income", "uiState.learn.spousalSplit.spouseB", learn.spousalSplit.spouseB, { min: 0, max: 300000, step: 500 }, "learnPensionSplit")}
            <label class="form-span-full">
              <span class="label-row">Split to spouse B <strong id="learnSplitPctValue">${formatNumber(toPct(learn.spousalSplit.splitPct))}%</strong> ${tooltipButton("learnPensionSplit")}</span>
              <input type="range" data-learn-bind="uiState.learn.spousalSplit.splitPct" data-type="number" data-percent-input="1" min="0" max="50" step="1" value="${formatNumber(toPct(learn.spousalSplit.splitPct))}" aria-label="Pension split percentage slider" />
            </label>
          </div>
          <div class="preview-kpi" id="learnSpousalOut"></div>
        </section>

        <section class="learn-section" id="learn-oas">
          <h3>7) OAS Clawback</h3>
          <p class="muted">When taxable income rises above the OAS recovery threshold, part of OAS is repaid through recovery tax.</p>
          <div class="form-grid compact-mobile-two">
            <label class="form-span-full">
              <span class="label-row">Annual income <strong id="learnOasIncomeValue">${formatCurrency(learn.oas.income)}</strong> ${tooltipButton("learnOasClawback")}</span>
              <input type="range" data-learn-bind="uiState.learn.oas.income" data-type="number" min="30000" max="250000" step="500" value="${formatNumber(learn.oas.income)}" aria-label="Annual income slider" />
            </label>
            ${learnNumberField("OAS monthly (per person)", "uiState.learn.oas.monthly", learn.oas.monthly, { min: 500, max: 1200, step: 1 }, "oasAmount65", false, false, true)}
            <label class="compact-field">
              <span class="label-row">Recipients ${tooltipButton("learnOasClawback")}</span>
              <select data-learn-bind="uiState.learn.oas.recipients" data-type="number" aria-label="OAS recipients">
                <option value="1" ${Number(learn.oas.recipients) === 1 ? "selected" : ""}>1</option>
                <option value="2" ${Number(learn.oas.recipients) === 2 ? "selected" : ""}>2</option>
              </select>
            </label>
          </div>
          <div class="preview-kpi" id="learnOasOut"></div>
        </section>

        <section class="learn-section" id="learn-life">
          <h3>8) Life Expectancy and Planning Horizon</h3>
          <p class="muted">Planning for a longer horizon helps protect against outliving your money.</p>
          <ul class="plain-list">
            <li>Retiring at 60 and planning to 95 means a 35-year drawdown horizon.</li>
            <li>Small spending or return changes compound over long horizons.</li>
            <li>Use stress tests to understand downside risk.</li>
          </ul>
        </section>

        <section class="learn-section" id="learn-phases">
          <h3>9) Go-Go / Slow-Go / No-Go Retirement Years</h3>
          <p class="muted">Many retirees spend more in early active years, then less later. This can improve planning realism.</p>
          <div class="form-grid">
            <div class="form-span-full">
              ${learnNumberField("Base Annual Spend", "uiState.learn.phases.base", learn.phases.base, { min: 12000, max: 250000, step: 500 }, "desiredSpending")}
            </div>
            ${learnNumberField("Go-Go years (spend more)", "uiState.learn.phases.goYears", learn.phases.goYears, { min: 1, max: 20, step: 1 }, "lifeExpectancy", false, false, true)}
            ${learnNumberField("Go-Go spending % of base", "uiState.learn.phases.goPct", toPct(learn.phases.goPct), { min: 60, max: 150, step: 1 }, "desiredSpending", true, false, true)}
            ${learnNumberField("Slow-Go years (spend less)", "uiState.learn.phases.slowYears", learn.phases.slowYears, { min: 1, max: 20, step: 1 }, "lifeExpectancy", false, false, true)}
            ${learnNumberField("Slow-Go spending % of base", "uiState.learn.phases.slowPct", toPct(learn.phases.slowPct), { min: 50, max: 130, step: 1 }, "desiredSpending", true, false, true)}
            ${learnNumberField("No-Go years (spend less again)", "uiState.learn.phases.noYears", learn.phases.noYears, { min: 1, max: 25, step: 1 }, "lifeExpectancy", false, false, true)}
            ${learnNumberField("No-Go spending % of base", "uiState.learn.phases.noPct", toPct(learn.phases.noPct), { min: 40, max: 120, step: 1 }, "desiredSpending", true, false, true)}
          </div>
          <canvas id="learnPhaseChart" width="1000" height="240" aria-label="Retirement spending phases chart" role="img"></canvas>
          <div class="preview-kpi" id="learnPhaseOut"></div>
          <p class="small-copy muted"><strong>Important takeaway:</strong> Oversaving has opportunity cost. A phased spending plan can better match real life.</p>
        </section>

        <section class="learn-section" id="learn-together">
          <h3>10) Bringing It All Together</h3>
          <p class="muted">You now have the core concepts to build a stronger retirement plan with confidence.</p>
          <p class="small-copy muted">Use your new understanding of inflation, indexing, taxes, RRIF rules, and spending phases in the Guided Setup flow.</p>
          <p class="small-copy muted">If this tool helped you understand retirement planning, consider supporting its development: <a href="${escapeHtml(SUPPORT_URL)}" target="_blank" rel="noopener noreferrer">Support</a>.</p>
          <div class="landing-actions">
            <button class="btn btn-primary" type="button" data-action="launch-planner">Go to Guided setup</button>
          </div>
        </section>
      </div>
    </div>
  `;

  updateLearnOutputs();
}

function updateLearnOutputs() {
  if (!el.learnPanel || !el.learnPanel.querySelector("#learnInflationOut")) return;
  const learn = state.uiState.learn;

  const infAnnual = learn.inflation.spendingToday * Math.pow(1 + learn.inflation.rate, learn.inflation.years);
  const infRateValue = el.learnPanel.querySelector("#learnInflationRateValue");
  if (infRateValue) infRateValue.textContent = `${formatNumber(toPct(learn.inflation.rate))}%`;
  const infOut = el.learnPanel.querySelector("#learnInflationOut");
  if (infOut) {
    infOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Future Annual Budget</strong><span>${formatCurrency(infAnnual)}</span></div>
    `;
  }

  const gross = learn.taxGrossUp.rate >= 0.99 ? learn.taxGrossUp.netGoal : learn.taxGrossUp.netGoal / (1 - learn.taxGrossUp.rate);
  const tax = Math.max(0, gross - learn.taxGrossUp.netGoal);
  const taxRateValue = el.learnPanel.querySelector("#learnTaxRateValue");
  if (taxRateValue) taxRateValue.textContent = `${formatNumber(toPct(learn.taxGrossUp.rate))}%`;
  const taxOut = el.learnPanel.querySelector("#learnTaxOut");
  if (taxOut) {
    taxOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Required gross withdrawal</strong><span>${formatCurrency(gross)}</span></div>
      <div class="preview-kpi-item"><strong>Tax amount</strong><span>${formatCurrency(tax)}</span></div>
      <div class="preview-kpi-item"><strong>Net target</strong><span>${formatCurrency(learn.taxGrossUp.netGoal)}</span></div>
      <div class="preview-kpi-item"><strong>Gross-up difference</strong><span>${formatCurrency(gross - learn.taxGrossUp.netGoal)}</span></div>
    `;
  }

  const rrifFactor = RRIF_MIN_WITHDRAWAL[learn.rrif.age] ?? 0.2;
  const rrifMin = learn.rrif.balance * rrifFactor;
  const rrifAgeValue = el.learnPanel.querySelector("#learnRrifAgeValue");
  if (rrifAgeValue) rrifAgeValue.textContent = `${formatNumber(learn.rrif.age)}`;
  const rrifOut = el.learnPanel.querySelector("#learnRrifOut");
  if (rrifOut) {
    rrifOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Minimum withdrawal %</strong><span>${formatPct(rrifFactor)}</span></div>
      <div class="preview-kpi-item"><strong>Minimum withdrawal amount</strong><span>${formatCurrency(rrifMin)}</span></div>
    `;
  }

  const oasAnnualTotal = learn.oas.monthly * 12 * Number(learn.oas.recipients || 1);
  const oasThreshold = 90000;
  const oasLoss = Math.min(oasAnnualTotal, Math.max(0, (learn.oas.income - oasThreshold) * 0.15));
  const oasRemain = Math.max(0, oasAnnualTotal - oasLoss);
  const oasIncomeValue = el.learnPanel.querySelector("#learnOasIncomeValue");
  if (oasIncomeValue) oasIncomeValue.textContent = `${formatCurrency(learn.oas.income)}`;
  const oasOut = el.learnPanel.querySelector("#learnOasOut");
  if (oasOut) {
    oasOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Estimated OAS lost</strong><span>${formatCurrency(oasLoss)}</span></div>
      <div class="preview-kpi-item"><strong>Estimated OAS remaining</strong><span>${formatCurrency(oasRemain)}</span></div>
      <div class="preview-kpi-item"><strong>OAS before clawback</strong><span>${formatCurrency(oasAnnualTotal)}</span></div>
      <div class="preview-kpi-item"><strong>Threshold used</strong><span>${formatCurrency(oasThreshold)}</span></div>
    `;
  }

  const split = clamp(learn.spousalSplit.splitPct, 0, 0.5);
  const splitPctValue = el.learnPanel.querySelector("#learnSplitPctValue");
  if (splitPctValue) splitPctValue.textContent = `${formatNumber(toPct(split))}%`;
  const move = learn.spousalSplit.spouseA * split;
  const beforeTax = estimateTotalTax(state, learn.spousalSplit.spouseA, 0) + estimateTotalTax(state, learn.spousalSplit.spouseB, 0);
  const afterTax = estimateTotalTax(state, Math.max(0, learn.spousalSplit.spouseA - move), 0)
    + estimateTotalTax(state, learn.spousalSplit.spouseB + move, 0);
  const spousalOut = el.learnPanel.querySelector("#learnSpousalOut");
  if (spousalOut) {
    spousalOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Combined tax before split</strong><span>${formatCurrency(beforeTax)}</span></div>
      <div class="preview-kpi-item"><strong>Combined tax after split</strong><span>${formatCurrency(afterTax)}</span></div>
      <div class="preview-kpi-item"><strong>Estimated tax difference</strong><span>${formatSignedCurrency(beforeTax - afterTax)}</span></div>
      <div class="preview-kpi-item"><strong>Income shifted</strong><span>${formatCurrency(move)}</span></div>
    `;
  }

  const weightedSpending = calculatePhaseWeightedSpending(learn.phases);
  const phaseOut = el.learnPanel.querySelector("#learnPhaseOut");
  if (phaseOut) {
    phaseOut.innerHTML = `
      <div class="preview-kpi-item"><strong>Phase-weighted annual spending ${tooltipButton("phaseWeightedSpending")}</strong><span>${formatCurrency(weightedSpending)}</span></div>
      <div class="preview-kpi-item"><strong>Total years modeled</strong><span>${learn.phases.goYears + learn.phases.slowYears + learn.phases.noYears}</span></div>
    `;
    bindInlineTooltipTriggers(phaseOut);
  }

  drawLearnInflationChart();
  drawLearnIndexedChart();
  drawLearnPhaseChart();
}


function renderWizard() {
  const step = clamp(state.uiState.wizardStep || 1, 1, 7);
  state.uiState.wizardStep = step;
  const progress = (step / 7) * 100;
  el.wizardProgressBar.style.width = `${progress}%`;
  el.wizardStepLabel.textContent = `Step ${step} of 7`;
  el.wizardBackBtn.disabled = step === 1;
  el.wizardNextBtn.textContent = step === 7 ? "Finish" : "Next";

  const model = ui.lastModel;
  const stepHtml = {
    1: wizardStepTimeline(model),
    2: wizardStepGoal(model),
    3: wizardStepSavings(model),
    4: wizardStepIncome(model),
    5: wizardStepReality(model),
    6: wizardStepTaxIntro(model),
    7: wizardStepRefine(model),
  }[step];

  el.wizardBody.innerHTML = stepHtml;
}

function wizardStepTimeline(model) {
  const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
  const planYears = Math.max(1, state.profile.lifeExpectancy - state.profile.retirementAge);

  return `
    <h3>Your Timeline</h3>
    <div class="wizard-grid compact-mobile-two">
      <div class="form-span-full">
        ${selectField("Province", "profile.province", Object.entries(PROVINCES).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
      </div>
      ${numberField("Year of birth", "profile.birthYear", state.profile.birthYear, { min: 1940, max: APP.currentYear - 18, step: 1 }, "birthYear", false, false, true)}
      ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
      ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>Your timeline sets saving years and retirement drawdown years.</li>
        <li>Longer life expectancy protects against longevity risk.</li>
        <li>Retiring earlier increases pressure on portfolio withdrawals.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Years to retirement</strong><span>${yearsToRetirement}</span></div>
        <div class="preview-kpi-item"><strong>Plan length</strong><span>${planYears} years</span></div>
      </div>
    </section>
  `;
}

function wizardStepGoal(model) {
  const yearsToRetirement = Math.max(0, state.profile.retirementAge - ageNow());
  const spendAtRet = state.profile.desiredSpending * Math.pow(1 + state.assumptions.inflation, yearsToRetirement);
  const neutral = model.kpis.firstYearGap >= 0;

  return `
    <h3>Your Goal</h3>
    <div class="wizard-grid compact-mobile-two">
      ${numberField("Desired retirement spending (after-tax, today dollars)", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
      ${numberField("Inflation assumption", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>Today’s dollars keep planning intuitive and comparable.</li>
        <li>Inflation-adjusted spending is the amount needed in future years.</li>
        <li>A funded indicator helps quickly gauge if assumptions are realistic.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Spending at retirement</strong><span>${formatCurrency(spendAtRet)}</span></div>
        <div class="preview-kpi-item"><strong>Neutral funded indicator</strong><span class="${neutral ? "status-good" : "status-bad"}">${neutral ? "On track" : "Needs improvement"}</span></div>
      </div>
    </section>
  `;
}

function wizardStepSavings(model) {
  const sustainable = model.kpis.sustainableIncome;

  return `
    <h3>Your Savings</h3>
    <div class="wizard-grid compact-mobile-two">
      ${numberField("Current total savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
      ${numberField("Annual contribution", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
      ${numberField("Contribution increase (% per year)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true, false, true)}
      <div class="form-span-full">
        <div class="label-row">Risk profile ${tooltipButton("riskProfile")}</div>
        <div class="inline-radio-row">
          ${riskButton("conservative")}
          ${riskButton("balanced")}
          ${riskButton("aggressive")}
        </div>
      </div>
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>Higher expected return assumptions can improve outcomes but include more uncertainty.</li>
        <li>Contribution consistency often matters as much as return assumptions.</li>
        <li>Use scenarios to test confidence in your plan.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Balance at retirement</strong><span>${formatCurrency(model.kpis.balanceAtRetirement)}</span></div>
        <div class="preview-kpi-item"><strong>Estimated sustainable income</strong><span>${formatCurrency(sustainable)}</span></div>
      </div>
    </section>
  `;
}

function wizardStepIncome(model) {
  const first = model.kpis.firstRetirementBreakdown;
  const total = Math.max(1, first.pension + first.cpp + first.oas + first.withdrawal);
  const pensionPct = (first.pension / total) * 100;
  const cppPct = (first.cpp / total) * 100;
  const oasPct = (first.oas / total) * 100;
  const drawPct = (first.withdrawal / total) * 100;
  return `
    <h3>Income Sources</h3>
    <div class="wizard-grid compact-mobile-two">
      <label class="form-span-full inline-check">
        <input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />
        Workplace pension?
      </label>
      ${numberField("Pension amount", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount", false, !state.income.pension.enabled, true)}
      ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge", false, !state.income.pension.enabled, true)}
      ${numberField("Estimated CPP at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 250 }, "cppAmount65", false, false, true)}
      ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge", false, false, true)}
      ${numberField("Estimated OAS at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65", false, false, true)}
      ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge", false, false, true)}
    </div>

    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>CPP and OAS timing affects annual income and gap coverage.</li>
        <li>Guaranteed income sources reduce pressure on portfolio withdrawals.</li>
        <li>Delaying CPP/OAS may improve late-retirement sustainability.</li>
      </ul>
    </section>

    <section class="preview-box" aria-live="polite">
      <h3>Mini preview: first retirement year coverage</h3>
      <div class="stacked-bar" aria-label="Stacked income coverage">
        <span style="width:${pensionPct.toFixed(1)}%; background:#f59e0b;" title="Pension"></span>
        <span style="width:${cppPct.toFixed(1)}%; background:#16a34a;" title="CPP"></span>
        <span style="width:${oasPct.toFixed(1)}%; background:#0ea5a8;" title="OAS"></span>
        <span style="width:${drawPct.toFixed(1)}%; background:#0f6abf;" title="Savings draw"></span>
      </div>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Pension</strong><span>${formatCurrency(first.pension)}</span></div>
        <div class="preview-kpi-item"><strong>CPP</strong><span>${formatCurrency(first.cpp)}</span></div>
        <div class="preview-kpi-item"><strong>OAS</strong><span>${formatCurrency(first.oas)}</span></div>
        <div class="preview-kpi-item"><strong>Savings draw</strong><span>${formatCurrency(first.withdrawal)}</span></div>
      </div>
    </section>
  `;
}

function wizardStepRefine() {
  return `
    <h3>Your first forecast is ready</h3>
    <p class="muted">You can stay with the simple dashboard or unlock deeper tax-aware planning.</p>
    <div class="landing-actions">
      <button class="btn btn-primary" type="button" data-action="open-advanced">Refine taxes & withdrawals</button>
      <button class="btn btn-secondary" type="button" data-action="open-spouse">Add spouse planning</button>
      <button class="btn btn-secondary" type="button" data-action="open-stress">Stress test my plan</button>
    </div>
    <section class="lesson-box">
      <h3>What unlocks next</h3>
      <ul>
        <li>Scenario comparison and tax estimate by province.</li>
        <li>Account-level withdrawal order and OAS clawback view.</li>
        <li>Educational modules for RRIF conversion and timing tradeoffs.</li>
      </ul>
    </section>
  `;
}

function wizardStepReality(model) {
  const first = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
  if (!first) return "<p class='muted'>Projection unavailable.</p>";
  const coverage = first.spending > 0 ? (first.guaranteedNet / first.spending) * 100 : 0;
  return `
    <h3>Reality checks</h3>
    <div class="lesson-box">
      <h3>Why this matters</h3>
      <ul>
        <li>Guaranteed income usually covers only part of retirement spending.</li>
        <li>The remaining after-tax gap must come from registered savings.</li>
        <li>If the gap is large, tax drag and depletion risk rise.</li>
      </ul>
    </div>
    <div class="preview-box">
      <h3>Mini preview</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Guaranteed income coverage ${tooltipButton("kpiGuaranteedIncome")}</strong><span>${coverage.toFixed(0)}%</span></div>
        <div class="preview-kpi-item"><strong>Net gap ${tooltipButton("kpiNetGap")}</strong><span>${formatCurrency(first.netGap)}</span></div>
        <div class="preview-kpi-item"><strong>Gross withdrawal ${tooltipButton("kpiGrossWithdrawal")}</strong><span>${formatCurrency(first.withdrawal)}</span></div>
        <div class="preview-kpi-item"><strong>Estimated tax drag ${tooltipButton("oasClawback")}</strong><span>${formatCurrency(first.taxOnWithdrawal + first.oasClawback)}</span></div>
      </div>
    </div>
  `;
}

function wizardStepTaxIntro(model) {
  const first = findFirstRetirementRow(model.base.rows, state.profile.retirementAge);
  if (!first) return "<p class='muted'>Projection unavailable.</p>";
  return `
    <h3>Taxes & withdrawals (intro)</h3>
    <div class="wizard-grid compact-mobile-two">
      <label class="inline-check form-span-full">
        <input type="checkbox" data-bind="strategy.oasClawbackModeling" ${state.strategy.oasClawbackModeling ? "checked" : ""} />
        Model OAS clawback ${tooltipButton("oasClawback")}
      </label>
      ${numberField("RRIF conversion age", "strategy.rrifConversionAge", state.strategy.rrifConversionAge, { min: 65, max: 75, step: 1 }, "rrifConversionAge", false, false, true)}
      <label class="inline-check compact-field">
        <input type="checkbox" data-bind="strategy.applyRrifMinimums" ${state.strategy.applyRrifMinimums ? "checked" : ""} />
        Apply RRIF minimums ${tooltipButton("rrifMinimums")}
      </label>
    </div>
    <section class="lesson-box">
      <h3>Micro-lesson</h3>
      <ul>
        <li>Your spending target is after-tax, but RRSP/RRIF withdrawals are taxable.</li>
        <li>Gross withdrawal must be higher than the net amount you need to spend.</li>
        <li>OAS clawback and RRIF minimums can force higher taxable income.</li>
      </ul>
    </section>
    <section class="preview-box">
      <h3>First retirement-year gross-up</h3>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Net gap</strong><span>${formatCurrency(first.netGap)}</span></div>
        <div class="preview-kpi-item"><strong>Gross withdrawal</strong><span>${formatCurrency(first.withdrawal)}</span></div>
        <div class="preview-kpi-item"><strong>Tax wedge</strong><span>${formatCurrency(first.taxOnWithdrawal + first.oasClawback)}</span></div>
        <div class="preview-kpi-item"><strong>Effective tax rate</strong><span>${formatPct(first.effectiveTaxRate)}</span></div>
      </div>
    </section>
  `;
}

function renderAdvanced() {
  const model = ui.lastModel;
  const locked = !state.uiState.unlocked.advanced;
  if (locked) {
    el.advancedAccordion.innerHTML = `<div class="subsection"><strong>Locked</strong><p class="muted">Complete Guided Setup step 5 to unlock advanced inputs.</p></div>`;
    return;
  }

  if (!state.uiState.showAdvancedControls) {
    el.advancedAccordion.innerHTML = `
      <div class="subsection">
        <p class="muted">Advanced settings are hidden by default to keep planning simple.</p>
        <label class="inline-check">
          <input type="checkbox" data-bind="uiState.showAdvancedControls" ${state.uiState.showAdvancedControls ? "checked" : ""} />
          Show Advanced Controls
        </label>
      </div>
    `;
    return;
  }

  const strategyRows = model.strategyComparisons.map((row) => `
    <tr>
      <td>${escapeHtml(row.label)}</td>
      <td>${formatCurrency(row.totalTax)}</td>
      <td>${formatCurrency(row.totalClawback)}</td>
      <td>${row.depletionAge ? `Age ${row.depletionAge}` : "No depletion"}</td>
    </tr>
  `).join("");

  const selectedStrategy = state.strategy.withdrawal;
  const selected = model.strategyComparisons.find((x) => x.key === selectedStrategy) || model.strategyComparisons[0];

  el.advancedAccordion.innerHTML = `
    <div class="subsection">
      <label class="inline-check">
        <input type="checkbox" data-bind="uiState.showAdvancedControls" ${state.uiState.showAdvancedControls ? "checked" : ""} />
        Show Advanced Controls
      </label>
      <label>
        <span class="label-row">Search settings</span>
        <input type="search" data-bind="uiState.advancedSearch" data-live-input="1" value="${escapeHtml(state.uiState.advancedSearch || "")}" placeholder="Search tax, inflation, clawback, RRIF..." aria-label="Search advanced settings" />
      </label>
    </div>
    ${accordionSection("basics", "Basics", "Changes timeline, spending target, and core savings assumptions used across all models.", `
      <div class="form-grid compact-mobile-two">
        <div class="form-span-full">
          ${selectField("Province", "profile.province", Object.entries(PROVINCES).map(([code, name]) => ({ value: code, label: name })), state.profile.province, "province")}
        </div>
        ${numberField("Year of birth", "profile.birthYear", state.profile.birthYear, { min: 1940, max: APP.currentYear - 18, step: 1 }, "birthYear", false, false, true)}
        ${numberField("Retirement age", "profile.retirementAge", state.profile.retirementAge, { min: 50, max: 75, step: 1 }, "retirementAge", false, false, true)}
        ${numberField("Life expectancy", "profile.lifeExpectancy", state.profile.lifeExpectancy, { min: 75, max: 105, step: 1 }, "lifeExpectancy", false, false, true)}
        ${numberField("Desired spending (today's dollars)", "profile.desiredSpending", state.profile.desiredSpending, { min: 12000, max: 350000, step: 500 }, "desiredSpending")}
        ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true, false, true)}
        ${numberField("Current total savings", "savings.currentTotal", state.savings.currentTotal, { min: 0, max: 5000000, step: 1000 }, "currentSavings")}
        ${numberField("Annual contribution", "savings.annualContribution", state.savings.annualContribution, { min: 0, max: 250000, step: 500 }, "annualContribution")}
      </div>
    `, true)}

    ${accordionSection("assumptions", "Assumptions", "Changes growth, spending escalation, scenario dispersion, and tax estimate framing.", `
      <div class="form-grid">
        ${numberField("Conservative return", "assumptions.returns.conservative", toPct(state.assumptions.returns.conservative), { min: 1, max: 10, step: 0.1 }, "riskProfile", true)}
        ${numberField("Balanced return", "assumptions.returns.balanced", toPct(state.assumptions.returns.balanced), { min: 1, max: 12, step: 0.1 }, "riskProfile", true)}
        ${numberField("Aggressive return", "assumptions.returns.aggressive", toPct(state.assumptions.returns.aggressive), { min: 1, max: 14, step: 0.1 }, "riskProfile", true)}
        ${numberField("Inflation", "assumptions.inflation", toPct(state.assumptions.inflation), { min: 0.5, max: 5, step: 0.1 }, "inflation", true)}
        ${numberField("Scenario spread", "assumptions.scenarioSpread", toPct(state.assumptions.scenarioSpread), { min: 0.5, max: 5, step: 0.1 }, "scenarioSpread", true)}
        ${numberField("Volatility", "assumptions.volatility", toPct(state.assumptions.volatility), { min: 3, max: 20, step: 0.5 }, "volatility", true)}
        ${numberField("Contribution increase (%/yr)", "savings.contributionIncrease", toPct(state.savings.contributionIncrease), { min: 0, max: 15, step: 0.1 }, "contributionIncrease", true)}
        <label class="form-span-full inline-check"><input type="checkbox" data-bind="assumptions.taxBracketInflation" ${state.assumptions.taxBracketInflation ? "checked" : ""} />Inflate tax brackets over time</label>
      </div>
    `)}

    ${accordionSection("income", "Income sources", "Changes non-portfolio income and timing dependencies.", `
      <div class="form-grid">
        <label class="inline-check form-span-full"><input type="checkbox" data-bind="income.pension.enabled" ${state.income.pension.enabled ? "checked" : ""} />Enable workplace pension</label>
        ${numberField("Pension amount", "income.pension.amount", state.income.pension.amount, { min: 0, max: 200000, step: 500 }, "pensionAmount")}
        ${numberField("Pension start age", "income.pension.startAge", state.income.pension.startAge, { min: 50, max: 75, step: 1 }, "pensionStartAge")}
        ${numberField("CPP at 65", "income.cpp.amountAt65", state.income.cpp.amountAt65, { min: 0, max: 35000, step: 100 }, "cppAmount65")}
        ${numberField("CPP start age", "income.cpp.startAge", state.income.cpp.startAge, { min: 60, max: 70, step: 1 }, "cppStartAge")}
        ${numberField("OAS at 65", "income.oas.amountAt65", state.income.oas.amountAt65, { min: 0, max: 12000, step: 100 }, "oasAmount65")}
        ${numberField("OAS start age", "income.oas.startAge", state.income.oas.startAge, { min: 65, max: 70, step: 1 }, "oasStartAge")}
        <label class="inline-check form-span-full"><input type="checkbox" data-bind="profile.hasSpouse" ${state.profile.hasSpouse ? "checked" : ""} />Enable spousal income</label>
        ${state.profile.hasSpouse ? `
          <label class="inline-check form-span-full"><input type="checkbox" data-bind="income.spouse.enabled" ${state.income.spouse.enabled ? "checked" : ""} />Include spouse private pension / CPP / OAS</label>
          ${numberField("Spouse private pension", "income.spouse.pensionAmount", state.income.spouse.pensionAmount, { min: 0, max: 200000, step: 500 }, "spousePensionAmount", false, !state.income.spouse.enabled)}
          ${numberField("Spouse pension start age", "income.spouse.pensionStartAge", state.income.spouse.pensionStartAge, { min: 50, max: 75, step: 1 }, "spousePensionStartAge", false, !state.income.spouse.enabled)}
          ${numberField("Spouse CPP at 65", "income.spouse.cppAmountAt65", state.income.spouse.cppAmountAt65, { min: 0, max: 35000, step: 100 }, "spouseCppAmount65", false, !state.income.spouse.enabled)}
          ${numberField("Spouse CPP start age", "income.spouse.cppStartAge", state.income.spouse.cppStartAge, { min: 60, max: 70, step: 1 }, "spouseCppStartAge", false, !state.income.spouse.enabled)}
          ${numberField("Spouse OAS at 65", "income.spouse.oasAmountAt65", state.income.spouse.oasAmountAt65, { min: 0, max: 12000, step: 100 }, "spouseOasAmount65", false, !state.income.spouse.enabled)}
          ${numberField("Spouse OAS start age", "income.spouse.oasStartAge", state.income.spouse.oasStartAge, { min: 65, max: 70, step: 1 }, "spouseOasStartAge", false, !state.income.spouse.enabled)}
        ` : ""}
      </div>
    `)}

    ${accordionSection("accounts", "Accounts", "Changes withdrawal taxation and longevity under strategy comparisons.", `
      <div class="form-grid">
        ${numberField("RRSP / RRIF", "accounts.rrsp", state.accounts.rrsp, { min: 0, max: 5000000, step: 1000 }, "rrsp")}
        ${numberField("TFSA", "accounts.tfsa", state.accounts.tfsa, { min: 0, max: 5000000, step: 1000 }, "tfsa")}
        ${numberField("Non-registered", "accounts.nonRegistered", state.accounts.nonRegistered, { min: 0, max: 5000000, step: 1000 }, "nonRegistered")}
        ${numberField("Cash", "accounts.cash", state.accounts.cash, { min: 0, max: 5000000, step: 500 }, "cash")}
      </div>
    `)}

    ${accordionSection("rrif", "RRIF rules", "Applies RRSP to RRIF conversion age and minimum withdrawal schedule effects.", `
      <div class="form-grid compact-mobile-two">
        ${numberField("RRIF conversion age", "strategy.rrifConversionAge", state.strategy.rrifConversionAge, { min: 65, max: 75, step: 1 }, "rrifConversionAge", false, false, true)}
        <label class="inline-check compact-field">
          <input type="checkbox" data-bind="strategy.applyRrifMinimums" ${state.strategy.applyRrifMinimums ? "checked" : ""} />
          Apply RRIF minimum schedule ${tooltipButton("rrifMinimums")}
        </label>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Age</th><th>Minimum %</th></tr></thead>
          <tbody>
            ${Object.entries(RRIF_MIN_WITHDRAWAL).map(([age, pct]) => `<tr><td>${age}</td><td>${(pct * 100).toFixed(2)}%</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    `)}

    ${accordionSection("capitalInjects", "Capital injects", "Adds one-time lump-sum proceeds (for example home downsizing) at chosen ages.", `
      <div class="subsection">
        <p class="muted small-copy">Each enabled row is a one-time injection added to plan assets at the selected age.</p>
        <button type="button" class="btn btn-secondary" data-action="add-capital-inject">Add lump-sum event</button>
      </div>
      <div class="form-grid">
        ${renderCapitalInjectRows()}
      </div>
    `)}

    ${accordionSection("withdrawal", "Withdrawal strategy", "Changes account draw order, taxes, and potential OAS clawback.", `
      <div class="form-span-full">
        <div class="inline-radio-row">
          ${strategyButton("tax-smart", "Tax-smart")}
          ${strategyButton("rrsp-first", "RRSP-first")}
          ${strategyButton("tfsa-first", "TFSA-first")}
        </div>
      </div>
      <label class="inline-check"><input type="checkbox" data-bind="strategy.oasClawbackModeling" ${state.strategy.oasClawbackModeling ? "checked" : ""} />Model OAS clawback</label>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Strategy</th><th>Estimated lifetime taxes ${tooltipButton("strategyLifetimeTaxes")}</th><th>Estimated lifetime OAS clawback ${tooltipButton("strategyLifetimeClawback")}</th><th>Depletion ${tooltipButton("depletionAge")}</th></tr></thead>
          <tbody>${strategyRows}</tbody>
        </table>
      </div>
      <p class="small-copy muted">These tax and clawback values are totals across the full retirement projection horizon (planning estimate).</p>
      <div class="subsection">
        <h3>Why this order?</h3>
        <ul class="plain-list">${selected.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
      </div>
    `)}

    ${accordionSection("tax", "Tax estimate", "Provides planning-level yearly tax estimates using federal + provincial brackets.", `
      <p class="muted">Planning estimate only. Uses province-aware bracket math and can escalate brackets with inflation.</p>
      <div class="preview-kpi">
        <div class="preview-kpi-item"><strong>Current effective tax rate</strong><span>${formatPct(model.tax.currentEffectiveRate)}</span></div>
        <div class="preview-kpi-item"><strong>First retirement-year effective tax rate</strong><span>${formatPct(model.tax.firstRetirementEffectiveRate)}</span></div>
      </div>
    `)}

    ${accordionSection("references", "Official references", "Links to current CRA and Canada.ca source material used for planning context.", `
      <p class="muted">These links are official government references. Rates and rules can change by tax year.</p>
      <ul class="plain-list resource-list">
        ${OFFICIAL_REFERENCES.map((item) => `
          <li>
            <a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>
            <span class="muted small-copy"> (${escapeHtml(item.source)})</span>
          </li>
        `).join("")}
      </ul>
    `)}

    ${accordionSection("modules", "Educational unlock modules", "Adds concept-level guidance. Some modules are educational-only if not fully modeled.", `
      <div class="lesson-box">
        <h3>Coming soon feature</h3>
        <p class="muted">Educational unlock modules are being rebuilt for a more guided learning experience.</p>
        <p class="small-copy muted">Current planning calculations remain available in Dashboard, Guided Setup, and Advanced inputs.</p>
      </div>
    `)}
  `;
  applyAdvancedSearchFilter();
}

function renderStress() {
  const model = ui.lastModel;
  if (!model) return;

  const best = model.scenarioRows.find((r) => r.label === "Best") || model.scenarioRows[0];
  const base = model.scenarioRows.find((r) => r.label === "Base") || model.scenarioRows[1] || model.scenarioRows[0];
  const worst = model.scenarioRows.find((r) => r.label === "Worst") || model.scenarioRows[2] || model.scenarioRows[0];
  const quickRows = [best, base, worst].filter(Boolean);

  el.scenarioSummary.innerHTML = `
    <h3>Quick stress check ${tooltipButton("stressScenario")}</h3>
    <p class="muted">Simple view: how your plan changes if long-run returns are better or worse than expected.</p>
    <ul class="plain-list">
      <li><strong>Best case:</strong> higher return by your scenario spread.</li>
      <li><strong>Base case:</strong> your current assumptions.</li>
      <li><strong>Downside case:</strong> lower return by your scenario spread.</li>
    </ul>
    <div class="preview-kpi">
      ${quickRows.map((row) => `
        <div class="preview-kpi-item">
          <strong>${row.label === "Worst" ? "Downside case" : `${row.label} case`}</strong>
          <span>${formatCurrency(row.balanceAtRetirement)}</span>
          <small class="muted">Retirement balance</small>
        </div>
      `).join("")}
    </div>
  `;

  el.stressTable.innerHTML = `
    <thead>
      <tr>
        <th>Scenario ${tooltipButton("stressScenario")}</th>
        <th>Return ${tooltipButton("scenarioSpread")}</th>
        <th>Balance at retirement ${tooltipButton("kpiBalanceRetirement")}</th>
        <th>Depletion ${tooltipButton("depletionAge")}</th>
        <th>First-year gap/surplus ${tooltipButton("stressGapSurplus")}</th>
      </tr>
    </thead>
    <tbody>
      ${quickRows.map((row) => `
        <tr>
          <td>${row.label === "Worst" ? "Downside" : row.label}</td>
          <td>${formatPct(row.returnRate)}</td>
          <td>${formatCurrency(row.balanceAtRetirement)}</td>
          <td>${row.depletionAge ? `Age ${row.depletionAge}` : "No depletion"}</td>
          <td>${formatSignedCurrency(row.firstYearGap)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  bindInlineTooltipTriggers(el.scenarioSummary);
  bindInlineTooltipTriggers(el.stressTable);
}

function renderNotes() {
  el.notesInput.value = state.notes || "";
}

function buildPlanModel(plan) {
  const baseReturn = getReturnRate(plan);
  const base = runSimpleProjection(plan, { returnRate: baseReturn, inflationRate: plan.assumptions.inflation });

  const spread = plan.assumptions.scenarioSpread;
  const scenarioDefs = [
    { key: "best", label: "Best", returnRate: baseReturn + spread },
    { key: "base", label: "Base", returnRate: baseReturn },
    { key: "worst", label: "Worst", returnRate: Math.max(0.01, baseReturn - spread) },
  ];

  const scenarioRuns = scenarioDefs.map((def) => {
    const res = runSimpleProjection(plan, { returnRate: def.returnRate, inflationRate: plan.assumptions.inflation });
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
      const res = runSimpleProjection(plan, { returnRate: r, inflationRate: inf });
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
    runStrategyProjection(plan, base, "tax-smart"),
    runStrategyProjection(plan, base, "rrsp-first"),
    runStrategyProjection(plan, base, "tfsa-first"),
  ];

  const firstRet = base.rows.find((row) => row.age === plan.profile.retirementAge) || base.rows[0];
  const spouseCurrentIncome = plan.profile.hasSpouse && plan.income.spouse.enabled
    ? Math.max(0, plan.income.spouse.pensionAmount)
    : 0;
  const taxCurrentIncome = Math.max(0, plan.income.pension.enabled ? plan.income.pension.amount : 0) + spouseCurrentIncome;
  const taxRetIncome = Math.max(0, firstRet.taxableIncome);

  return {
    base,
    best,
    worst,
    scenarioRows,
    stressMatrix,
    strategyComparisons,
    tax: {
      currentEffectiveRate: estimateEffectiveTaxRate(plan, taxCurrentIncome, 0),
      firstRetirementEffectiveRate: estimateEffectiveTaxRate(plan, taxRetIncome, Math.max(0, plan.profile.retirementAge - ageNow())),
    },
    kpis: base.kpis,
  };
}

function runSimpleProjection(plan, options) {
  const startYear = APP.currentYear;
  const endYear = startYear + Math.max(1, plan.profile.lifeExpectancy - ageNow());
  const retireAge = plan.profile.retirementAge;
  const birthYear = plan.profile.birthYear;
  const returnRate = options.returnRate;
  const inflationRate = options.inflationRate;
  const contributionIncrease = plan.savings.contributionIncrease;

  let balance = plan.savings.currentTotal;
  let depletionAge = null;
  let balanceAtRetirement = plan.savings.currentTotal;

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
      ? inflateAmountToRetirement(plan.profile.desiredSpending, inflationRate, Math.max(0, retireAge - ageNow())) * Math.pow(1 + inflationRate, yearsFromRetirementStart)
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
      withdrawal = Math.min(Math.max(requiredWithdrawal, rrifMinimum), availableForWithdrawal);
      taxableIncome = guaranteedGross + withdrawal;
      tax = estimateTotalTax(plan, taxableIncome, yearOffset);
      taxOnWithdrawal = Math.max(0, tax - guaranteedTax);
      oasClawback = plan.strategy.oasClawbackModeling ? estimateOasClawback(plan, taxableIncome, oas + spouseOas, yearOffset) : 0;
      netFromWithdrawal = Math.max(0, withdrawal - taxOnWithdrawal - oasClawback);
      const netIncome = guaranteedNet + netFromWithdrawal;
      gap = netIncome - targetAfterTax;
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

function runStrategyProjection(plan, baseProjection, strategyKey) {
  const retireAge = plan.profile.retirementAge;
  const deathAge = plan.profile.lifeExpectancy;
  const yearsToRetirement = Math.max(0, retireAge - ageNow());
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
    const yearOffset = Math.max(0, age - ageNow());
    const spend = inflateAmountToRetirement(plan.profile.desiredSpending, inflationRate, yearsToRetirement) * Math.pow(1 + inflationRate, Math.max(0, age - retireAge));

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

  const startAge = ageNow();
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

function buildNextActions(model) {
  const actions = [];
  if (model.kpis.firstYearGap < 0) {
    actions.push("Increase annual contribution or adjust retirement spending target.");
    actions.push("Consider delaying retirement age by 1-2 years.");
  } else {
    actions.push("You currently show a first-year surplus. Validate assumptions with stress tests.");
  }

  if (model.kpis.depletionAge) {
    actions.push(`Savings deplete at age ${model.kpis.depletionAge}. Test lower spending or higher guaranteed income.`);
  } else {
    actions.push("Balance remains through plan horizon under base assumptions.");
  }

  if (!state.uiState.unlocked.advanced) actions.push("Finish guided setup to unlock tax and withdrawal strategy comparisons.");

  return actions;
}

function estimateSustainableIncome(rows, retireAge) {
  const retirementRows = rows.filter((row) => row.age >= retireAge);
  if (!retirementRows.length) return 0;
  const withdrawals = retirementRows.map((row) => row.withdrawal);
  const avg = withdrawals.reduce((sum, value) => sum + value, 0) / withdrawals.length;
  return avg;
}

function adjustedCPP(amountAt65, startAge) {
  const ageDiff = startAge - 65;
  if (ageDiff >= 0) return amountAt65 * (1 + ageDiff * 0.084);
  return amountAt65 * Math.max(0.58, 1 + ageDiff * 0.072);
}

function adjustedOAS(amountAt65, startAge) {
  const safeAge = Math.max(65, startAge);
  const ageDiff = safeAge - 65;
  return amountAt65 * (1 + ageDiff * 0.072);
}

function estimateOasClawback(plan, taxableIncome, oasAmount, yearOffset) {
  if (!oasAmount) return 0;
  const thresholdBase = 93000;
  const threshold = plan.assumptions.taxBracketInflation
    ? thresholdBase * Math.pow(1 + plan.assumptions.inflation, yearOffset)
    : thresholdBase;
  const excess = Math.max(0, taxableIncome - threshold);
  return Math.min(oasAmount, excess * 0.15);
}

function estimateEffectiveTaxRate(plan, income, yearOffset) {
  const taxable = Math.max(0, income);
  if (taxable <= 0) return 0;

  const grossTax = estimateTotalTax(plan, taxable, yearOffset);
  const effective = grossTax / taxable;
  return clamp(effective, 0, 0.53);
}

function estimateTotalTax(plan, income, yearOffset) {
  const taxable = Math.max(0, income);
  const federal = computeBracketTax(taxable, TAX_BRACKETS.federal, plan, yearOffset);
  const provincialBase = TAX_BRACKETS.provincial[plan.profile.province] || TAX_BRACKETS.provincial.NL;
  const provincial = computeBracketTax(taxable, provincialBase, plan, yearOffset);
  return federal + provincial;
}

function solveGrossWithdrawal(plan, otherTaxableIncome, targetNetFromWithdrawal, yearOffset) {
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

function getRrifMinimumRequired(plan, age, registeredBalance) {
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

function drawMainChart(rows, bestRows, worstRows) {
  const canvas = el.mainChart;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(800, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(320 * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = 320;
  const pad = { left: 54, right: 16, top: 18, bottom: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);

  const values = [];
  rows.forEach((row) => {
    values.push(row.balance);
  });
  if (ui.showStressBand) {
    (bestRows || []).forEach((row) => values.push(row.balance));
    (worstRows || []).forEach((row) => values.push(row.balance));
  }
  const maxY = Math.max(1, ...values) * 1.06;

  ctx.strokeStyle = "#dfe7f3";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (innerH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

  const x = (index) => pad.left + (innerW * index) / Math.max(1, rows.length - 1);
  const y = (value) => pad.top + innerH - (value / maxY) * innerH;
  const baselineY = pad.top + innerH;

  const balanceGradient = ctx.createLinearGradient(pad.left, pad.top, w - pad.right, h - pad.bottom);
  balanceGradient.addColorStop(0, "#0f6abf");
  balanceGradient.addColorStop(1, "#0ea5a8");
  const balanceArea = ctx.createLinearGradient(0, pad.top, 0, baselineY);
  balanceArea.addColorStop(0, "rgba(15, 106, 191, 0.26)");
  balanceArea.addColorStop(1, "rgba(14, 165, 168, 0.04)");

  if (ui.showStressBand && Array.isArray(bestRows) && bestRows.length === rows.length) {
    plotLine(ctx, bestRows.map((r, i) => [x(i), y(r.balance)]), "#7aa7d8", 1.6, [4, 4]);
  }
  if (ui.showStressBand && Array.isArray(worstRows) && worstRows.length === rows.length) {
    plotLine(ctx, worstRows.map((r, i) => [x(i), y(r.balance)]), "#7aa7d8", 1.6, [4, 4]);
  }

  const balancePoints = rows.map((r, i) => [x(i), y(r.balance)]);
  if (balancePoints.length > 1) {
    ctx.beginPath();
    ctx.moveTo(balancePoints[0][0], baselineY);
    balancePoints.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(balancePoints[balancePoints.length - 1][0], baselineY);
    ctx.closePath();
    ctx.fillStyle = balanceArea;
    ctx.fill();
  }

  plotLine(ctx, balancePoints, balanceGradient, 2.8);

  ctx.fillStyle = "#5f6b7d";
  ctx.font = "12px Avenir Next";
  ctx.fillText(formatCurrency(0), 8, h - 10);
  ctx.fillText(formatCompactCurrency(maxY), 8, pad.top + 4);

  const first = rows[0];
  const last = rows[rows.length - 1];
  const approxTickCount = Math.max(3, Math.floor(innerW / 120));
  const step = Math.max(1, Math.ceil((rows.length - 1) / approxTickCount));
  for (let i = 0; i < rows.length; i += step) {
    const label = `Age ${rows[i].age}`;
    const lx = x(i);
    const lw = ctx.measureText(label).width;
    const drawX = Math.max(pad.left, Math.min(w - pad.right - lw, lx - lw / 2));
    ctx.fillText(label, drawX, h - 10);
  }
  const endLabel = `Age ${last.age}`;
  const endWidth = ctx.measureText(endLabel).width;
  ctx.fillText(endLabel, w - pad.right - endWidth, h - 10);
}

function handleBalanceChartPointer(event) {
  const model = ui.lastModel;
  if (!model || !el.mainChart || !el.balanceHover) return;
  const rows = model.base.rows;
  if (!rows.length) return;
  const rect = el.mainChart.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const idx = clamp(Math.round((x / rect.width) * (rows.length - 1)), 0, rows.length - 1);
  const row = rows[idx];
  el.balanceHover.innerHTML = `<strong>Age ${row.age}</strong><br>Balance: ${formatCurrency(row.balance)}`;
  el.balanceHover.hidden = false;
  el.balanceHover.style.left = `${clamp(x + 10, 8, rect.width - 190)}px`;
  el.balanceHover.style.top = "8px";
}

function plotLine(ctx, points, color, width, dash = []) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p[0], p[1]);
    else ctx.lineTo(p[0], p[1]);
  });
  ctx.stroke();
  ctx.setLineDash([]);
}

function openTooltip(key, anchor) {
  const tip = TOOLTIPS[key];
  if (!tip) return;

  closeTooltip();
  ui.tooltipKey = key;

  const rect = anchor.getBoundingClientRect();
  const pop = document.createElement("div");
  pop.className = "tooltip-popover";
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", `${tip.term} information`);
  pop.innerHTML = `
    <h4>${escapeHtml(tip.term)}</h4>
    <p><strong>Plain language:</strong> ${escapeHtml(tip.plain)}</p>
    <p><strong>Why it matters:</strong> ${escapeHtml(tip.why)}</p>
    <p><strong>Typical range:</strong> ${escapeHtml(tip.range)}</p>
    <button class="btn btn-primary" type="button" data-action="tooltip-example" data-value="${escapeHtml(key)}">Show example</button>
    <p class="tooltip-example muted"></p>
  `;

  if (window.matchMedia("(max-width: 900px)").matches) {
    pop.classList.add("mobile-centered");
  } else {
    const top = rect.bottom + 8;
    const left = Math.max(10, Math.min(window.innerWidth - 330, rect.left - 140));
    pop.style.top = `${top}px`;
    pop.style.left = `${left}px`;
  }
  el.tooltipLayer.appendChild(pop);
}

function closeTooltip() {
  ui.tooltipKey = "";
  el.tooltipLayer.innerHTML = "";
}

function openGlossary() {
  const entries = Object.values(TOOLTIPS).sort((a, b) => a.term.localeCompare(b.term));
  el.glossaryContent.innerHTML = entries.map((entry) => `
    <article class="glossary-item">
      <h3>${escapeHtml(entry.term)}</h3>
      <p><strong>Plain language:</strong> ${escapeHtml(entry.plain)}</p>
      <p><strong>Why it matters:</strong> ${escapeHtml(entry.why)}</p>
      <p><strong>Typical range:</strong> ${escapeHtml(entry.range)}</p>
      <p><strong>Example:</strong> ${escapeHtml(entry.example || "-")}</p>
    </article>
  `).join("");

  el.glossaryModal?.showModal();
}

function exportJson() {
  const exportObject = {
    ...state,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `retirement-plan-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Plan exported.");
}

async function importJsonFromFile() {
  const file = el.importJsonFile?.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizePlan(parsed);
    state = normalized;
    state.uiState.firstRun = false;
    ui.activeNav = state.uiState.activeNav || "dashboard";
    savePlan();
    renderAll();
    toast("Plan imported.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    toast(`Import error: ${message}`);
  } finally {
    el.importJsonFile.value = "";
  }
}

function loadPlan() {
  try {
    const raw = localStorage.getItem(APP.storageKey);
    if (!raw) return createDefaultPlan();
    return normalizePlan(JSON.parse(raw));
  } catch {
    return createDefaultPlan();
  }
}

function savePlan() {
  try {
    localStorage.setItem(APP.storageKey, JSON.stringify(state));
  } catch {
    toast("Could not save to local storage.");
  }
}

function normalizePlan(input) {
  if (!input || typeof input !== "object") throw new Error("Plan file is not a valid object.");

  const migrated = migratePlan(input);
  const base = createDefaultPlan();

  const out = {
    version: APP.version,
    profile: {
      ...base.profile,
      ...(migrated.profile || {}),
    },
    assumptions: {
      ...base.assumptions,
      ...(migrated.assumptions || {}),
      returns: {
        ...base.assumptions.returns,
        ...(migrated.assumptions?.returns || {}),
      },
    },
    savings: {
      ...base.savings,
      ...(migrated.savings || {}),
      capitalInjects: normalizeCapitalInjects(
        migrated.savings?.capitalInjects ?? base.savings.capitalInjects,
        Number(migrated.profile?.retirementAge || base.profile.retirementAge)
      ),
    },
    income: {
      pension: { ...base.income.pension, ...(migrated.income?.pension || {}) },
      cpp: { ...base.income.cpp, ...(migrated.income?.cpp || {}) },
      oas: { ...base.income.oas, ...(migrated.income?.oas || {}) },
      spouse: { ...base.income.spouse, ...(migrated.income?.spouse || {}) },
    },
    accounts: {
      ...base.accounts,
      ...(migrated.accounts || {}),
    },
    strategy: {
      ...base.strategy,
      ...(migrated.strategy || {}),
    },
    uiState: {
      ...base.uiState,
      ...(migrated.uiState || {}),
      learn: normalizeLearnState(migrated.uiState?.learn || base.uiState.learn),
      unlocked: {
        ...base.uiState.unlocked,
        ...(migrated.uiState?.unlocked || {}),
      },
    },
    notes: typeof migrated.notes === "string" ? migrated.notes : "",
  };

  validatePlan(out);
  return out;
}

function validatePlan(plan) {
  if (!plan.profile || !plan.assumptions || !plan.savings || !plan.income) {
    throw new Error("Plan is missing required sections.");
  }
  if (!PROVINCES[plan.profile.province]) throw new Error("Unsupported province code.");

  const numericChecks = [
    ["profile.birthYear", plan.profile.birthYear],
    ["profile.retirementAge", plan.profile.retirementAge],
    ["profile.lifeExpectancy", plan.profile.lifeExpectancy],
    ["profile.desiredSpending", plan.profile.desiredSpending],
    ["savings.currentTotal", plan.savings.currentTotal],
    ["savings.annualContribution", plan.savings.annualContribution],
    ["savings.contributionIncrease", plan.savings.contributionIncrease],
  ];

  for (const [path, value] of numericChecks) {
    if (!Number.isFinite(Number(value))) throw new Error(`Invalid numeric value at ${path}.`);
  }

  if (!Array.isArray(plan.savings.capitalInjects)) throw new Error("Invalid capital inject list.");
}

function migratePlan(plan) {
  const version = Number(plan.version || 1);
  if (version >= APP.version) return plan;

  const next = { ...plan };
  if (!next.strategy) next.strategy = { withdrawal: "tax-smart", oasClawbackModeling: true, rrifConversionAge: 71, applyRrifMinimums: true };
  if (!next.accounts) next.accounts = { rrsp: 0, tfsa: 0, nonRegistered: 0, cash: 0 };
  if (!next.uiState) next.uiState = createDefaultPlan().uiState;
  if (!next.uiState.learn) next.uiState.learn = createDefaultLearnState();
  if (!next.savings) next.savings = createDefaultPlan().savings;
  if (!Array.isArray(next.savings.capitalInjects)) next.savings.capitalInjects = [];
  next.version = APP.version;
  return next;
}

function ensureValidState() {
  state.profile.birthYear = clamp(Number(state.profile.birthYear), 1940, APP.currentYear - 18);
  state.profile.retirementAge = clamp(Number(state.profile.retirementAge), 50, 75);
  state.profile.lifeExpectancy = clamp(Number(state.profile.lifeExpectancy), state.profile.retirementAge + 1, 105);

  state.profile.desiredSpending = Math.max(12000, Number(state.profile.desiredSpending));

  state.assumptions.inflation = normalizePct(state.assumptions.inflation);
  state.assumptions.scenarioSpread = normalizePct(state.assumptions.scenarioSpread);
  state.assumptions.volatility = normalizePct(state.assumptions.volatility);
  state.assumptions.returns.conservative = normalizePct(state.assumptions.returns.conservative);
  state.assumptions.returns.balanced = normalizePct(state.assumptions.returns.balanced);
  state.assumptions.returns.aggressive = normalizePct(state.assumptions.returns.aggressive);

  state.savings.currentTotal = Math.max(0, Number(state.savings.currentTotal));
  state.savings.annualContribution = Math.max(0, Number(state.savings.annualContribution));
  state.savings.contributionIncrease = clamp(normalizePct(state.savings.contributionIncrease), 0, 0.2);
  state.savings.capitalInjects = normalizeCapitalInjects(state.savings.capitalInjects, state.profile.retirementAge);

  state.income.cpp.startAge = clamp(Number(state.income.cpp.startAge), 60, 70);
  state.income.oas.startAge = clamp(Number(state.income.oas.startAge), 65, 70);
  state.income.pension.startAge = clamp(Number(state.income.pension.startAge), 50, 75);
  state.income.pension.amount = Math.max(0, Number(state.income.pension.amount));
  state.income.cpp.amountAt65 = Math.max(0, Number(state.income.cpp.amountAt65));
  state.income.oas.amountAt65 = Math.max(0, Number(state.income.oas.amountAt65));
  state.income.spouse.pensionStartAge = clamp(Number(state.income.spouse.pensionStartAge), 50, 75);
  state.income.spouse.cppStartAge = clamp(Number(state.income.spouse.cppStartAge), 60, 70);
  state.income.spouse.oasStartAge = clamp(Number(state.income.spouse.oasStartAge), 65, 70);
  state.income.spouse.pensionAmount = Math.max(0, Number(state.income.spouse.pensionAmount));
  state.income.spouse.cppAmountAt65 = Math.max(0, Number(state.income.spouse.cppAmountAt65));
  state.income.spouse.oasAmountAt65 = Math.max(0, Number(state.income.spouse.oasAmountAt65));
  state.strategy.rrifConversionAge = clamp(Number(state.strategy.rrifConversionAge || 71), 65, 75);
  state.strategy.applyRrifMinimums = Boolean(state.strategy.applyRrifMinimums ?? true);
  state.uiState.learn = normalizeLearnState(state.uiState.learn);
  state.uiState.showAdvancedControls = Boolean(state.uiState.showAdvancedControls);
  state.uiState.advancedSearch = String(state.uiState.advancedSearch || "");
  const defaultProgress = createDefaultLearningProgress();
  state.uiState.learningProgress = {
    ...defaultProgress,
    ...(state.uiState.learningProgress || {}),
  };

  if (!PROVINCES[state.profile.province]) state.profile.province = APP.defaultProvince;
}

function createDefaultLearnState() {
  return {
    phaseDefaultsSeeded: false,
    inflation: {
      spendingToday: 80000,
      years: 10,
      rate: 0.025,
    },
    indexedIncome: {
      startIncome: 30000,
      years: 25,
      inflation: 0.02,
      highlight: "indexed",
    },
    taxGrossUp: {
      netGoal: 80000,
      rate: 0.22,
    },
    rrif: {
      age: 72,
      balance: 600000,
    },
    oas: {
      income: 95000,
      monthly: 742,
      recipients: 1,
    },
    spousalSplit: {
      spouseA: 70000,
      spouseB: 30000,
      splitPct: 0.25,
    },
    phases: {
      base: 80000,
      goYears: 10,
      goPct: 1.1,
      slowYears: 10,
      slowPct: 0.9,
      noYears: 10,
      noPct: 0.75,
    },
  };
}

function createDefaultLearningProgress() {
  return LEARN_PROGRESS_ITEMS.reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {});
}

function normalizeLearnState(input) {
  const base = createDefaultLearnState();
  const wasSeeded = Boolean(input?.phaseDefaultsSeeded);
  const out = {
    phaseDefaultsSeeded: true,
    inflation: { ...base.inflation, ...(input?.inflation || {}) },
    indexedIncome: { ...base.indexedIncome, ...(input?.indexedIncome || {}) },
    taxGrossUp: { ...base.taxGrossUp, ...(input?.taxGrossUp || {}) },
    rrif: { ...base.rrif, ...(input?.rrif || {}) },
    oas: { ...base.oas, ...(input?.oas || {}) },
    spousalSplit: { ...base.spousalSplit, ...(input?.spousalSplit || {}) },
    phases: { ...base.phases, ...(input?.phases || {}) },
  };

  out.inflation.spendingToday = Math.max(10000, Number(out.inflation.spendingToday));
  out.inflation.years = clamp(Number(out.inflation.years), 0, 45);
  out.inflation.rate = clamp(normalizePct(out.inflation.rate), 0.005, 0.08);

  out.indexedIncome.startIncome = Math.max(0, Number(out.indexedIncome.startIncome));
  out.indexedIncome.years = clamp(Number(out.indexedIncome.years), 1, 40);
  out.indexedIncome.inflation = clamp(normalizePct(out.indexedIncome.inflation), 0, 0.08);
  out.indexedIncome.highlight = out.indexedIncome.highlight === "flat" ? "flat" : "indexed";

  out.taxGrossUp.netGoal = Math.max(12000, Number(out.taxGrossUp.netGoal));
  out.taxGrossUp.rate = clamp(normalizePct(out.taxGrossUp.rate), 0.05, 0.45);

  out.rrif.age = clamp(Number(out.rrif.age), 65, 95);
  out.rrif.balance = Math.max(0, Number(out.rrif.balance));

  out.oas.income = Math.max(0, Number(out.oas.income));
  out.oas.monthly = Math.max(0, Number(out.oas.monthly));
  out.oas.recipients = clamp(Number(out.oas.recipients), 1, 2);

  out.spousalSplit.spouseA = Math.max(0, Number(out.spousalSplit.spouseA));
  out.spousalSplit.spouseB = Math.max(0, Number(out.spousalSplit.spouseB));
  out.spousalSplit.splitPct = clamp(normalizePct(out.spousalSplit.splitPct), 0, 0.5);

  out.phases.base = Math.max(12000, Number(out.phases.base));
  out.phases.goYears = clamp(Number(out.phases.goYears), 1, 20);
  out.phases.slowYears = clamp(Number(out.phases.slowYears), 1, 20);
  out.phases.noYears = clamp(Number(out.phases.noYears), 1, 25);
  out.phases.goPct = normalizePhasePct(out.phases.goPct, 0.6, 1.5);
  out.phases.slowPct = normalizePhasePct(out.phases.slowPct, 0.5, 1.3);
  out.phases.noPct = normalizePhasePct(out.phases.noPct, 0.4, 1.2);
  if (!wasSeeded) {
    out.phases.goPct = 1.1;
    out.phases.slowPct = 0.9;
    out.phases.noPct = 0.75;
  }

  return out;
}

function normalizePhasePct(value, min, max) {
  let n = Number(value);
  if (!Number.isFinite(n)) return min;
  // Accept either percent-entry style (e.g. 110) or ratio style (e.g. 1.1).
  if (n > 2) n /= 100;
  return clamp(n, min, max);
}

function createDefaultPlan() {
  return {
    version: APP.version,
    profile: {
      province: APP.defaultProvince,
      birthYear: APP.currentYear - 35,
      retirementAge: 65,
      lifeExpectancy: 92,
      desiredSpending: 60000,
      hasSpouse: false,
    },
    assumptions: {
      inflation: 0.02,
      returns: {
        conservative: RISK_RETURNS.conservative,
        balanced: RISK_RETURNS.balanced,
        aggressive: RISK_RETURNS.aggressive,
      },
      riskProfile: "balanced",
      scenarioSpread: 0.02,
      volatility: 0.09,
      taxBracketInflation: true,
    },
    savings: {
      currentTotal: 120000,
      annualContribution: 9000,
      contributionIncrease: 0,
      capitalInjects: [],
    },
    income: {
      pension: {
        enabled: false,
        amount: 0,
        startAge: 65,
      },
      cpp: {
        amountAt65: 12000,
        startAge: 65,
      },
      oas: {
        amountAt65: 9000,
        startAge: 65,
      },
      spouse: {
        enabled: false,
        pensionAmount: 0,
        pensionStartAge: 65,
        cppAmountAt65: 10000,
        cppStartAge: 65,
        oasAmountAt65: 8500,
        oasStartAge: 65,
      },
    },
    accounts: {
      rrsp: 70000,
      tfsa: 35000,
      nonRegistered: 10000,
      cash: 5000,
    },
    strategy: {
      withdrawal: "tax-smart",
      oasClawbackModeling: true,
      rrifConversionAge: 71,
      applyRrifMinimums: true,
    },
    uiState: {
      firstRun: true,
      hasStarted: false,
      activeNav: "start",
      wizardStep: 1,
      showScenarioCompare: false,
      showAdvancedControls: false,
      advancedSearch: "",
      learn: createDefaultLearnState(),
      learningProgress: createDefaultLearningProgress(),
      unlocked: {
        advanced: false,
        spouse: false,
      },
    },
    notes: "",
  };
}

function createDemoPlan() {
  const plan = createDefaultPlan();
  plan.profile.birthYear = APP.currentYear - 45;
  plan.profile.retirementAge = 63;
  plan.profile.lifeExpectancy = 94;
  plan.profile.desiredSpending = 70000;
  plan.savings.currentTotal = 380000;
  plan.savings.annualContribution = 12000;
  plan.assumptions.riskProfile = "balanced";
  plan.income.pension.enabled = true;
  plan.income.pension.amount = 15000;
  plan.income.pension.startAge = 63;
  plan.income.cpp.amountAt65 = 13000;
  plan.income.cpp.startAge = 65;
  plan.income.oas.amountAt65 = 9200;
  plan.income.oas.startAge = 67;
  plan.accounts = {
    rrsp: 210000,
    tfsa: 110000,
    nonRegistered: 45000,
    cash: 15000,
  };
  plan.savings.capitalInjects = [
    { id: createLocalId(), enabled: true, label: "Downsize home", amount: 180000, age: 67 },
  ];
  plan.uiState.firstRun = false;
  plan.uiState.hasStarted = true;
  plan.uiState.activeNav = "dashboard";
  plan.uiState.wizardStep = 7;
  plan.uiState.unlocked.advanced = true;
  plan.notes = "Demo assumptions loaded. Review advanced strategy and stress tests.";
  return plan;
}

function createLocalId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createCapitalInjectItem() {
  return {
    id: createLocalId(),
    enabled: true,
    label: "Lump sum",
    amount: 50000,
    age: Math.max(state.profile.retirementAge, ageNow()),
  };
}

function learnCallouts(titleA, bodyA, titleB, bodyB) {
  return `
    <div class="learn-callout-grid">
      <article class="learn-callout">
        <strong>${escapeHtml(titleA)}</strong>
        <p>${escapeHtml(bodyA)}</p>
      </article>
      <article class="learn-callout">
        <strong>${escapeHtml(titleB)}</strong>
        <p>${escapeHtml(bodyB)}</p>
      </article>
    </div>
  `;
}

function learnNumberField(label, bind, value, attrs, tooltipKey, percentInput = false, disabled = false, compact = false) {
  const finalValue = percentInput ? formatNumber(value) : formatNumber(value);
  const attrString = Object.entries(attrs || {})
    .map(([k, v]) => `${k}="${String(v)}"`)
    .join(" ");

  return `
    <label class="${compact ? "compact-field" : ""}">
      <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
      <input
        type="number"
        data-learn-bind="${bind}"
        data-type="number"
        ${percentInput ? 'data-percent-input="1"' : ""}
        value="${finalValue}"
        ${attrString}
        ${disabled ? "disabled" : ""}
        aria-label="${escapeHtml(label)}"
      />
    </label>
  `;
}

function drawLearnInflationChart() {
  const canvas = el.learnPanel?.querySelector("#learnInflationChart");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const d = state.uiState.learn.inflation;
  const points = [];
  for (let i = 0; i <= d.years; i += 1) {
    points.push(d.spendingToday * Math.pow(1 + d.rate, i));
  }
  drawLearnLineChart(canvas, points, {
    color: "#0f6abf",
    fill: "rgba(15, 106, 191, 0.16)",
    xLabeler: (i) => `${i}y`,
  });
}

function drawLearnIndexedChart() {
  const canvas = el.learnPanel?.querySelector("#learnIndexedChart");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const d = state.uiState.learn.indexedIncome;
  const infValue = el.learnPanel?.querySelector("#learnIndexedInflationValue");
  if (infValue) infValue.textContent = `${formatNumber(toPct(d.inflation))}%`;
  const indexed = [];
  const flatNominal = [];
  const flatReal = [];
  for (let i = 0; i <= d.years; i += 1) {
    indexed.push(d.startIncome * Math.pow(1 + d.inflation, i));
    flatNominal.push(d.startIncome);
    flatReal.push(d.startIncome / Math.pow(1 + d.inflation, i));
  }
  drawLearnMultiLineChart(canvas, [indexed, flatNominal, flatReal], {
    colors: ["#16a34a", "#f59e0b", "#d9485f"],
    xLabeler: (i, total) => (i % Math.max(1, Math.ceil(total / 5)) === 0 ? `${i}y` : ""),
  });
}

function drawLearnPhaseChart() {
  const canvas = el.learnPanel?.querySelector("#learnPhaseChart");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const d = state.uiState.learn.phases;
  const points = [];
  for (let i = 0; i < d.goYears; i += 1) points.push(d.base * d.goPct);
  for (let i = 0; i < d.slowYears; i += 1) points.push(d.base * d.slowPct);
  for (let i = 0; i < d.noYears; i += 1) points.push(d.base * d.noPct);
  drawLearnLineChart(canvas, points, {
    color: "#0ea5a8",
    fill: "rgba(14, 165, 168, 0.14)",
    xLabeler: (i, total) => (i % Math.max(1, Math.ceil(total / 6)) === 0 ? `Y${i + 1}` : ""),
  });
}

function drawLearnLineChart(canvas, series, options = {}) {
  drawLearnMultiLineChart(canvas, [series], {
    colors: [options.color || "#0f6abf"],
    fills: [options.fill || "rgba(15, 106, 191, 0.1)"],
    labels: [],
    xLabeler: options.xLabeler,
  });
}

function drawLearnMultiLineChart(canvas, seriesList, options = {}) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(640, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(220 * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = 220;
  const pad = { left: 50, right: 12, top: 14, bottom: 30 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  ctx.clearRect(0, 0, w, h);

  const allValues = seriesList.flat();
  const maxY = Math.max(1, ...allValues) * 1.1;
  const maxLen = Math.max(2, ...seriesList.map((s) => s.length));
  const x = (idx) => pad.left + (innerW * idx) / Math.max(1, maxLen - 1);
  const y = (v) => pad.top + innerH - (v / maxY) * innerH;

  ctx.strokeStyle = "#e1e8f3";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const gy = pad.top + (innerH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(w - pad.right, gy);
    ctx.stroke();
  }

  seriesList.forEach((series, index) => {
    const points = series.map((v, i) => [x(i), y(v)]);
    const fill = options.fills?.[index];
    if (fill && points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], y(0));
      points.forEach((p) => ctx.lineTo(p[0], p[1]));
      ctx.lineTo(points[points.length - 1][0], y(0));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
    plotLine(ctx, points, options.colors?.[index] || "#0f6abf", 2);
  });

  ctx.fillStyle = "#5f6b7d";
  ctx.font = "12px Avenir Next";
  ctx.fillText(formatCurrency(0), 8, h - 10);
  ctx.fillText(formatCompactCurrency(maxY), 8, pad.top + 4);
  const labeler = typeof options.xLabeler === "function"
    ? options.xLabeler
    : (i, total) => (i % Math.max(1, Math.ceil(total / 6)) === 0 ? `${i}` : "");
  for (let i = 0; i < maxLen; i += 1) {
    const label = labeler(i, maxLen - 1);
    if (!label) continue;
    const lx = x(i);
    const lw = ctx.measureText(label).width;
    ctx.fillText(label, clamp(lx - lw / 2, pad.left, w - pad.right - lw), h - 10);
  }
}

function calculatePhaseWeightedSpending(phases) {
  const totalYears = Math.max(1, Number(phases.goYears) + Number(phases.slowYears) + Number(phases.noYears));
  const totalAmount = Number(phases.base) * (
    Number(phases.goYears) * Number(phases.goPct)
    + Number(phases.slowYears) * Number(phases.slowPct)
    + Number(phases.noYears) * Number(phases.noPct)
  );
  return totalAmount / totalYears;
}

function numberField(label, bind, value, attrs, tooltipKey, percentInput = false, disabled = false, compact = false) {
  const finalValue = percentInput ? formatNumber(value) : formatNumber(value);
  const attrString = Object.entries(attrs || {})
    .map(([k, v]) => `${k}="${String(v)}"`)
    .join(" ");

  return `
    <label class="${compact ? "compact-field" : ""}">
      <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
      <input
        type="number"
        data-bind="${bind}"
        data-type="number"
        ${percentInput ? 'data-percent-input="1"' : ""}
        value="${finalValue}"
        ${attrString}
        ${disabled ? "disabled" : ""}
        aria-label="${escapeHtml(label)}"
      />
    </label>
  `;
}

function selectField(label, bind, options, selected, tooltipKey, compact = false) {
  return `
    <label class="${compact ? "compact-field" : ""}">
      <span class="label-row">${escapeHtml(label)} ${tooltipButton(tooltipKey)}</span>
      <select data-bind="${bind}" aria-label="${escapeHtml(label)}">
        ${options.map((opt) => `
          <option value="${opt.value}" ${opt.value === selected ? "selected" : ""}>${escapeHtml(opt.label)}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderCapitalInjectRows() {
  const items = Array.isArray(state.savings.capitalInjects) ? state.savings.capitalInjects : [];
  if (!items.length) return "<p class='muted form-span-full'>No lump-sum events added yet.</p>";

  return items.map((item, index) => `
    <div class="subsection form-span-full">
      <div class="wizard-grid compact-mobile-two">
        <label class="form-span-full inline-check">
          <input type="checkbox" data-bind="savings.capitalInjects.${index}.enabled" ${item.enabled ? "checked" : ""} />
          Include this event
        </label>
        <label>
          <span class="label-row">Event label</span>
          <input type="text" data-bind="savings.capitalInjects.${index}.label" value="${escapeHtml(item.label || "Lump sum")}" aria-label="Lump sum label" />
        </label>
        ${numberField("Amount", `savings.capitalInjects.${index}.amount`, Number(item.amount || 0), { min: 0, max: 5000000, step: 1000 }, "capitalInjectAmount", false, false, true)}
        ${numberField("Age received", `savings.capitalInjects.${index}.age`, Number(item.age || state.profile.retirementAge), { min: 45, max: 105, step: 1 }, "capitalInjectAge", false, false, true)}
      </div>
      <div class="landing-actions">
        <button type="button" class="btn btn-secondary" data-action="remove-capital-inject" data-value="${escapeHtml(item.id)}">Remove event</button>
      </div>
    </div>
  `).join("");
}

function tooltipButton(key) {
  const term = TOOLTIPS[key]?.term || key;
  return `<button class="tooltip-trigger" type="button" aria-label="Help: ${escapeHtml(term)}" data-tooltip-key="${escapeHtml(key)}">ⓘ</button>`;
}

function riskButton(key) {
  const active = state.assumptions.riskProfile === key;
  return `<button type="button" class="pill-radio ${active ? "active" : ""}" data-action="risk" data-value="${key}" aria-pressed="${active}">${capitalize(key)}</button>`;
}

function strategyButton(key, label) {
  const active = state.strategy.withdrawal === key;
  return `<button type="button" class="pill-radio ${active ? "active" : ""}" data-action="strategy" data-value="${key}" aria-pressed="${active}">${label}</button>`;
}

function accordionSection(id, title, affects, content) {
  const open = !!ui.advancedOpen[id];
  return `
    <details class="accordion" data-accordion-id="${escapeHtml(id)}" ${open ? "open" : ""}>
      <summary>${escapeHtml(title)}</summary>
      <div class="accordion-content">
        <p class="what-affects"><strong>What this affects:</strong> ${escapeHtml(affects)}</p>
        ${content}
      </div>
    </details>
  `;
}

function captureAdvancedAccordionState() {
  const sections = Array.from(document.querySelectorAll("#advancedAccordion details[data-accordion-id]"));
  if (!sections.length) return;
  sections.forEach((details) => {
    const id = details.getAttribute("data-accordion-id");
    if (!id) return;
    ui.advancedOpen[id] = details.open;
  });
}

function handleDetailsToggle(event) {
  const target = event.target;
  if (!(target instanceof HTMLDetailsElement)) return;
  if (!target.matches("#advancedAccordion details[data-accordion-id]")) return;
  const id = target.getAttribute("data-accordion-id");
  if (!id) return;
  ui.advancedOpen[id] = target.open;
}

function applyAdvancedSearchFilter() {
  const query = String(state.uiState.advancedSearch || "").trim().toLowerCase();
  const sections = Array.from(document.querySelectorAll("#advancedAccordion details[data-accordion-id]"));
  if (!sections.length) return;
  sections.forEach((details) => {
    const text = details.textContent?.toLowerCase() || "";
    details.hidden = query ? !text.includes(query) : false;
  });
}

function getReturnRate(plan) {
  const profile = plan.assumptions.riskProfile;
  return plan.assumptions.returns[profile] || plan.assumptions.returns.balanced;
}

function ageNow() {
  return APP.currentYear - state.profile.birthYear;
}

function navFromHash(hash) {
  const key = String(hash || "").replace("#", "").trim();
  if (key.startsWith("learn-")) return "learn";
  return normalizeNavTarget(key);
}

function syncNavHash(nav) {
  if (!history.replaceState) return;
  const safeNav = normalizeNavTarget(nav) || "dashboard";
  history.replaceState(null, "", `#${safeNav}`);
}

function normalizeNavTarget(value) {
  const key = String(value || "").trim();
  if (key === "guided") return "start";
  if (key === "inputs") return "plan";
  if (key === "stress" || key === "notes" || key === "export") return "tools";
  const allowed = new Set(["start", "dashboard", "plan", "learn", "tools", "advanced"]);
  return allowed.has(key) ? key : "";
}

function inflateAmountToRetirement(amount, inflationRate, years) {
  return amount * Math.pow(1 + inflationRate, Math.max(0, years));
}

function normalizeCapitalInjects(items, defaultAge = 65) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      id: String(item?.id || createLocalId()),
      enabled: Boolean(item?.enabled ?? true),
      label: String(item?.label || "Lump sum").trim() || "Lump sum",
      amount: Math.max(0, Number(item?.amount || 0)),
      age: clamp(Number(item?.age || defaultAge), 45, 105),
    }))
    .slice(0, 12);
}

function getCapitalInjectAtAge(plan, age) {
  const items = Array.isArray(plan.savings?.capitalInjects) ? plan.savings.capitalInjects : [];
  return items.reduce((sum, item) => {
    if (!item.enabled) return sum;
    return Number(item.age) === Number(age) ? sum + Math.max(0, Number(item.amount || 0)) : sum;
  }, 0);
}

function toPct(decimal) {
  return Number(decimal) * 100;
}

function normalizePct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n > 1) return n / 100;
  return n;
}

function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatSignedPct(value) {
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value || 0);
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 1, notation: "compact" }).format(value || 0);
}

function formatSignedCurrency(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value)}`;
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n * 1000) / 1000);
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let ref = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!ref[key] || typeof ref[key] !== "object") ref[key] = {};
    ref = ref[key];
  }

  const finalKey = keys[keys.length - 1];

  ref[finalKey] = value;
}

function sumAccounts(accounts) {
  return Math.max(0, accounts.rrsp) + Math.max(0, accounts.tfsa) + Math.max(0, accounts.nonRegistered) + Math.max(0, accounts.cash);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(message) {
  el.appToast.textContent = message;
  el.appToast.classList.add("visible");
  clearTimeout(ui.toastTimer);
  ui.toastTimer = setTimeout(() => {
    el.appToast.classList.remove("visible");
  }, 2200);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // ignore registration errors in local file mode
  });
}
