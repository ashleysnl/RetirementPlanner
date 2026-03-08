export function loadPlanFromStorage(storageKey, normalizePlan, createDefaultPlan) {
  const storages = [];
  try {
    if (typeof localStorage !== "undefined") storages.push(localStorage);
  } catch (error) {
    void error;
  }
  try {
    if (typeof sessionStorage !== "undefined") storages.push(sessionStorage);
  } catch (error) {
    void error;
  }

  for (const storage of storages) {
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      return normalizePlan(parsed);
    } catch (error) {
      void error;
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
  } catch (error) {
    void error;
  }

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(storageKey, serialized);
      if (sessionStorage.getItem(storageKey) === serialized) saved = true;
    }
  } catch (error) {
    void error;
  }

  return saved;
}

export function clearPlanFromStorage(storageKey) {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(storageKey);
  } catch (error) {
    void error;
  }
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(storageKey);
  } catch (error) {
    void error;
  }
}
