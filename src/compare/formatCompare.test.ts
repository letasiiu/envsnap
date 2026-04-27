import { formatCompareSummary, formatCompareTable } from './formatCompare';
import { compareSnapshots } from './compare';
import type { Snapshot } from '../snapshot';

function makeSnapshot(name: string, env: Record<string, string>): Snapshot {
  return { name, env, createdAt: new Date('2024-06-01T00:00:00Z').toISOString() };
}

describe('formatCompareSummary', () => {
  it('includes snapshot names in header', () => {
    const a = makeSnapshot('dev', { PORT: '3000' });
    const b = makeSnapshot('prod', { PORT: '8080' });
    const result = compareSnapshots(a, b);
    const summary = formatCompareSummary(result);
    expect(summary).toContain('dev');
    expect(summary).toContain('prod');
  });

  it('shows identical message when no diffs', () => {
    const a = makeSnapshot('v1', { KEY: 'value' });
    const b = makeSnapshot('v2', { KEY: 'value' });
    const result = compareSnapshots(a, b);
    const summary = formatCompareSummary(result);
    expect(summary).toContain('identical');
  });

  it('shows unchanged count when present', () => {
    const a = makeSnapshot('a', { A: '1', B: '2' });
    const b = makeSnapshot('b', { A: '1', B: '99' });
    const result = compareSnapshots(a, b, { showUnchanged: true });
    const summary = formatCompareSummary(result);
    expect(summary).toContain('Unchanged: 1');
  });

  it('omits unchanged line when count is zero', () => {
    const a = makeSnapshot('a', { A: '1' });
    const b = makeSnapshot('b', { A: '2' });
    const result = compareSnapshots(a, b);
    const summary = formatCompareSummary(result);
    expect(summary).not.toContain('Unchanged');
  });

  it('shows counts for added, removed, and changed keys', () => {
    const a = makeSnapshot('a', { REMOVED: 'old', CHANGED: 'before' });
    const b = makeSnapshot('b', { ADDED: 'new', CHANGED: 'after' });
    const result = compareSnapshots(a, b);
    const summary = formatCompareSummary(result);
    expect(summary).toContain('Added: 1');
    expect(summary).toContain('Removed: 1');
    expect(summary).toContain('Changed: 1');
  });
});

describe('formatCompareTable', () => {
  it('includes KEY, FROM, TO headers', () => {
    const a = makeSnapshot('a', {});
    const b = makeSnapshot('b', {});
    const result = compareSnapshots(a, b);
    const table = formatCompareTable(result);
    expect(table).toContain('KEY');
    expect(table).toContain('FROM');
    expect(table).toContain('TO');
  });

  it('marks added rows with [+]', () => {
    const a = makeSnapshot('a', {});
    const b = makeSnapshot('b', { NEW_VAR: 'yes' });
    const result = compareSnapshots(a, b);
    expect(formatCompareTable(result)).toContain('[+]');
  });

  it('marks removed rows with [-]', () => {
    const a = makeSnapshot('a', { OLD_VAR: 'old' });
    const b = makeSnapshot('b', {});
    const result = compareSnapshots(a, b);
    expect(formatCompareTable(result)).toContain('[-]');
  });

  it('marks changed rows with [~]', () => {
    const a = makeSnapshot('a', { VAR: 'before' });
    const b = makeSnapshot('b', { VAR: 'after' });
    const result = compareSnapshots(a, b);
    expect(formatCompareTable(result)).toContain('[~]');
  });
});
