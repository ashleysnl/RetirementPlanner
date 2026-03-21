export function navFromHash(hash, normalizeNavTarget) {
  const key = String(hash || "").replace("#", "").trim();
  if (key.startsWith("learn-")) return "learn";
  return normalizeNavTarget(key);
}

export function syncNavHash(nav, normalizeNavTarget) {
  if (!history.replaceState) return;
  const safeNav = normalizeNavTarget(nav) || "results";
  history.replaceState(null, "", `#${safeNav}`);
}

export function normalizeNavTarget(value) {
  const key = String(value || "").trim();
  if (key === "guided" || key === "start" || key === "inputs") return "plan";
  if (key === "dashboard" || key === "home") return "results";
  if (key === "stress" || key === "scenario") return "scenarios";
  if (key === "notes" || key === "export" || key === "advanced") return "tools";
  if (key === "method" || key === "methodology") return "tools";
  const allowed = new Set(["plan", "results", "scenarios", "learn", "tools", "support"]);
  return allowed.has(key) ? key : "";
}
