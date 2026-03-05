export function navFromHash(hash, normalizeNavTarget) {
  const key = String(hash || "").replace("#", "").trim();
  if (key.startsWith("learn-")) return "learn";
  return normalizeNavTarget(key);
}

export function syncNavHash(nav, normalizeNavTarget) {
  if (!history.replaceState) return;
  const safeNav = normalizeNavTarget(nav) || "dashboard";
  history.replaceState(null, "", `#${safeNav}`);
}

export function normalizeNavTarget(value) {
  const key = String(value || "").trim();
  if (key === "guided") return "start";
  if (key === "inputs") return "plan";
  if (key === "stress" || key === "notes" || key === "export") return "tools";
  if (key === "method") return "methodology";
  const allowed = new Set(["home", "start", "dashboard", "plan", "learn", "tools", "advanced", "about", "support", "methodology"]);
  return allowed.has(key) ? key : "";
}
