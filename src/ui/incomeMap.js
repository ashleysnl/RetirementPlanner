function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function findByAge(rows, age) {
  return rows.find((row) => row.age === age) || null;
}

function markerAges(plan) {
  const out = [];
  if (plan.income.pension.enabled) out.push({ age: Number(plan.income.pension.startAge || 65), label: "Pension start" });
  out.push({ age: Number(plan.income.cpp.startAge || 65), label: "CPP start" });
  out.push({ age: Number(plan.income.oas.startAge || 65), label: "OAS start" });
  out.push({
    age: Number(plan.strategy.rrifConversionAge || 71),
    label: plan.strategy.applyRrifMinimums ? "RRIF start" : "RRIF rules off",
  });
  return out;
}

export function renderIncomeMap(ctx) {
  const {
    mountEl,
    plan,
    rows,
    selectedAge,
    formatCurrency,
    formatPct,
    state,
    phases = [],
  } = ctx;
  if (!mountEl) return null;
  if (!rows.length) {
    mountEl.innerHTML = "";
    return null;
  }
  const minAge = rows[0].age;
  const maxAge = rows[rows.length - 1].age;
  const uiMap = state.uiState.incomeMap || {};
  const showGross = Boolean(state.uiState.showGrossWithdrawals ?? true);
  const showMarkers = Boolean(uiMap.highlightKeyAges ?? true);
  const showTable = Boolean(uiMap.showTable);
  const visible = rows.slice();
  const keys = markerAges(plan).filter((m) => m.age >= minAge && m.age <= maxAge);
  const visiblePhases = (phases || []).filter((phase) => !(phase.endAge < minAge || phase.startAge > maxAge));
  const tableHtml = showTable
    ? `
      <div class="table-scroll income-map-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Age</th><th>Phase</th><th>Pension</th><th>CPP</th><th>OAS</th><th>${showGross ? "RRSP/RRIF (gross)" : "RRSP/RRIF (net)"}</th><th>Tax wedge</th><th>Spending</th><th>Coverage</th>
            </tr>
          </thead>
          <tbody>
            ${visible.map((row) => `
              <tr>
                <td>${row.age}</td>
                <td>${phaseLabelForAge(row.age, visiblePhases)}</td>
                <td>${formatCurrency(row.pensionGross)}</td>
                <td>${formatCurrency(row.cppGross)}</td>
                <td>${formatCurrency(row.oasGross)}</td>
                <td>${formatCurrency(showGross ? row.withdrawalGross : row.withdrawalNet)}</td>
                <td>${formatCurrency(row.taxOnWithdrawal + row.oasClawback)}</td>
                <td>${formatCurrency(row.spendingAfterTax)}</td>
                <td>${formatPct(row.coveragePct)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `
    : "";

  mountEl.innerHTML = `
    <article class="subsection income-map">
      <div class="chart-head-row">
        <h3>Retirement Income Map</h3>
        <div class="legend-row">
          <span class="legend-item"><span class="legend-chip" style="background:#f59e0b;"></span>Pension</span>
          <span class="legend-item"><span class="legend-chip" style="background:#16a34a;"></span>CPP</span>
          <span class="legend-item"><span class="legend-chip" style="background:#0ea5a8;"></span>OAS</span>
          <span class="legend-item"><span class="legend-chip" style="background:#0f6abf;"></span>RRSP/RRIF</span>
          <span class="legend-item"><span class="legend-chip" style="background:#d9485f;"></span>Tax wedge</span>
          <span class="legend-item"><span class="legend-chip" style="background:#111827;"></span>Spending target</span>
        </div>
      </div>
      <p class="small-copy muted">Where each retirement dollar comes from each year. Click a bar to jump your selected age.</p>
      <div class="income-map-controls">
        <label class="inline-check small-copy"><input type="checkbox" data-bind="uiState.showGrossWithdrawals" ${showGross ? "checked" : ""} /> Show withdrawals as gross</label>
        <label class="inline-check small-copy"><input type="checkbox" data-bind="uiState.incomeMap.highlightKeyAges" ${showMarkers ? "checked" : ""} /> Highlight key ages</label>
        <label class="inline-check small-copy"><input type="checkbox" data-bind="uiState.incomeMap.showTable" ${showTable ? "checked" : ""} /> View as table</label>
      </div>
      ${visiblePhases.length ? `
        <div class="income-phase-row" aria-label="Retirement phases">
          ${visiblePhases.map((phase) => `
            <button type="button" class="phase-chip" data-action="set-selected-age" data-value="${phase.startAge}" data-tooltip-key="${phaseTooltipKey(phase.key)}" aria-label="${phase.label} starts at age ${phase.startAge}">
              ${phase.label} (${phase.startAge}-${phase.endAge})
            </button>
          `).join("")}
        </div>
      ` : ""}
      <div class="chart-canvas-wrap income-map-canvas-wrap">
        <canvas id="incomeMapCanvas" width="1200" height="360" aria-label="Retirement income map chart" role="img"></canvas>
        <div id="incomeMapHover" class="chart-hover" hidden></div>
      </div>
      ${showMarkers ? `<p class="small-copy muted">Markers: ${keys.map((k) => `${k.label} (Age ${k.age})`).join(" • ") || "none in current window"}</p>` : ""}
      ${tableHtml}
    </article>
  `;

  return {
    visibleRows: visible,
    visiblePhases,
    showGross,
    showMarkers,
    markers: keys,
    selectedAge,
  };
}

export function drawIncomeMapCanvas(ctx) {
  const {
    canvas,
    visibleRows,
    selectedAge,
    showGross,
    showMarkers,
    markers,
    phases = [],
    formatCurrency,
  } = ctx;
  if (!canvas || !visibleRows?.length) return { hitZones: [] };
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 40) return { hitZones: [] };

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(900, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(360 * dpr);
  const g = canvas.getContext("2d");
  if (!g) return { hitZones: [] };
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = 360;
  const pad = { left: 52, right: 16, top: 16, bottom: 38 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  g.clearRect(0, 0, w, h);

  const vals = [];
  for (const row of visibleRows) {
    const taxWedge = row.taxOnWithdrawal + row.oasClawback;
    const withdrawalPart = showGross ? Math.max(0, row.withdrawalGross - taxWedge) : row.withdrawalNet;
    vals.push(row.pensionGross + row.cppGross + row.oasGross + withdrawalPart + taxWedge);
    vals.push(row.spendingAfterTax);
  }
  const maxY = Math.max(1, ...vals) * 1.15;
  const x = (i) => pad.left + (innerW * i) / Math.max(1, visibleRows.length - 1);
  const y = (v) => pad.top + innerH - (v / maxY) * innerH;
  const barW = Math.max(8, Math.min(18, innerW / Math.max(visibleRows.length, 24)));

  for (const phase of phases) {
    const startIdx = visibleRows.findIndex((r) => r.age >= phase.startAge);
    const endIdx = (() => {
      let idx = -1;
      for (let i = visibleRows.length - 1; i >= 0; i -= 1) {
        if (visibleRows[i].age <= phase.endAge) {
          idx = i;
          break;
        }
      }
      return idx;
    })();
    if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) continue;
    const x0 = x(startIdx) - (barW / 2);
    const x1 = x(endIdx) + (barW / 2);
    g.fillStyle = "rgba(15, 106, 191, 0.03)";
    g.fillRect(x0, pad.top, Math.max(1, x1 - x0), innerH);
  }

  g.strokeStyle = "#dfe7f3";
  for (let i = 0; i <= 4; i += 1) {
    const gy = pad.top + (innerH * i) / 4;
    g.beginPath();
    g.moveTo(pad.left, gy);
    g.lineTo(w - pad.right, gy);
    g.stroke();
  }

  if (showMarkers) {
    for (const marker of markers || []) {
      const idx = visibleRows.findIndex((r) => r.age === marker.age);
      if (idx < 0) continue;
      const mx = x(idx);
      g.strokeStyle = "rgba(31, 42, 61, 0.24)";
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(mx, pad.top);
      g.lineTo(mx, pad.top + innerH);
      g.stroke();
      g.setLineDash([]);
    }
  }

  const hitZones = [];
  visibleRows.forEach((row, idx) => {
    const taxWedge = row.taxOnWithdrawal + row.oasClawback;
    const withdrawalPart = showGross ? Math.max(0, row.withdrawalGross - taxWedge) : row.withdrawalNet;
    const parts = [
      [row.pensionGross, "#f59e0b"],
      [row.cppGross, "#16a34a"],
      [row.oasGross, "#0ea5a8"],
      [withdrawalPart, "#0f6abf"],
      [taxWedge, "#d9485f"],
    ];
    let stack = 0;
    const cx = x(idx) - barW / 2;
    for (const [v, c] of parts) {
      if (v <= 0) continue;
      const yTop = y(stack + v);
      const yBottom = y(stack);
      g.fillStyle = c;
      g.fillRect(cx, yTop, barW, Math.max(1, yBottom - yTop));
      stack += v;
    }
    hitZones.push({
      x: cx,
      y: y(stack),
      w: barW,
      h: Math.max(1, y(0) - y(stack)),
      row,
    });
  });

  const linePts = visibleRows.map((r, i) => [x(i), y(r.spendingAfterTax)]);
  g.strokeStyle = "#111827";
  g.lineWidth = 1.8;
  g.beginPath();
  linePts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.stroke();

  const selected = findByAge(visibleRows, selectedAge);
  if (selected) {
    const idx = visibleRows.findIndex((r) => r.age === selected.age);
    const sx = x(idx);
    g.strokeStyle = "rgba(15,106,191,0.5)";
    g.setLineDash([4, 4]);
    g.beginPath();
    g.moveTo(sx, pad.top);
    g.lineTo(sx, pad.top + innerH);
    g.stroke();
    g.setLineDash([]);
  }

  g.fillStyle = "#5f6b7d";
  g.font = "12px Avenir Next";
  g.fillText(formatCurrency(0), 8, h - 10);
  g.fillText(formatCurrency(maxY), 8, pad.top + 4);
  const step = Math.max(1, Math.ceil((visibleRows.length - 1) / Math.max(3, Math.floor(innerW / 110))));
  for (let i = 0; i < visibleRows.length; i += step) {
    const label = `Age ${visibleRows[i].age}`;
    const lx = x(i);
    const lw = g.measureText(label).width;
    g.fillText(label, clamp(lx - lw / 2, pad.left, w - pad.right - lw), h - 10);
  }
  return { hitZones };
}

export function bindIncomeMapHover(event, ctx) {
  const { hitZones, hoverEl, chartEl, formatCurrency, formatPct, showGross } = ctx;
  if (!hoverEl || !chartEl || !hitZones?.length) return;
  const rect = chartEl.getBoundingClientRect();
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  const hit = hitZones.find((z) => px >= z.x && px <= (z.x + z.w) && py >= z.y && py <= (z.y + z.h));
  if (!hit) {
    hoverEl.hidden = true;
    return;
  }
  const row = hit.row;
  const wedge = row.taxOnWithdrawal + row.oasClawback;
  hoverEl.hidden = false;
  hoverEl.innerHTML = `
    <strong>Age ${row.age}</strong><br />
    Pension: ${formatCurrency(row.pensionGross)}<br />
    CPP: ${formatCurrency(row.cppGross)}<br />
    OAS: ${formatCurrency(row.oasGross)}<br />
    Withdrawal (${showGross ? "gross" : "net"}): ${formatCurrency(showGross ? row.withdrawalGross : row.withdrawalNet)}<br />
    Tax wedge: ${formatCurrency(wedge)}<br />
    Spending target: ${formatCurrency(row.spendingAfterTax)}<br />
    Coverage: ${formatPct(row.coveragePct)}
  `;
}

export function pickIncomeMapAge(event, hitZones) {
  if (!hitZones?.length) return null;
  const rect = event.currentTarget?.getBoundingClientRect?.();
  if (!rect) return null;
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  const hit = hitZones.find((z) => px >= z.x && px <= (z.x + z.w) && py >= z.y && py <= (z.y + z.h));
  return hit?.row?.age ?? null;
}

function phaseLabelForAge(age, phases) {
  const match = (phases || []).find((p) => age >= p.startAge && age <= p.endAge);
  return match ? match.label : "-";
}

function phaseTooltipKey(key) {
  if (key === "rrif") return "forcedRrifDrawdown";
  if (key === "benefits") return "cppStartAge";
  return "retirementAge";
}
