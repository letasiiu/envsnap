import { DeleteResult } from "./delete";

export function formatDeleteResult(result: DeleteResult): string {
  if (!result.success) {
    return `Error: ${result.error}`;
  }

  const lines: string[] = [`✓ Deleted snapshot "${result.name}".`];

  if (result.tagsRemoved.length > 0) {
    lines.push(
      `  Tags removed: ${result.tagsRemoved.map((t) => `"${t}"`).join(", ")}`
    );
  }

  if (result.historyPruned > 0) {
    lines.push(
      `  History entries pruned: ${result.historyPruned}`
    );
  }

  return lines.join("\n");
}

export function formatDeleteError(name: string): string {
  return `Error: Snapshot "${name}" does not exist. Use 'envsnap list' to see available snapshots.`;
}

export function formatDeleteHelp(): string {
  return [
    "Usage: envsnap delete <name>",
    "",
    "Permanently removes a snapshot and cleans up associated tags and history.",
    "",
    "Options:",
    "  --force    Skip confirmation prompt",
  ].join("\n");
}
