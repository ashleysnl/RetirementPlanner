export function loadPlanFromStorage(storageKey, normalizePlan, createDefaultPlan) {
  const storages = [];
  try {
    if (typeof localStorage !== "undefined") storages.push(localStorage);
  } catch {}
  try {
    if (typeof sessionStorage !== "undefined") storages.push(sessionStorage);
  } catch {}

  for (const storage of storages) {
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      return normalizePlan(parsed);
    } catch {
      // try next storage
    }
  }

  return createDefaultPlan();
}

export function savePlanToStorage(storageKey, plan) {
  const serialized = JSON.stringify(plan);
  let saved = false;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, serialized);
      if (localStorage.getItem(storageKey) === serialized) saved = true;
    }
  } catch {}

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(storageKey, serialized);
      if (sessionStorage.getItem(storageKey) === serialized) saved = true;
    }
  } catch {}

  return saved;
}

export function clearPlanFromStorage(storageKey) {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(storageKey);
  } catch {}
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(storageKey);
  }
}
