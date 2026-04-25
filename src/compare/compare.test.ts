import { compareSnapshots, formatCompareResult } from './compare';
import { formatCompareSummary, formatCompareTable } from './formatCompare';
import type { Snapshot } from '../snapshot';

function makeSnapshot(name: string, env: Record<string, string>): Snapshot {
  return { name, env, createdAt: new Date('2024-01-01T00:00:00Z').toISOString() };
}

describe('compareSnapshots', () => {
  const base = makeSnapshot('base', { A: '1', B: '2', C: '3' });
  const updated = makeSnapshot('updated', { A: '1', B: '99', D: '4' });

  it('detects added keys', () => {
    const result = compareSnapshots(base, updated);
    expect(result.added).toEqual({ D: '4' });
  });

  it('detects removed keys', () => {
    const result = compareSnapshots(base, updated);
    expect(result.removed).toEqual({ C: '3' });
  });

  it('detects changed keys', () => {
    const result = compareSnapshots(base, updated);
    expect(result.changed).toEqual({ B: { from: '2', to: '99' } });
  });

  it('reports hasDifferences true when diffs exist', () => {
    const result = compareSnapshots(base, updated);
    expect(result.hasDifferences).toBe(true);
  });

  it('reports hasDifferences false for identical snapshots', () => {
    const result = compareSnapshots(base, makeSnapshot('copy', { A: '1', B: '2', C: '3' }));
    expect(result.hasDifferences).toBe(false);
  });

  it('includes unchanged keys when showUnchanged is true', () => {
    const result = compareSnapshots(base, updated, { showUnchanged: true });
    expect(result.unchanged).toEqual({ A: '1' });
  });

  it('excludes unchanged keys by default', () => {
    const result = compareSnapshots(base, updated);
    expect(result.unchanged).toEqual({});
  });
});

describe('formatCompareResult', () => {
  const a = makeSnapshot('snap-a', { X: 'hello', Y: 'world' });
  const b = makeSnapshot('snap-b', { X: 'hello', Z: 'new' });

  it('returns text output by default', () => {
    const result = compareSnapshots(a, b);
    const output = formatCompareResult(result);
    expect(output).toContain('snap-a');
    expect(output).toContain('snap-b');
  });

  it('returns json output when format is json', () => {
    const result = compareSnapshots(a, b);
    const output = formatCompareResult(result, { outputFormat: 'json' });
    const parsed = JSON.parse(output);
    expect(parsed.from).toBe('snap-a');
    expect(parsed.to).toBe('snap-b');
    expect(parsed.added).toEqual({ Z: 'new' });
    expect(parsed.removed).toEqual({ Y: 'world' });
  });

  it('shows no differences message for identical snapshots', () => {
    const same = makeSnapshot('same', { X: 'hello', Y: 'world' });
    const result = compareSnapshots(a, same);
    const output = formatCompareResult(result);
    expect(output).toContain('No differences found');
  });
});

describe('formatCompareSummary', () => {
  it('summarizes counts correctly', () => {
    const a = makeSnapshot('a', { A: '1', B: '2' });
    const b = makeSnapshot('b', { B: '99', C: '3' });
    const result = compareSnapshots(a, b);
    const summary = formatCompareSummary(result);
    expect(summary).toContain('Added:     1');
    expect(summary).toContain('Removed:   1');
    expect(summary).toContain('Changed:   1');
  });
});

describe('formatCompareTable', () => {
  it('renders a table with added/removed/changed rows', () => {
    const a = makeSnapshot('a', { A: '1', B: '2' });
    const b = makeSnapshot('b', { B: '99', C: '3' });
    const result = compareSnapshots(a, b);
    const table = formatCompareTable(result);
    expect(table).toContain('[+]');
    expect(table).toContain('[-]');
    expect(table).toContain('[~]');
  });

  it('shows no differences message when identical', () => {
    const a = makeSnapshot('a', { A: '1' });
    const b = makeSnapshot('b', { A: '1' });
    const result = compareSnapshots(a, b);
    const table = formatCompareTable(result);
    expect(table).toContain('no differences');
  });
});
