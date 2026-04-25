import type { CompareResult } from './compare';

export function formatCompareSummary(result: CompareResult): string {
  const addedCount = Object.keys(result.added).length;
  const removedCount = Object.keys(result.removed).length;
  const changedCount = Object.keys(result.changed).length;
  const unchangedCount = Object.keys(result.unchanged).length;

  const lines: string[] = [
    `Snapshot: ${result.snapshotA.name} → ${result.snapshotB.name}`,
    `  Added:     ${addedCount}`,
    `  Removed:   ${removedCount}`,
    `  Changed:   ${changedCount}`,
  ];

  if (unchangedCount > 0) {
    lines.push(`  Unchanged: ${unchangedCount}`);
  }

  if (!result.hasDifferences) {
    lines.push('  ✓ Snapshots are identical');
  }

  return lines.join('\n');
}

export function formatCompareTable(result: CompareResult): string {
  const rows: string[] = [];
  const col1 = 30;
  const col2 = 20;
  const col3 = 20;

  const header = `${'KEY'.padEnd(col1)} ${'FROM'.padEnd(col2)} ${'TO'.padEnd(col3)}`;
  const divider = '-'.repeat(col1 + col2 + col3 + 2);

  rows.push(header, divider);

  for (const key of Object.keys(result.added)) {
    rows.push(`${key.padEnd(col1)} ${'(none)'.padEnd(col2)} ${result.added[key].padEnd(col3)}  [+]`);
  }

  for (const key of Object.keys(result.removed)) {
    rows.push(`${key.padEnd(col1)} ${result.removed[key].padEnd(col2)} ${'(none)'.padEnd(col3)}  [-]`);
  }

  for (const [key, { from, to }] of Object.entries(result.changed)) {
    rows.push(`${key.padEnd(col1)} ${from.padEnd(col2)} ${to.padEnd(col3)}  [~]`);
  }

  if (rows.length === 2) {
    rows.push('(no differences)');
  }

  return rows.join('\n');
}
