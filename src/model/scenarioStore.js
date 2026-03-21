function localId() {
  return `scn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function baseMetrics(model, plan) {
  const row65 = model.base.rows.find((r) => r.age === 65) || model.base.rows[0];
  return {
    coveragePct: row65 && row65.spending > 0 ? (row65.guaranteedNet / row65.spending) : 1,
    netGap65: row65?.netGap || 0,
    gross65: row65?.withdrawal || 0,
    taxWedge65: (row65?.taxOnWithdrawal || 0) + (row65?.oasClawback || 0),
    clawback65: row65?.oasClawback || 0,
    depletionAge: model.kpis.depletionAge || null,
    retirementAge: Number(plan.profile.retirementAge || 65),
  };
}

export function saveScenarioSnapshot(state, model, name = "Scenario") {
  if (!state.uiState.scenarios) state.uiState.scenarios = [];
  const scenario = {
    id: localId(),
    name: String(name || "Scenario"),
    createdAt: Date.now(),
    payload: {
      profile: state.profile,
      assumptions: state.assumptions,
      savings: state.savings,
      income: state.income,
      accounts: state.accounts,
      strategy: state.strategy,
    },
    metrics: baseMetrics(model, state),
  };
  state.uiState.scenarios.push(scenario);
  state.uiState.scenarios = state.uiState.scenarios.slice(-12);
  return scenario;
}

export function removeScenarioSnapshot(state, id) {
  const list = Array.isArray(state.uiState.scenarios) ? state.uiState.scenarios : [];
  state.uiState.scenarios = list.filter((x) => x.id !== id);
}

export function renameScenarioSnapshot(state, id, name) {
  const list = Array.isArray(state.uiState.scenarios) ? state.uiState.scenarios : [];
  const found = list.find((x) => x.id === id);
  if (!found) return;
  found.name = String(name || found.name || "Scenario").trim() || "Scenario";
}

