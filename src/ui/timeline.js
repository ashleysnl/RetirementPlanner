function sortEvents(events) {
  return [...events].sort((a, b) => Number(a.age) - Number(b.age));
}

function groupEventsByAge(events) {
  const map = new Map();
  for (const event of events) {
    const age = Number(event.age);
    if (!map.has(age)) map.set(age, { age, items: [] });
    map.get(age).items.push(event);
  }
  return Array.from(map.values()).sort((a, b) => a.age - b.age);
}

export function buildTimelineEvents(plan) {
  const events = [
    { key: "retire", age: Number(plan.profile.retirementAge || 65), label: "Retirement starts", detail: "Portfolio withdrawals can begin." },
    { key: "cpp", age: Number(plan.income.cpp.startAge || 65), label: "CPP starts", detail: "CPP income begins at this age." },
    { key: "oas", age: Number(plan.income.oas.startAge || 65), label: "OAS starts", detail: "OAS begins and may later face clawback." },
  ];
  if (plan.income.pension.enabled) {
    events.push({
      key: "pension",
      age: Number(plan.income.pension.startAge || plan.profile.retirementAge || 65),
      label: "Private pension starts",
      detail: "Guaranteed pension income begins.",
    });
  }
  if (plan.strategy.applyRrifMinimums) {
    const conversionAge = Number(plan.strategy.rrifConversionAge || 71);
    events.push({
      key: "rrif",
      age: conversionAge,
      label: "RRIF minimums begin",
      detail: "Minimum taxable RRIF withdrawals apply.",
    });
  } else {
    events.push({
      key: "rrif-off",
      age: 71,
      label: "RRIF rules OFF",
      detail: "Enable RRIF minimums to model forced withdrawals.",
      disabled: true,
    });
  }
  return sortEvents(events);
}

export function renderTimeline(ctx) {
  const {
    mountEl,
    events,
    selectedAge,
  } = ctx;
  if (!mountEl) return;
  if (!Array.isArray(events) || !events.length) {
    mountEl.innerHTML = "";
    return;
  }

  const grouped = groupEventsByAge(events);
  const minAge = Math.min(...grouped.map((e) => Number(e.age)));
  const maxAge = Math.max(...grouped.map((e) => Number(e.age)));
  const span = Math.max(1, maxAge - minAge);

  mountEl.innerHTML = `
    <article class="subsection retirement-timeline">
      <h3>Retirement Timeline</h3>
      <div class="timeline-track" role="list" aria-label="Retirement timeline markers">
        ${grouped.map((group) => {
          const pct = ((Number(group.age) - minAge) / span) * 100;
          const isActive = Number(group.age) === Number(selectedAge);
          const edgeClass = pct <= 8 ? "edge-left" : (pct >= 92 ? "edge-right" : "");
          const disabled = group.items.every((item) => item.disabled);
          const label = group.items.length === 1 ? group.items[0].label : `${group.items.length} events`;
          return `
            <button
              role="listitem"
              type="button"
              class="timeline-marker ${isActive ? "active" : ""} ${disabled ? "disabled" : ""} ${edgeClass}"
              style="left:${pct.toFixed(2)}%;"
              data-action="set-selected-age"
              data-value="${group.age}"
              aria-label="${label} at age ${group.age}"
            >
              <span class="timeline-dot"></span>
              <span class="timeline-age">Age ${group.age}</span>
              <span class="timeline-pill">${label}</span>
            </button>
          `;
        }).join("")}
      </div>
      <div class="timeline-events" role="list" aria-label="Timeline event details">
        ${grouped.map((group) => `
          <button
            role="listitem"
            type="button"
            class="timeline-event-card ${Number(group.age) === Number(selectedAge) ? "active" : ""}"
            data-action="set-selected-age"
            data-value="${group.age}"
            aria-label="Jump to age ${group.age}"
          >
            <strong>Age ${group.age}</strong>
            <ul class="plain-list">
              ${group.items.map((item) => `<li>${item.label}: ${item.detail}</li>`).join("")}
            </ul>
          </button>
        `).join("")}
      </div>
      <div class="timeline-stack" aria-hidden="true">
        ${events.map((event) => `
          <button
            type="button"
            class="timeline-stack-row ${Number(event.age) === Number(selectedAge) ? "active" : ""} ${event.disabled ? "disabled" : ""}"
            data-action="set-selected-age"
            data-value="${event.age}"
          >
            <strong>Age ${event.age}</strong> - ${event.label}
          </button>
        `).join("")}
      </div>
      <p class="small-copy muted">Tip: Tap a marker to jump dashboard visuals to that age.</p>
    </article>
  `;
}
