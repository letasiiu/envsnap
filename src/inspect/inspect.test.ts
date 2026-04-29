import { inspectSnapshot, filterKeys } from './inspect';
import { formatInspectTable, formatInspectSummary, formatKeyNotFound } from './formatInspect';
import type { Snapshot } from '../snapshot';

function makeSnapshot(env: Record<string, string> = {}): Snapshot {
  return {
    name: 'test-snap',
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    env,
  };
}

describe('inspectSnapshot', () => {
  it('returns sorted keys', () => {
    const snap = makeSnapshot({ Z_KEY: 'z', A_KEY: 'a', M_KEY: 'm' });
    const result = inspectSnapshot(snap);
    expect(result.keys).toEqual(['A_KEY', 'M_KEY', 'Z_KEY']);
  });

  it('reports correct keyCount', () => {
    const snap = makeSnapshot({ FOO: 'bar', BAZ: 'qux' });
    const result = inspectSnapshot(snap);
    expect(result.keyCount).toBe(2);
  });

  it('hasValue returns true for existing key', () => {
    const snap = makeSnapshot({ FOO: 'bar' });
    const result = inspectSnapshot(snap);
    expect(result.hasValue('FOO')).toBe(true);
    expect(result.hasValue('MISSING')).toBe(false);
  });

  it('getValue returns value or undefined', () => {
    const snap = makeSnapshot({ FOO: 'bar' });
    const result = inspectSnapshot(snap);
    expect(result.getValue('FOO')).toBe('bar');
    expect(result.getValue('NOPE')).toBeUndefined();
  });
});

describe('filterKeys', () => {
  it('filters keys by pattern (case-insensitive)', () => {
    const snap = makeSnapshot({ DB_HOST: 'localhost', DB_PORT: '5432', API_KEY: 'secret' });
    const result = filterKeys(inspectSnapshot(snap), 'db');
    expect(result.keys).toEqual(['DB_HOST', 'DB_PORT']);
    expect(result.keyCount).toBe(2);
  });

  it('returns empty result when no keys match', () => {
    const snap = makeSnapshot({ FOO: 'bar' });
    const result = filterKeys(inspectSnapshot(snap), 'XYZ');
    expect(result.keyCount).toBe(0);
  });
});

describe('formatInspectTable', () => {
  it('includes snapshot name and key count', () => {
    const snap = makeSnapshot({ FOO: 'bar' });
    const output = formatInspectTable(inspectSnapshot(snap));
    expect(output).toContain('test-snap');
    expect(output).toContain('1');
    expect(output).toContain('FOO');
    expect(output).toContain('bar');
  });

  it('shows (no variables) for empty snapshot', () => {
    const snap = makeSnapshot({});
    const output = formatInspectTable(inspectSnapshot(snap));
    expect(output).toContain('(no variables)');
  });

  it('truncates long values', () => {
    const longVal = 'x'.repeat(80);
    const snap = makeSnapshot({ LONG: longVal });
    const output = formatInspectTable(inspectSnapshot(snap));
    expect(output).toContain('...');
  });
});

describe('formatInspectSummary', () => {
  it('returns summary string', () => {
    const snap = makeSnapshot({ A: '1', B: '2' });
    const summary = formatInspectSummary(inspectSnapshot(snap));
    expect(summary).toBe('"test-snap" — 2 variable(s)');
  });
});

describe('formatKeyNotFound', () => {
  it('returns descriptive message', () => {
    const msg = formatKeyNotFound('MISSING_KEY', 'my-snap');
    expect(msg).toBe('Key "MISSING_KEY" not found in snapshot "my-snap".');
  });
});
