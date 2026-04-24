import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { serializeToEnvFile, restoreSnapshot, restoreSnapshotByName } from './restore';
import { Snapshot } from '../snapshot';
import { saveSnapshot } from '../snapshot';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    name: 'test-snap',
    createdAt: 1700000000000,
    variables: { FOO: 'bar', BAZ: 'qux' },
    ...overrides,
  };
}

describe('serializeToEnvFile', () => {
  it('should include all variables', () => {
    const snap = makeSnapshot();
    const output = serializeToEnvFile(snap);
    expect(output).toContain('FOO="bar"');
    expect(output).toContain('BAZ="qux"');
  });

  it('should include snapshot name in header comment', () => {
    const snap = makeSnapshot({ name: 'my-snap' });
    const output = serializeToEnvFile(snap);
    expect(output).toContain('# envsnap restore: my-snap');
  });

  it('should escape double quotes in values', () => {
    const snap = makeSnapshot({ variables: { KEY: 'say "hello"' } });
    const output = serializeToEnvFile(snap);
    expect(output).toContain('KEY="say \\"hello\\""');
  });
});

describe('restoreSnapshot', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-restore-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should write .env file with snapshot variables', () => {
    const snap = makeSnapshot();
    const outputPath = path.join(tmpDir, '.env');
    const result = restoreSnapshot(snap, { outputPath });
    expect(result.applied).toEqual(expect.arrayContaining(['FOO', 'BAZ']));
    expect(fs.existsSync(outputPath)).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(content).toContain('FOO="bar"');
  });

  it('should throw if file exists and overwrite is false', () => {
    const snap = makeSnapshot();
    const outputPath = path.join(tmpDir, '.env');
    fs.writeFileSync(outputPath, 'existing content');
    expect(() => restoreSnapshot(snap, { outputPath })).toThrow(/already exists/);
  });

  it('should overwrite if overwrite option is true', () => {
    const snap = makeSnapshot();
    const outputPath = path.join(tmpDir, '.env');
    fs.writeFileSync(outputPath, 'existing content');
    expect(() => restoreSnapshot(snap, { outputPath, overwrite: true })).not.toThrow();
  });

  it('should skip variables excluded by filter', () => {
    const snap = makeSnapshot();
    const outputPath = path.join(tmpDir, '.env');
    const result = restoreSnapshot(snap, {
      outputPath,
      filter: (key) => key !== 'BAZ',
    });
    expect(result.applied).toContain('FOO');
    expect(result.skipped).toContain('BAZ');
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(content).not.toContain('BAZ');
  });
});
