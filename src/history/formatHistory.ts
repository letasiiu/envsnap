import { HistoryEntry } from "./history";

const ACTION_LABELS: Record<HistoryEntry["action"], string> = {
  created: "✅ created",
  restored: "♻️  restored",
  deleted: "🗑️  deleted",
  tagged: "🏷️  tagged",
};

export function formatHistoryTable(entries: HistoryEntry[]): string {
  if (entries.length === 0) return "No history entries found.";

  const header = ["Timestamp", "Action", "Name", "ID", "Meta"];
  const rows = entries.map((e) => [
    e.timestamp,
    ACTION_LABELS[e.action] ?? e.action,
    e.name,
    e.snapshotId.slice(0, 8),
    e.meta ? Object.entries(e.meta).map(([k, v]) => `${k}=${v}`).join(", ") : "",
  ]);

  const colWidths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length))
  );

  const fmt = (row: string[]) =>
    row.map((cell, i) => cell.padEnd(colWidths[i])).join("  ");

  const separator = colWidths.map((w) => "-".repeat(w)).join("  ");

  return [fmt(header), separator, ...rows.map(fmt)].join("\n");
}

export function formatHistorySummary(entries: HistoryEntry[]): string {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    counts[e.action] = (counts[e.action] ?? 0) + 1;
  }
  const lines = Object.entries(counts).map(
    ([action, count]) => `  ${ACTION_LABELS[action as HistoryEntry["action"]] ?? action}: ${count}`
  );
  return `History summary (${entries.length} total):\n${lines.join("\n")}`;
}
