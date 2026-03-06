const SUPPORT_COOLDOWN_DAYS = 14;

export function ensureSupportMomentState(uiState) {
  if (!uiState.supportShownEvents || typeof uiState.supportShownEvents !== "object") {
    uiState.supportShownEvents = {};
  }
  uiState.supportShownEvents = {
    wizardComplete: Boolean(uiState.supportShownEvents.wizardComplete),
    firstGrossUp: Boolean(uiState.supportShownEvents.firstGrossUp),
    firstClawback: Boolean(uiState.supportShownEvents.firstClawback),
    reportGenerated: Boolean(uiState.supportShownEvents.reportGenerated),
  };
  uiState.supportDismissedUntil = Number(uiState.supportDismissedUntil || 0);
  uiState.supportCardShownCount = Math.max(0, Number(uiState.supportCardShownCount || 0));
  uiState.supportCardDismissCount = Math.max(0, Number(uiState.supportCardDismissCount || 0));
  uiState.lastSupportTriggerReason = String(uiState.lastSupportTriggerReason || "");
  uiState.supportOptOut = Boolean(uiState.supportOptOut);
}

export function isSupportDismissed(uiState, now = Date.now()) {
  ensureSupportMomentState(uiState);
  return uiState.supportDismissedUntil > now;
}

export function markSupportMomentShown(uiState, key) {
  ensureSupportMomentState(uiState);
  uiState.supportShownEvents[key] = true;
  uiState.supportCardShownCount += 1;
  uiState.lastSupportTriggerReason = key;
}

export function dismissSupportMoment(uiState, now = Date.now()) {
  ensureSupportMomentState(uiState);
  uiState.supportCardDismissCount += 1;
  uiState.supportDismissedUntil = now + (SUPPORT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
}

export function maybeTriggerSupportMoment({ state, model, row, trigger, sessionShown = false }) {
  ensureSupportMomentState(state.uiState);
  if (state.uiState.supportOptOut) return "";
  if (state.uiState.supportCardDismissCount >= 3) return "";
  if (sessionShown) return "";
  if (isSupportDismissed(state.uiState)) return "";
  if (trigger === "wizardComplete" && !state.uiState.supportShownEvents.wizardComplete) return "wizardComplete";
  if (trigger === "firstGrossUp" && !state.uiState.supportShownEvents.firstGrossUp) {
    if ((row?.withdrawal || 0) > (row?.netFromWithdrawal || 0) && (row?.taxOnWithdrawal || 0) > 0) return "firstGrossUp";
  }
  if (trigger === "firstClawback" && !state.uiState.supportShownEvents.firstClawback) {
    if (state.strategy.oasClawbackModeling && (row?.oasClawback || 0) > 0) return "firstClawback";
  }
  if (trigger === "reportGenerated" && !state.uiState.supportShownEvents.reportGenerated) return "reportGenerated";
  if (!model || !row) return "";
  return "";
}

export function supportMomentCopy(eventKey) {
  if (eventKey === "wizardComplete") {
    return "If this clarified your retirement withdrawals and taxes, consider supporting development.";
  }
  if (eventKey === "firstClawback") {
    return "If this helped you understand OAS clawback risk, consider supporting development.";
  }
  return "If this clarified your retirement withdrawals and taxes, consider supporting development.";
}

export function buildSupportMomentCard(eventKey) {
  if (!eventKey) return "";
  return `
    <article class="subsection support-moment-card" aria-live="polite">
      <h3>Did this help clarify your retirement plan?</h3>
      <p class="muted">This tool is free and built by an independent developer. If it saved you time or helped you understand taxes and withdrawals, consider supporting its development.</p>
      <p class="small-copy muted">${supportMomentCopy(eventKey)}</p>
      <p class="small-copy muted">No paywall. Your support keeps it updated.</p>
      <div class="landing-actions">
        <a class="btn btn-primary" href="https://buymeacoffee.com/ashleysnl" target="_blank" rel="noopener noreferrer" aria-label="Buy me a coffee">☕ Buy me a coffee</a>
        <a class="btn btn-secondary" href="https://buymeacoffee.com/ashleysnl" target="_blank" rel="noopener noreferrer" aria-label="Become monthly supporter">☕ Become monthly supporter</a>
        <button class="btn btn-secondary" type="button" data-action="support-opt-out" aria-label="I already supported">I supported</button>
        <button class="btn btn-secondary" type="button" data-action="dismiss-support-moment">Not now</button>
      </div>
    </article>
  `;
}
