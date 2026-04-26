import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { copySnapshot, snapshotExists } from './copy';
import { saveSnapshot } from '../snapshot';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-copy-'));
}

function makeSnapshot(name: string) {
  return {
    name,
    createdAt: new Date().toISOString(),
    env: { FOO: 'bar', BAZ: '123' },
  };
}

describe('snapshotExists', () => {
  it('returns false when snapshot file is missing', () => {
    const dir = makeTmpDir();
    expect(snapshotExists('missing', dir)).toBe(false);
  });

  it('returns true when snapshot file exists', async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot('existing'), dir);
    expect(snapshotExists('existing', dir)).toBe(true);
  });
});

describe('copySnapshot', () => {
  it('copies a snapshot to a new name', async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot('source'), dir);

    const result = await copySnapshot('source', 'dest', dir);

    expect(result.success).toBe(true);
    expect(result.sourceName).toBe('source');
    expect(result.destName).toBe('dest');
    expect(snapshotExists('dest', dir)).toBe(true);
  });

  it('returns error when source does not exist', async () => {
    const dir = makeTmpDir();
    const result = await copySnapshot('ghost', 'dest', dir);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/does not exist/);
  });

  it('returns error when destination already exists', async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot('source'), dir);
    await saveSnapshot(makeSnapshot('dest'), dir);

    const result = await copySnapshot('source', 'dest', dir);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it('preserves env vars and updates name and createdAt', async () => {
    const dir = makeTmpDir();
    const original = makeSnapshot('source');
    await saveSnapshot(original, dir);

    await copySnapshot('source', 'dest', dir);

    const destFile = path.join(dir, 'dest.json');
    const dest = JSON.parse(fs.readFileSync(destFile, 'utf-8'));

    expect(dest.name).toBe('dest');
    expect(dest.env).toEqual(original.env);
    expect(dest.createdAt).not.toBe(original.createdAt);
  });
});
