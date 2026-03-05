export function exportPlanJson(state, toast) {
  const exportObject = {
    ...state,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `retirement-plan-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  if (typeof toast === "function") toast("Plan exported.");
}

export async function importPlanFromFileInput({
  fileInput,
  normalizePlan,
  onPlanLoaded,
  toast,
}) {
  const file = fileInput?.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizePlan(parsed);
    onPlanLoaded(normalized);
    if (typeof toast === "function") toast("Plan imported.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    if (typeof toast === "function") toast(`Import error: ${message}`);
  } finally {
    if (fileInput) fileInput.value = "";
  }
}
