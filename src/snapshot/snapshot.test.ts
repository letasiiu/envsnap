import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  captureEnv,
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
} from './snapshot';

const TMP_DIR = path.join(os.tmpdir(), 'envsnap-test-' + Date.now());

afterAll(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe('captureEnv', () => {
  it('reads variables from a .env file', () => {
    const envFile = path.join(TMP_DIR, '.env');
    fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.writeFileSync(envFile, 'FOO=bar\nBAZ=qux\n');
    const env = captureEnv(envFile);
    expect(env).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('throws when env file does not exist', () => {
    expect(() => captureEnv('/nonexistent/.env')).toThrow('Env file not found');
  });

  it('captures from process.env when no file is given', () => {
    process.env.ENVSNAP_TEST_VAR = 'hello';
    const env = captureEnv();
    expect(env['ENVSNAP_TEST_VAR']).toBe('hello');
    delete process.env.ENVSNAP_TEST_VAR;
  });
});

describe('createSnapshot', () => {
  it('creates a snapshot with correct shape', () => {
    const envFile = path.join(TMP_DIR, '.env');
    fs.writeFileSync(envFile, 'KEY=value\n');
    const snap = createSnapshot('test-snap', envFile);
    expect(snap.name).toBe('test-snap');
    expect(snap.env).toEqual({ KEY: 'value' });
    expect(snap.createdAt).toBeTruthy();
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot to disk', () => {
    const snap = { name: 'mysnap', createdAt: new Date().toISOString(), env: { A: '1' } };
    const savedPath = saveSnapshot(snap, TMP_DIR);
    expect(fs.existsSync(savedPath)).toBe(true);
    const loaded = loadSnapshot('mysnap', TMP_DIR);
    expect(loaded).toEqual(snap);
  });

  it('throws when loading a non-existent snapshot', () => {
    expect(() => loadSnapshot('ghost', TMP_DIR)).toThrow("Snapshot 'ghost' not found");
  });
});

describe('listSnapshots', () => {
  it('returns empty array when dir does not exist', () => {
    expect(listSnapshots('/no/such/dir')).toEqual([]);
  });

  it('lists saved snapshot names', () => {
    const names = listSnapshots(TMP_DIR);
    expect(names).toContain('mysnap');
  });
});
