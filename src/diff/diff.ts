import { Snapshot } from '../snapshot';

export interface DiffEntry {
  key: string;
  status: 'added' | 'removed' | 'changed';
  oldValue?: string;
  newValue?: string;
}

export interface SnapshotDiff {
  fromName: string;
  toName: string;
  entries: DiffEntry[];
  addedCount: number;
  removedCount: number;
  changedCount: number;
}

export function diffSnapshots(from: Snapshot, to: Snapshot): SnapshotDiff {
  const entries: DiffEntry[] = [];

  const fromEnv = from.env;
  const toEnv = to.env;

  const allKeys = new Set([...Object.keys(fromEnv), ...Object.keys(toEnv)]);

  for (const key of allKeys) {
    const inFrom = Object.prototype.hasOwnProperty.call(fromEnv, key);
    const inTo = Object.prototype.hasOwnProperty.call(toEnv, key);

    if (inFrom && !inTo) {
      entries.push({ key, status: 'removed', oldValue: fromEnv[key] });
    } else if (!inFrom && inTo) {
      entries.push({ key, status: 'added', newValue: toEnv[key] });
    } else if (fromEnv[key] !== toEnv[key]) {
      entries.push({ key, status: 'changed', oldValue: fromEnv[key], newValue: toEnv[key] });
    }
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    fromName: from.name,
    toName: to.name,
    entries,
    addedCount: entries.filter(e => e.status === 'added').length,
    removedCount: entries.filter(e => e.status === 'removed').length,
    changedCount: entries.filter(e => e.status === 'changed').length,
  };
}

export function formatDiff(diff: SnapshotDiff): string {
  const lines: string[] = [];
  lines.push(`Diff: ${diff.fromName} → ${diff.toName}`);
  lines.push(`  +${diff.addedCount} added, -${diff.removedCount} removed, ~${diff.changedCount} changed\n`);

  for (const entry of diff.entries) {
    if (entry.status === 'added') {
      lines.push(`  + ${entry.key}=${entry.newValue}`);
    } else if (entry.status === 'removed') {
      lines.push(`  - ${entry.key}=${entry.oldValue}`);
    } else if (entry.status === 'changed') {
      lines.push(`  ~ ${entry.key}: ${entry.oldValue} → ${entry.newValue}`);
    }
  }

  return lines.join('\n');
}
