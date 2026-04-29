import type { InspectResult } from './inspect';

export function formatInspectTable(result: InspectResult): string {
  const lines: string[] = [];
  const { snapshot, keys, keyCount } = result;

  lines.push(`Snapshot : ${snapshot.name}`);
  lines.push(`Created  : ${new Date(snapshot.createdAt).toLocaleString()}`);
  lines.push(`Keys     : ${keyCount}`);
  lines.push('');

  if (keyCount === 0) {
    lines.push('  (no variables)');
    return lines.join('\n');
  }

  const maxKeyLen = Math.max(...keys.map((k) => k.length), 3);
  const header = `  ${'KEY'.padEnd(maxKeyLen)}  VALUE`;
  const divider = `  ${'-'.repeat(maxKeyLen)}  -----`;

  lines.push(header);
  lines.push(divider);

  for (const key of keys) {
    const value = snapshot.env[key];
    const displayValue = value.length > 60 ? value.slice(0, 57) + '...' : value;
    lines.push(`  ${key.padEnd(maxKeyLen)}  ${displayValue}`);
  }

  return lines.join('\n');
}

export function formatInspectSummary(result: InspectResult): string {
  return `"${result.snapshot.name}" — ${result.keyCount} variable(s)`;
}

export function formatKeyNotFound(key: string, snapshotName: string): string {
  return `Key "${key}" not found in snapshot "${snapshotName}".`;
}
