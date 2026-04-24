import { diffSnapshots, formatDiff, SnapshotDiff } from './diff';
import { Snapshot } from '../snapshot';

function makeSnapshot(name: string, env: Record<string, string>): Snapshot {
  return { name, env, createdAt: new Date().toISOString() };
}

describe('diffSnapshots', () => {
  it('detects added keys', () => {
    const from = makeSnapshot('snap-a', { FOO: 'bar' });
    const to = makeSnapshot('snap-b', { FOO: 'bar', NEW_KEY: 'value' });
    const diff = diffSnapshots(from, to);
    expect(diff.addedCount).toBe(1);
    expect(diff.entries[0]).toMatchObject({ key: 'NEW_KEY', status: 'added', newValue: 'value' });
  });

  it('detects removed keys', () => {
    const from = makeSnapshot('snap-a', { FOO: 'bar', OLD_KEY: 'old' });
    const to = makeSnapshot('snap-b', { FOO: 'bar' });
    const diff = diffSnapshots(from, to);
    expect(diff.removedCount).toBe(1);
    expect(diff.entries[0]).toMatchObject({ key: 'OLD_KEY', status: 'removed', oldValue: 'old' });
  });

  it('detects changed values', () => {
    const from = makeSnapshot('snap-a', { FOO: 'bar' });
    const to = makeSnapshot('snap-b', { FOO: 'baz' });
    const diff = diffSnapshots(from, to);
    expect(diff.changedCount).toBe(1);
    expect(diff.entries[0]).toMatchObject({ key: 'FOO', status: 'changed', oldValue: 'bar', newValue: 'baz' });
  });

  it('returns empty diff for identical snapshots', () => {
    const env = { A: '1', B: '2' };
    const diff = diffSnapshots(makeSnapshot('s1', env), makeSnapshot('s2', env));
    expect(diff.entries).toHaveLength(0);
    expect(diff.addedCount).toBe(0);
    expect(diff.removedCount).toBe(0);
    expect(diff.changedCount).toBe(0);
  });

  it('entries are sorted by key', () => {
    const from = makeSnapshot('s1', { Z: '1', A: '2' });
    const to = makeSnapshot('s2', { Z: '1' });
    const diff = diffSnapshots(from, to);
    expect(diff.entries[0].key).toBe('A');
  });
});

describe('formatDiff', () => {
  it('includes header with snapshot names and counts', () => {
    const from = makeSnapshot('dev', { FOO: 'old' });
    const to = makeSnapshot('prod', { FOO: 'new', BAR: 'added' });
    const diff = diffSnapshots(from, to);
    const output = formatDiff(diff);
    expect(output).toContain('dev → prod');
    expect(output).toContain('+1 added');
    expect(output).toContain('~1 changed');
    expect(output).toContain('+ BAR=added');
    expect(output).toContain('~ FOO: old → new');
  });
});
