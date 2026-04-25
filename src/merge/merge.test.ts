import { mergeSnapshots } from './merge';
import { Snapshot } from '../snapshot/index';

function makeSnapshot(name: string, env: Record<string, string>): Snapshot {
  return {
    id: `id-${name}`,
    name,
    createdAt: '2024-01-01T00:00:00.000Z',
    env,
  };
}

describe('mergeSnapshots', () => {
  const base = makeSnapshot('base', { A: '1', B: '2', C: '3' });
  const other = makeSnapshot('other', { B: '99', C: '3', D: '4' });

  it('union strategy includes all keys and prefers other on conflict', () => {
    const result = mergeSnapshots(base, other, 'union');
    expect(result.merged.env).toEqual({ A: '1', B: '99', C: '3', D: '4' });
    expect(result.conflicts).toContain('B');
    expect(result.addedKeys).toContain('D');
  });

  it('ours strategy prefers base values on conflict', () => {
    const result = mergeSnapshots(base, other, 'ours');
    expect(result.merged.env.B).toBe('2');
    expect(result.merged.env.D).toBe('4');
  });

  it('theirs strategy prefers other values and drops base-only keys', () => {
    const result = mergeSnapshots(base, other, 'theirs');
    expect(result.merged.env.B).toBe('99');
    expect(result.merged.env.A).toBeUndefined();
    expect(result.removedKeys).toContain('A');
  });

  it('intersection strategy only keeps keys in both snapshots', () => {
    const result = mergeSnapshots(base, other, 'intersection');
    expect(Object.keys(result.merged.env)).toEqual(expect.arrayContaining(['B', 'C']));
    expect(result.merged.env.A).toBeUndefined();
    expect(result.merged.env.D).toBeUndefined();
    expect(result.removedKeys).toContain('A');
  });

  it('detects no conflicts when values are equal', () => {
    const result = mergeSnapshots(base, other, 'union');
    expect(result.conflicts).not.toContain('C');
  });

  it('merged snapshot has a generated id and combined name', () => {
    const result = mergeSnapshots(base, other, 'union');
    expect(result.merged.name).toBe('base+other');
    expect(result.merged.id).toMatch(/^merge-/);
  });
});
