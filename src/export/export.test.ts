import { exportToDotenv, exportToJson, exportToShell, exportSnapshot } from './export';
import { Snapshot } from '../snapshot';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function makeSnapshot(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    id: 'abc123',
    name: 'test-snap',
    createdAt: 1700000000000,
    env: { FOO: 'bar', BAZ: 'hello world', QUOTED: 'say "hi"' },
    ...overrides,
  };
}

describe('exportToDotenv', () => {
  it('includes all env keys', () => {
    const result = exportToDotenv(makeSnapshot());
    expect(result).toContain('FOO="bar"');
    expect(result).toContain('BAZ="hello world"');
  });

  it('escapes double quotes in values', () => {
    const result = exportToDotenv(makeSnapshot());
    expect(result).toContain('QUOTED="say \\"hi\\""');
  });

  it('includes snapshot name in header comment', () => {
    const result = exportToDotenv(makeSnapshot());
    expect(result).toContain('# Exported from envsnap snapshot: test-snap');
  });
});

describe('exportToJson', () => {
  it('returns valid JSON with env keys', () => {
    const result = exportToJson(makeSnapshot());
    const parsed = JSON.parse(result);
    expect(parsed.env.FOO).toBe('bar');
    expect(parsed.name).toBe('test-snap');
  });
});

describe('exportToShell', () => {
  it('uses export syntax', () => {
    const snap = makeSnapshot({ env: { PATH_VAR: '/usr/bin' } });
    const result = exportToShell(snap);
    expect(result).toContain("export PATH_VAR='/usr/bin'");
  });

  it('starts with shebang', () => {
    const result = exportToShell(makeSnapshot());
    expect(result.startsWith('#!/bin/sh')).toBe(true);
  });
});

describe('exportSnapshot', () => {
  it('writes file to disk when outputPath is provided', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-'));
    const outFile = path.join(tmpDir, 'out.env');
    exportSnapshot(makeSnapshot(), 'dotenv', outFile);
    expect(fs.existsSync(outFile)).toBe(true);
    const content = fs.readFileSync(outFile, 'utf-8');
    expect(content).toContain('FOO="bar"');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('throws on unsupported format', () => {
    expect(() => exportSnapshot(makeSnapshot(), 'xml' as any)).toThrow(
      'Unsupported export format: xml'
    );
  });
});
