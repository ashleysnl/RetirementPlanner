export function drawPortfolioChart({
  canvas,
  rows,
  bestRows,
  worstRows,
  showStressBand,
  formatCurrency,
  formatCompactCurrency,
}) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(800, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(320 * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = 320;
  const pad = { left: 54, right: 16, top: 18, bottom: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);

  const values = [];
  rows.forEach((row) => values.push(row.balance));
  if (showStressBand) {
    (bestRows || []).forEach((row) => values.push(row.balance));
    (worstRows || []).forEach((row) => values.push(row.balance));
  }
  const maxY = Math.max(1, ...values) * 1.06;

  ctx.strokeStyle = "#dfe7f3";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const gy = pad.top + (innerH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(w - pad.right, gy);
    ctx.stroke();
  }

  const x = (index) => pad.left + (innerW * index) / Math.max(1, rows.length - 1);
  const y = (value) => pad.top + innerH - (value / maxY) * innerH;
  const baselineY = pad.top + innerH;

  const balanceGradient = ctx.createLinearGradient(pad.left, pad.top, w - pad.right, h - pad.bottom);
  balanceGradient.addColorStop(0, "#0f6abf");
  balanceGradient.addColorStop(1, "#0ea5a8");
  const balanceArea = ctx.createLinearGradient(0, pad.top, 0, baselineY);
  balanceArea.addColorStop(0, "rgba(15, 106, 191, 0.26)");
  balanceArea.addColorStop(1, "rgba(14, 165, 168, 0.04)");

  if (showStressBand && Array.isArray(bestRows) && bestRows.length === rows.length) {
    plotLine(ctx, bestRows.map((r, i) => [x(i), y(r.balance)]), "#7aa7d8", 1.6, [4, 4]);
  }
  if (showStressBand && Array.isArray(worstRows) && worstRows.length === rows.length) {
    plotLine(ctx, worstRows.map((r, i) => [x(i), y(r.balance)]), "#7aa7d8", 1.6, [4, 4]);
  }

  const balancePoints = rows.map((r, i) => [x(i), y(r.balance)]);
  if (balancePoints.length > 1) {
    ctx.beginPath();
    ctx.moveTo(balancePoints[0][0], baselineY);
    balancePoints.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(balancePoints[balancePoints.length - 1][0], baselineY);
    ctx.closePath();
    ctx.fillStyle = balanceArea;
    ctx.fill();
  }

  plotLine(ctx, balancePoints, balanceGradient, 2.8);

  ctx.fillStyle = "#5f6b7d";
  ctx.font = "12px Avenir Next";
  ctx.fillText(formatCurrency(0), 8, h - 10);
  ctx.fillText(formatCompactCurrency(maxY), 8, pad.top + 4);

  const last = rows[rows.length - 1];
  const approxTickCount = Math.max(3, Math.floor(innerW / 120));
  const step = Math.max(1, Math.ceil((rows.length - 1) / approxTickCount));
  for (let i = 0; i < rows.length; i += step) {
    const label = `Age ${rows[i].age}`;
    const lx = x(i);
    const lw = ctx.measureText(label).width;
    const drawX = Math.max(pad.left, Math.min(w - pad.right - lw, lx - lw / 2));
    ctx.fillText(label, drawX, h - 10);
  }
  const endLabel = `Age ${last.age}`;
  const endWidth = ctx.measureText(endLabel).width;
  ctx.fillText(endLabel, w - pad.right - endWidth, h - 10);
}

export function drawIncomeCoverageChart({
  canvas,
  rows,
  selectedAge,
  showTodaysDollars,
  showGrossWithdrawals,
  currentYear,
  inflationRate,
  formatCurrency,
  formatCompactCurrency,
}) {
  if (!canvas || !rows.length) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(800, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(340 * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = 340;
  const pad = { left: 52, right: 16, top: 16, bottom: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  ctx.clearRect(0, 0, w, h);

  const amountForDisplay = (row, amount) => {
    if (!showTodaysDollars) return amount;
    const yearsFromNow = Math.max(0, row.year - currentYear);
    return amount / Math.pow(1 + inflationRate, yearsFromNow);
  };

  const values = [];
  rows.forEach((row) => {
    values.push(
      amountForDisplay(row, row.guaranteedNet + row.netFromWithdrawal + row.taxOnWithdrawal + row.oasClawback),
      amountForDisplay(row, row.spending)
    );
  });
  const maxY = Math.max(1, ...values) * 1.15;

  const x = (i) => pad.left + (innerW * i) / Math.max(1, rows.length - 1);
  const y = (v) => pad.top + innerH - (v / maxY) * innerH;
  const barW = Math.max(6, Math.min(14, innerW / Math.max(rows.length, 30)));

  ctx.strokeStyle = "#e1e8f3";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const gy = pad.top + (innerH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(w - pad.right, gy);
    ctx.stroke();
  }

  rows.forEach((row, idx) => {
    const cx = x(idx) - barW / 2;
    const pension = amountForDisplay(row, row.pensionNet + row.spousePensionNet);
    const cpp = amountForDisplay(row, row.cppNet + row.spouseCppNet);
    const oas = amountForDisplay(row, row.oasNet + row.spouseOasNet);
    const netW = amountForDisplay(row, row.netFromWithdrawal);
    const taxW = amountForDisplay(row, row.taxOnWithdrawal + row.oasClawback);

    let stack = 0;
    const segments = [
      [pension, "#f59e0b"],
      [cpp, "#16a34a"],
      [oas, "#0ea5a8"],
      [netW, "#0f6abf"],
      [showGrossWithdrawals ? taxW : Math.min(taxW, maxY * 0.01), "#d9485f"],
    ];
    segments.forEach(([value, color], segIdx) => {
      if (value <= 0) return;
      const yTop = y(stack + value);
      const yBottom = y(stack);
      ctx.fillStyle = color;
      ctx.fillRect(cx, yTop, barW, Math.max(1, yBottom - yTop));
      if (segIdx === 4) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 1;
        const hSeg = Math.max(1, yBottom - yTop);
        for (let yy = yTop - barW; yy < yTop + hSeg + barW; yy += 5) {
          ctx.beginPath();
          ctx.moveTo(cx, yy);
          ctx.lineTo(cx + barW, yy + barW);
          ctx.stroke();
        }
        ctx.restore();
        if (hSeg > 14) {
          ctx.fillStyle = "#fff";
          ctx.font = "10px Avenir Next";
          ctx.fillText("Tax wedge", cx + 2, yTop + Math.min(12, hSeg - 2));
        }
      }
      stack += value;
    });
  });

  const linePts = rows.map((r, i) => [x(i), y(amountForDisplay(r, r.spending))]);
  plotLine(ctx, linePts, "#111827", 1.8);

  const mark = findNearestRowByAge(rows, selectedAge);
  if (mark) {
    const idx = rows.findIndex((r) => r.age === mark.age);
    const mx = x(idx);
    ctx.strokeStyle = "rgba(15,106,191,0.45)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mx, pad.top);
    ctx.lineTo(mx, pad.top + innerH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "#5f6b7d";
  ctx.font = "12px Avenir Next";
  ctx.fillText(formatCurrency(0), 8, h - 10);
  ctx.fillText(formatCompactCurrency(maxY), 8, pad.top + 4);
  const step = Math.max(1, Math.ceil((rows.length - 1) / Math.max(3, Math.floor(innerW / 110))));
  for (let i = 0; i < rows.length; i += step) {
    const label = `Age ${rows[i].age}`;
    const lx = x(i);
    const lw = ctx.measureText(label).width;
    ctx.fillText(label, clamp(lx - lw / 2, pad.left, w - pad.right - lw), h - 10);
  }
}

export function plotLine(ctx, points, color, width, dash = []) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(p[0], p[1]);
    else ctx.lineTo(p[0], p[1]);
  });
  ctx.stroke();
  ctx.setLineDash([]);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function findNearestRowByAge(rows, age) {
  if (!rows.length) return null;
  const exact = rows.find((row) => row.age === age);
  if (exact) return exact;
  let best = rows[0];
  let bestDistance = Math.abs(best.age - age);
  for (const row of rows) {
    const d = Math.abs(row.age - age);
    if (d < bestDistance) {
      best = row;
      bestDistance = d;
    }
  }
  return best;
}
