import { formatTagTable, formatSnapshotTags } from './formatTags';
import { TagMap } from './tag';

describe('formatTagTable', () => {
  it('returns a message when no tags exist', () => {
    const result = formatTagTable({});
    expect(result).toBe('No tags found.');
  });

  it('includes tag names in output', () => {
    const tagMap: TagMap = {
      production: ['snap-001', 'snap-002'],
      staging: ['snap-003'],
    };
    const result = formatTagTable(tagMap);
    expect(result).toContain('production');
    expect(result).toContain('staging');
  });

  it('includes snapshot names in output', () => {
    const tagMap: TagMap = {
      ci: ['snap-alpha', 'snap-beta'],
    };
    const result = formatTagTable(tagMap);
    expect(result).toContain('snap-alpha');
    expect(result).toContain('snap-beta');
  });

  it('sorts tags alphabetically', () => {
    const tagMap: TagMap = {
      zebra: ['snap-z'],
      alpha: ['snap-a'],
    };
    const result = formatTagTable(tagMap);
    const alphaIdx = result.indexOf('alpha');
    const zebraIdx = result.indexOf('zebra');
    expect(alphaIdx).toBeLessThan(zebraIdx);
  });
});

describe('formatSnapshotTags', () => {
  it('returns a message when snapshot has no tags', () => {
    const result = formatSnapshotTags('snap-001', []);
    expect(result).toContain('no tags');
    expect(result).toContain('snap-001');
  });

  it('lists tags for a snapshot', () => {
    const result = formatSnapshotTags('snap-001', ['production', 'stable']);
    expect(result).toContain('production');
    expect(result).toContain('stable');
    expect(result).toContain('snap-001');
  });
});
