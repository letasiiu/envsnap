import { PruneResult } from "./prune";

export function formatPruneResult(result: PruneResult): string {
  const lines: string[] = [];
  const label = result.dryRun ? "[dry-run] " : "";

  if (result.removed.length === 0) {
    lines.push(`${label}No snapshots to prune.`);
  } else {
    lines.push(
      `${label}Pruned ${result.removed.length} snapshot(s):`
    );
    for (const name of result.removed) {
      lines.push(`  - ${name}`);
    }
  }

  if (result.pinned.length > 0) {
    lines.push(
      `\nSkipped ${result.pinned.length} pinned snapshot(s):`
    );
    for (const name of result.pinned) {
      lines.push(`  * ${name} (pinned)`);
    }
  }

  lines.push(
    `\nRetained: ${result.kept.length + result.pinned.length} snapshot(s).`
  );

  return lines.join("\n");
}

export function formatPruneHelp(): string {
  return [
    "Usage: envsnap prune [options]",
    "",
    "Options:",
    "  --keep-last <n>        Keep the n most recent snapshots",
    "  --older-than <days>    Remove snapshots older than <days> days",
    "  --dry-run              Preview what would be removed without deleting",
    "",
    "Pinned snapshots are never pruned.",
  ].join("\n");
}
