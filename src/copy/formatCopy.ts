import type { CopyResult } from "./copy";

export function formatCopyResult(result: CopyResult): string {
  if (!result.success) {
    return `✗ Copy failed: ${result.error}`;
  }
  return `✓ Snapshot "${result.sourceName}" copied to "${result.destName}" successfully.`;
}

export function formatCopyError(sourceName: string, destName: string, error: string): string {
  return `✗ Could not copy "${sourceName}" → "${destName}": ${error}`;
}

export function formatCopyHelp(): string {
  return [
    "Usage: envsnap copy <source> <destination>",
    "",
    "Creates a duplicate of an existing snapshot under a new name.",
    "",
    "Arguments:",
    "  source       Name of the snapshot to copy",
    "  destination  Name for the new snapshot copy",
    "",
    "Notes:",
    "  - The destination snapshot must not already exist.",
    "  - The copy receives a new createdAt timestamp.",
  ].join("\n");
}
