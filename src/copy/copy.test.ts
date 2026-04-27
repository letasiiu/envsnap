import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { copySnapshot, snapshotExists } from './copy';
import { saveSnapshot } from '../snapshot';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-copy-test-'));
}

function makeSnapshot(name: string) {
  return {
    name,
    createdAt: '2024-01-01T00:00:00.000Z',
    env: { FOO: 'bar', BAZ: '42' },
  };
}

describe('snapshotExists', () => {
  it('returns true when snapshot file exists', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'mysnap.json'), JSON.stringify(makeSnapshot('mysnap')));
    expect(snapshotExists('mysnap', dir)).toBe(true);
  });

  it('returns false when snapshot file does not exist', () => {
    const dir = makeTmpDir();
    expect(snapshotExists('missing', dir)).toBe(false);
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
    expect(snapshotExists('source', dir)).toBe(true);
  });

  it('returns error when source does not exist', async () => {
    const dir = makeTmpDir();
    const result = await copySnapshot('nonexistent', 'dest', dir);

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

  it('copied snapshot has updated name and createdAt', async () => {
    const dir = makeTmpDir();
    await saveSnapshot(makeSnapshot('source'), dir);

    await copySnapshot('source', 'dest', dir);

    const raw = fs.readFileSync(path.join(dir, 'dest.json'), 'utf-8');
    const copied = JSON.parse(raw);
    expect(copied.name).toBe('dest');
    expect(copied.createdAt).not.toBe('2024-01-01T00:00:00.000Z');
    expect(copied.env).toEqual({ FOO: 'bar', BAZ: '42' });
  });
});
