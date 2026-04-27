import { CopyResult } from "./copy";

export function formatCopyResult(result: CopyResult): string {
  if (result.success) {
    return `✔ Snapshot "${result.source}" copied to "${result.destination}" successfully.`;
  }
  return `✖ Copy failed: ${result.error}`;
}

export function formatCopyError(source: string, destination: string, reason: string): string {
  return `✖ Cannot copy "${source}" → "${destination}": ${reason}`;
}

export function formatCopyHelp(): string {
  return [
    "Usage: envsnap copy <source> <destination>",
    "",
    "Creates a duplicate of an existing snapshot under a new name.",
    "The source snapshot must exist and the destination name must be unused.",
  ].join("\n");
}
