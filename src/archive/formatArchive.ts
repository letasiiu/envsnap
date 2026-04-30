import { ArchiveManifest, ArchiveEntry } from "./archive";

export function formatArchiveSummary(
  archiveName: string,
  manifest: ArchiveManifest,
  filePath: string
): string {
  const lines: string[] = [
    `Archive: ${archiveName}`,
    `Created: ${manifest.createdAt}`,
    `Snapshots archived: ${manifest.entries.length}`,
    `Saved to: ${filePath}`,
  ];
  return lines.join("\n");
}

export function formatArchiveTable(manifest: ArchiveManifest): string {
  if (manifest.entries.length === 0) {
    return "(no entries)";
  }

  const header = `  ${ "Name".padEnd(30)} ${ "Keys".padEnd(6)} Archived At`;
  const divider = "  " + "-".repeat(60);
  const rows = manifest.entries.map((entry: ArchiveEntry) => {
    const keyCount = Object.keys(entry.snapshot.env).length;
    return `  ${entry.name.padEnd(30)} ${String(keyCount).padEnd(6)} ${entry.archivedAt}`;
  });

  return [header, divider, ...rows].join("\n");
}

export function formatArchiveList(archiveNames: string[]): string {
  if (archiveNames.length === 0) {
    return "No archives found.";
  }
  return archiveNames.map((name, i) => `  ${i + 1}. ${name}`).join("\n");
}

export function formatArchiveError(archiveName: string, reason: string): string {
  return `Error archiving "${archiveName}": ${reason}`;
}

export function formatRestoreFromArchiveResult(
  archiveName: string,
  restoredNames: string[]
): string {
  const lines = [
    `Restored ${restoredNames.length} snapshot(s) from archive "${archiveName}":`,
    ...restoredNames.map((n) => `  - ${n}`),
  ];
  return lines.join("\n");
}
