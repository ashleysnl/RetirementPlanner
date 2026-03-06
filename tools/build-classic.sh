#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="$ROOT_DIR/app.classic.js"
TMP_FILE="$(mktemp)"

MODULES=(
  "src/model/constants.js"
  "src/model/calculations.js"
  "src/model/projection.js"
  "src/model/score.js"
  "src/model/timingSim.js"
  "src/model/meltdown.js"
  "src/model/diff.js"
  "src/model/risks.js"
  "src/model/yearBreakdown.js"
  "src/model/phases.js"
  "src/model/peakTax.js"
  "src/model/scenarioStore.js"
  "src/model/planStore.js"
  "src/model/planSchema.js"
  "src/content/sources.js"
  "src/content/referenceLinks.js"
  "src/content/constants.js"
  "src/ui/formatters.js"
  "src/ui/actions/planActions.js"
  "src/ui/fields.js"
  "src/ui/charts.js"
  "src/ui/tooltips.js"
  "src/ui/interactions.js"
  "src/ui/learnCharts.js"
  "src/ui/navigation.js"
  "src/ui/dashboardHelpers.js"
  "src/ui/startupGuard.js"
  "src/ui/retirementGapHeadline.js"
  "src/ui/taxWedgeMini.js"
  "src/ui/retirementInsight.js"
  "src/ui/taxWedgeEnhancements.js"
  "src/ui/whatChangedPanel.js"
  "src/ui/scenarioCompare.js"
  "src/ui/printSummary.js"
  "src/ui/keyRisks.js"
  "src/ui/timeline.js"
  "src/ui/presets.js"
  "src/ui/incomeMap.js"
  "src/ui/peakTaxYear.js"
  "src/ui/strategySuggestions.js"
  "src/model/clientSummary.js"
  "src/ui/clientSummaryMode.js"
  "src/ui/clientSummaryPrint.js"
  "src/ui/coverageScore.js"
  "src/ui/cppOasTimingSimulator.js"
  "src/ui/rrspMeltdownSimulator.js"
  "src/ui/resultsStrip.js"
  "src/ui/supportMoments.js"
  "src/ui/share.js"
  "src/ui/learnUtils.js"
  "src/ui/referenceLinksList.js"
  "src/content/methodology.js"
  "src/ui/views/wizardView.js"
  "src/ui/views/learnView.js"
  "src/ui/views/learnOutputsView.js"
  "src/ui/views/planInputsView.js"
  "src/ui/views/planEditorView.js"
  "src/ui/views/dashboardView.js"
  "src/ui/views/advancedView.js"
)

strip_module_syntax() {
  awk '
    BEGIN { in_import = 0 }
    {
      if (in_import) {
        if ($0 ~ /from[[:space:]]+["'\''"].*["'\''"];[[:space:]]*$/) in_import = 0;
        next;
      }
      if ($0 ~ /^import[[:space:]]*\{.*from[[:space:]]+["'\''"].*["'\''"];[[:space:]]*$/) next;
      if ($0 ~ /^import[[:space:]]*\{/) {
        in_import = 1;
        next;
      }
      if ($0 ~ /^import[[:space:]].*;[[:space:]]*$/) next;
      if ($0 ~ /^export[[:space:]]+\{.*\};?[[:space:]]*$/) next;

      sub(/^export[[:space:]]+function[[:space:]]+/, "function ");
      sub(/^export[[:space:]]+async[[:space:]]+function[[:space:]]+/, "async function ");
      sub(/^export[[:space:]]+const[[:space:]]+/, "const ");
      sub(/^export[[:space:]]+let[[:space:]]+/, "let ");
      sub(/^export[[:space:]]+class[[:space:]]+/, "class ");
      print;
    }
  '
}

{
  echo "/* Auto-generated classic bundle fallback for file:// usage */"
  echo
} > "$TMP_FILE"

for module in "${MODULES[@]}"; do
  {
    echo "/* FILE: $module */"
    strip_module_syntax < "$ROOT_DIR/$module"
    echo
  } >> "$TMP_FILE"
done

cat >> "$TMP_FILE" <<'ALIAS_BLOCK'
const drawLearnLineChartUi = drawLearnLineChart;
const drawLearnMultiLineChartUi = drawLearnMultiLineChart;

const navFromHashUi = navFromHash;
const syncNavHashUi = syncNavHash;
const normalizeNavTargetUi = normalizeNavTarget;

const buildLearnCallouts = learnCallouts;
const calculatePhaseWeightedSpendingUi = calculatePhaseWeightedSpending;

const createDefaultLearningProgressSchema = createDefaultLearningProgress;
const createDefaultPlanSchema = createDefaultPlan;
const createDemoPlanSchema = createDemoPlan;
const normalizePlanSchema = normalizePlan;
const ensureValidStateSchema = ensureValidState;

const getOasRiskLevelHelper = getOasRiskLevel;
const amountForDisplayHelper = amountForDisplay;
const findRowByAgeHelper = findRowByAge;
const findFirstRetirementRowHelper = findFirstRetirementRow;
const buildNextActionsHelper = buildNextActions;

/* FILE: app.js (imports removed) */
ALIAS_BLOCK

strip_module_syntax < "$ROOT_DIR/app.js" >> "$TMP_FILE"
echo >> "$TMP_FILE"

mv "$TMP_FILE" "$OUT_FILE"
echo "Built $OUT_FILE"
