import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { renameSnapshot, snapshotExists } from './rename';
import { createSnapshot, saveSnapshot } from '../snapshot';
import { addTag, loadTagMap } from '../tag';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-rename-'));
}

function makeSnapshot(name: string, env: Record<string, string> = {}) {
  return createSnapshot(name, env);
}

describe('renameSnapshot', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('renames a snapshot successfully', () => {
    const snap = makeSnapshot('old-snap', { FOO: 'bar' });
    saveSnapshot(tmpDir, snap);

    const result = renameSnapshot(tmpDir, 'old-snap', 'new-snap');

    expect(result.success).toBe(true);
    expect(result.oldName).toBe('old-snap');
    expect(result.newName).toBe('new-snap');
    expect(snapshotExists(tmpDir, 'new-snap')).toBe(true);
    expect(snapshotExists(tmpDir, 'old-snap')).toBe(false);
  });

  it('returns error if old snapshot does not exist', () => {
    const result = renameSnapshot(tmpDir, 'ghost', 'new-name');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/);
  });

  it('returns error if new name already exists', () => {
    const snap1 = makeSnapshot('snap1', { A: '1' });
    const snap2 = makeSnapshot('snap2', { B: '2' });
    saveSnapshot(tmpDir, snap1);
    saveSnapshot(tmpDir, snap2);

    const result = renameSnapshot(tmpDir, 'snap1', 'snap2');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it('returns error for invalid new name', () => {
    const snap = makeSnapshot('valid-name', {});
    saveSnapshot(tmpDir, snap);

    const result = renameSnapshot(tmpDir, 'valid-name', 'bad name!');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid snapshot name/);
  });

  it('migrates tags to the new name', () => {
    const snap = makeSnapshot('tagged-snap', { X: 'y' });
    saveSnapshot(tmpDir, snap);
    addTag(tmpDir, 'tagged-snap', 'production');

    renameSnapshot(tmpDir, 'tagged-snap', 'renamed-snap');

    const tagMap = loadTagMap(tmpDir);
    expect(tagMap['renamed-snap']).toContain('production');
    expect(tagMap['tagged-snap']).toBeUndefined();
  });
});
