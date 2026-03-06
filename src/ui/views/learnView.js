export function buildLearnHtml(ctx) {
  const {
    learn,
    progress,
    completed,
    learnProgressItems,
    learnNumberField,
    buildLearnCallouts,
    tooltipButton,
    toPct,
    formatNumber,
    formatCurrency,
    supportUrl,
    escapeHtml,
  } = ctx;

  return `
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
          <a href="#learn-grossnet">11. Gross vs Net Withdrawals (Tax Wedge)</a>
          <a href="#learn-meltdown">12. RRSP Meltdown Strategy</a>
        </nav>
      </aside>
      <div class="learn-content">
        <section class="learn-section">
          <h3>Retirement Knowledge Progress</h3>
          <p class="muted small-copy">${completed}/${learnProgressItems.length} lessons marked complete.</p>
          <div class="learn-progress-list">
            ${learnProgressItems.map((item) => `
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
          ${buildLearnCallouts("Common misconception", "If inflation looks low today, it will not matter over decades.", "Try moving the slider", "Increase years and inflation to see compounding in action.", escapeHtml)}
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
          ${buildLearnCallouts("Why this matters", "CPP and OAS are indexed. This helps protect spending power as prices rise.", "Try moving the slider", "Raise inflation and compare indexed vs flat income over 25 years.", escapeHtml)}
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
          ${buildLearnCallouts("Common misconception", "If I need $80,000 to spend, I only need to withdraw $80,000.", "Why this matters", "You need to withdraw enough to cover both spending and tax.", escapeHtml)}
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
          <p class="small-copy muted"><a href="./rrif-withdrawal-calculator.html">Try the RRIF withdrawal landing calculator</a>.</p>
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
          <p class="small-copy muted"><a href="./oas-clawback-calculator.html">Try the OAS clawback landing calculator</a>.</p>
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
          <p class="small-copy muted">If this tool helped you understand retirement planning, consider supporting its development: <a href="${escapeHtml(supportUrl)}" target="_blank" rel="noopener noreferrer">☕ Support</a>.</p>
          <div class="landing-actions">
            <button class="btn btn-primary" type="button" data-action="launch-planner">Go to Guided setup</button>
          </div>
        </section>

        <section class="learn-section" id="learn-grossnet">
          <h3>11) Gross vs Net Withdrawals (Tax Wedge)</h3>
          <p class="muted">If you need a net spending amount, you often need a larger gross RRSP/RRIF withdrawal because some goes to tax.</p>
          <ul class="plain-list">
            <li><strong>Net spending need:</strong> what you keep to live on.</li>
            <li><strong>Gross withdrawal:</strong> total amount taken from RRSP/RRIF.</li>
            <li><strong>Tax wedge:</strong> the part of gross sent to tax.</li>
          </ul>
          <p class="small-copy muted">This is why the planner shows both net gap and gross withdrawal.</p>
        </section>

        <section class="learn-section" id="learn-meltdown">
          <h3>12) RRSP Meltdown: Why earlier withdrawals can help</h3>
          <p class="muted">A planned early withdrawal strategy can reduce large forced RRIF withdrawals later, potentially lowering peak tax and clawback pressure.</p>
          <ul class="plain-list">
            <li>Withdraw moderately in lower-tax years.</li>
            <li>Reduce RRSP size before RRIF minimums rise.</li>
            <li>Potentially reduce OAS clawback in high-income years.</li>
          </ul>
          <p class="small-copy muted">This is a planning illustration, not advice.</p>
        </section>
      </div>
    </div>
  `;
}
