import { loadSnapshot } from '../snapshot';
import { diffSnapshots, formatDiff } from '../diff';
import type { Snapshot } from '../snapshot';

export interface CompareOptions {
  showUnchanged?: boolean;
  outputFormat?: 'text' | 'json';
}

export interface CompareResult {
  snapshotA: Snapshot;
  snapshotB: Snapshot;
  added: Record<string, string>;
  removed: Record<string, string>;
  changed: Record<string, { from: string; to: string }>;
  unchanged: Record<string, string>;
  hasDifferences: boolean;
}

export function compareSnapshots(
  snapshotA: Snapshot,
  snapshotB: Snapshot,
  options: CompareOptions = {}
): CompareResult {
  const diff = diffSnapshots(snapshotA, snapshotB);
  const unchanged: Record<string, string> = {};

  if (options.showUnchanged) {
    for (const key of Object.keys(snapshotA.env)) {
      if (!diff.added[key] && !diff.removed[key] && !diff.changed[key]) {
        unchanged[key] = snapshotA.env[key];
      }
    }
  }

  return {
    snapshotA,
    snapshotB,
    added: diff.added,
    removed: diff.removed,
    changed: diff.changed,
    unchanged,
    hasDifferences:
      Object.keys(diff.added).length > 0 ||
      Object.keys(diff.removed).length > 0 ||
      Object.keys(diff.changed).length > 0,
  };
}

export async function compareByName(
  nameA: string,
  nameB: string,
  storageDir: string,
  options: CompareOptions = {}
): Promise<CompareResult> {
  const snapshotA = await loadSnapshot(nameA, storageDir);
  const snapshotB = await loadSnapshot(nameB, storageDir);
  return compareSnapshots(snapshotA, snapshotB, options);
}

export function formatCompareResult(
  result: CompareResult,
  options: CompareOptions = {}
): string {
  if (options.outputFormat === 'json') {
    return JSON.stringify(
      {
        from: result.snapshotA.name,
        to: result.snapshotB.name,
        added: result.added,
        removed: result.removed,
        changed: result.changed,
        ...(options.showUnchanged ? { unchanged: result.unchanged } : {}),
      },
      null,
      2
    );
  }

  const diff = diffSnapshots(result.snapshotA, result.snapshotB);
  const header = `Comparing "${result.snapshotA.name}" → "${result.snapshotB.name}"\n`;
  const body = formatDiff(diff);

  if (!result.hasDifferences) {
    return `${header}No differences found.`;
  }

  let output = header + body;

  if (options.showUnchanged && Object.keys(result.unchanged).length > 0) {
    output += '\n\nUnchanged:\n';
    for (const [key, value] of Object.entries(result.unchanged)) {
      output += `  ${key}=${value}\n`;
    }
  }

  return output.trimEnd();
}
