import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  addTag,
  removeTag,
  getSnapshotsByTag,
  getTagsForSnapshot,
  listAllTags,
  loadTagMap,
} from './tag';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-tag-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('addTag', () => {
  it('creates a new tag entry', () => {
    addTag('snap-001', 'production', tmpDir);
    const tagMap = loadTagMap(tmpDir);
    expect(tagMap['production']).toContain('snap-001');
  });

  it('does not duplicate snapshot under same tag', () => {
    addTag('snap-001', 'production', tmpDir);
    addTag('snap-001', 'production', tmpDir);
    const tagMap = loadTagMap(tmpDir);
    expect(tagMap['production'].length).toBe(1);
  });

  it('supports multiple snapshots under one tag', () => {
    addTag('snap-001', 'staging', tmpDir);
    addTag('snap-002', 'staging', tmpDir);
    const tagMap = loadTagMap(tmpDir);
    expect(tagMap['staging']).toEqual(['snap-001', 'snap-002']);
  });
});

describe('removeTag', () => {
  it('removes snapshot from tag', () => {
    addTag('snap-001', 'production', tmpDir);
    removeTag('snap-001', 'production', tmpDir);
    const tagMap = loadTagMap(tmpDir);
    expect(tagMap['production']).toBeUndefined();
  });

  it('removes tag key when no snapshots remain', () => {
    addTag('snap-001', 'production', tmpDir);
    removeTag('snap-001', 'production', tmpDir);
    expect(listAllTags(tmpDir)).not.toContain('production');
  });

  it('is a no-op for non-existent tag', () => {
    expect(() => removeTag('snap-001', 'ghost', tmpDir)).not.toThrow();
  });
});

describe('getSnapshotsByTag', () => {
  it('returns snapshots for a given tag', () => {
    addTag('snap-001', 'ci', tmpDir);
    addTag('snap-002', 'ci', tmpDir);
    expect(getSnapshotsByTag('ci', tmpDir)).toEqual(['snap-001', 'snap-002']);
  });

  it('returns empty array for unknown tag', () => {
    expect(getSnapshotsByTag('unknown', tmpDir)).toEqual([]);
  });
});

describe('getTagsForSnapshot', () => {
  it('returns all tags associated with a snapshot', () => {
    addTag('snap-001', 'production', tmpDir);
    addTag('snap-001', 'stable', tmpDir);
    const tags = getTagsForSnapshot('snap-001', tmpDir);
    expect(tags).toContain('production');
    expect(tags).toContain('stable');
  });
});

describe('listAllTags', () => {
  it('returns all tag names', () => {
    addTag('snap-001', 'alpha', tmpDir);
    addTag('snap-002', 'beta', tmpDir);
    expect(listAllTags(tmpDir)).toEqual(expect.arrayContaining(['alpha', 'beta']));
  });

  it('returns empty array when no tags exist', () => {
    expect(listAllTags(tmpDir)).toEqual([]);
  });
});
