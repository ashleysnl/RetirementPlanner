export function loadPlanFromStorage(storageKey, normalizePlan, createDefaultPlan) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return createDefaultPlan();
    const parsed = JSON.parse(raw);
    return normalizePlan(parsed);
  } catch {
    return createDefaultPlan();
  }
}

export function savePlanToStorage(storageKey, plan) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(plan));
  } catch {
    // Ignore storage write failures (private mode, quota, blocked storage).
  }
}
