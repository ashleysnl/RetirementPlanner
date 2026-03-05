import { plotLine } from "./charts.js";

export function drawLearnLineChart(canvas, series, options = {}, formatCurrency, formatCompactCurrency) {
  drawLearnMultiLineChart(
    canvas,
    [series],
    {
      colors: [options.color || "#0f6abf"],
      fills: [options.fill || "rgba(15, 106, 191, 0.1)"],
      labels: [],
      xLabeler: options.xLabeler,
    },
    formatCurrency,
    formatCompactCurrency
  );
}

export function drawLearnMultiLineChart(canvas, seriesList, options = {}, formatCurrency, formatCompactCurrency) {
  if (!canvas || !Array.isArray(seriesList) || !seriesList.length) return;
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

  const allValues = [];
  for (let i = 0; i < seriesList.length; i += 1) {
    const row = Array.isArray(seriesList[i]) ? seriesList[i] : [];
    for (let j = 0; j < row.length; j += 1) {
      const val = Number(row[j]);
      if (Number.isFinite(val)) allValues.push(val);
    }
  }
  if (!allValues.length) return;
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
  const yMinLabel = safeFormat(formatCurrency, 0, "0");
  const yMaxLabel = safeFormat(formatCompactCurrency, maxY, String(Math.round(maxY)));
  ctx.fillText(yMinLabel, 8, h - 10);
  ctx.fillText(yMaxLabel, 8, pad.top + 4);
  const labeler = typeof options.xLabeler === "function"
    ? options.xLabeler
    : (i, total) => (i % Math.max(1, Math.ceil(total / 6)) === 0 ? `${i}` : "");
  let xLabelCount = 0;
  for (let i = 0; i < maxLen; i += 1) {
    const label = labeler(i, maxLen - 1);
    if (!label) continue;
    const lx = x(i);
    const lw = ctx.measureText(label).width;
    ctx.fillText(label, clamp(lx - lw / 2, pad.left, w - pad.right - lw), h - 10);
    xLabelCount += 1;
  }
  // Fallback labels for strict/buggy environments where custom label callbacks produce none.
  if (xLabelCount === 0) {
    const fallbackIdx = [0, Math.floor((maxLen - 1) / 2), maxLen - 1];
    fallbackIdx.forEach((i) => {
      const label = `${i}`;
      const lx = x(i);
      const lw = ctx.measureText(label).width;
      ctx.fillText(label, clamp(lx - lw / 2, pad.left, w - pad.right - lw), h - 10);
    });
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safeFormat(formatter, value, fallback) {
  if (typeof formatter !== "function") return fallback;
  try {
    const out = formatter(value);
    if (out == null) return fallback;
    const text = String(out);
    return text.length ? text : fallback;
  } catch {
    return fallback;
  }
}
