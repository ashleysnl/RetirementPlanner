export function toPct(decimal) {
  return Number(decimal) * 100;
}

export function normalizePct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n > 1) return n / 100;
  return n;
}

export function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatSignedPct(value) {
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value || 0);
}

export function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 1, notation: "compact" }).format(value || 0);
}

export function formatSignedCurrency(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value)}`;
}

export function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n * 1000) / 1000);
}

export function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
