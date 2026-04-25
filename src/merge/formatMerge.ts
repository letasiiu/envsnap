import { MergeResult, MergeStrategy } from './merge';

export function formatMergeSummary(
  result: MergeResult,
  strategy: MergeStrategy
): string {
  const lines: string[] = [];

  lines.push(`Merge strategy: ${strategy}`);
  lines.push(
    `Result: ${Object.keys(result.merged.env).length} keys in merged snapshot`
  );

  if (result.addedKeys.length > 0) {
    lines.push(`\nAdded keys (${result.addedKeys.length}):`);
    for (const key of result.addedKeys) {
      lines.push(`  + ${key}`);
    }
  }

  if (result.removedKeys.length > 0) {
    lines.push(`\nRemoved keys (${result.removedKeys.length}):`);
    for (const key of result.removedKeys) {
      lines.push(`  - ${key}`);
    }
  }

  if (result.conflicts.length > 0) {
    lines.push(`\nConflicts resolved (${result.conflicts.length}):`);
    for (const key of result.conflicts) {
      lines.push(`  ~ ${key}`);
    }
  } else {
    lines.push('\nNo conflicts.');
  }

  return lines.join('\n');
}

export function listMergeStrategies(): string {
  return [
    'Available merge strategies:',
    '  ours         - keep base snapshot values on conflict',
    '  theirs       - keep other snapshot values on conflict',
    '  union        - include all keys, prefer other on conflict (default)',
    '  intersection - only include keys present in both snapshots',
  ].join('\n');
}
