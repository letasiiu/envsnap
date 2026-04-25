import { formatMergeSummary, listMergeStrategies } from './formatMerge';
import { MergeResult } from './merge';
import { Snapshot } from '../snapshot/index';

function makeResult(overrides: Partial<MergeResult> = {}): MergeResult {
  const merged: Snapshot = {
    id: 'merge-123',
    name: 'base+other',
    createdAt: '2024-01-01T00:00:00.000Z',
    env: { A: '1', B: '99', D: '4' },
  };
  return {
    merged,
    conflicts: ['B'],
    addedKeys: ['D'],
    removedKeys: [],
    ...overrides,
  };
}

describe('formatMergeSummary', () => {
  it('includes strategy in output', () => {
    const output = formatMergeSummary(makeResult(), 'union');
    expect(output).toContain('union');
  });

  it('lists added keys', () => {
    const output = formatMergeSummary(makeResult(), 'union');
    expect(output).toContain('+ D');
  });

  it('lists conflicting keys', () => {
    const output = formatMergeSummary(makeResult(), 'union');
    expect(output).toContain('~ B');
  });

  it('shows no conflicts message when empty', () => {
    const output = formatMergeSummary(makeResult({ conflicts: [] }), 'ours');
    expect(output).toContain('No conflicts.');
  });

  it('lists removed keys', () => {
    const result = makeResult({ removedKeys: ['C'] });
    const output = formatMergeSummary(result, 'theirs');
    expect(output).toContain('- C');
  });
});

describe('listMergeStrategies', () => {
  it('lists all four strategies', () => {
    const output = listMergeStrategies();
    expect(output).toContain('ours');
    expect(output).toContain('theirs');
    expect(output).toContain('union');
    expect(output).toContain('intersection');
  });
});
