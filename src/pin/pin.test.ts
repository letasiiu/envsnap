import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  getPinFilePath,
  loadPinMap,
  pinSnapshot,
  unpinSnapshot,
  resolvePin,
  listPins,
} from './pin';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-pin-test-'));
}

describe('loadPinMap', () => {
  it('returns empty object when file does not exist', () => {
    const dir = makeTmpDir();
    expect(loadPinMap(dir)).toEqual({});
  });

  it('reads existing pin map from disk', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(getPinFilePath(dir), JSON.stringify({ stable: 'snap-v1' }));
    expect(loadPinMap(dir)).toEqual({ stable: 'snap-v1' });
  });
});

describe('pinSnapshot', () => {
  it('pins a snapshot under an alias', () => {
    const dir = makeTmpDir();
    const result = pinSnapshot(dir, 'prod', 'snapshot-2024');
    expect(result.alias).toBe('prod');
    expect(result.snapshotName).toBe('snapshot-2024');
    expect(result.replaced).toBeUndefined();
    expect(loadPinMap(dir)).toEqual({ prod: 'snapshot-2024' });
  });

  it('returns replaced snapshot name when overwriting an alias', () => {
    const dir = makeTmpDir();
    pinSnapshot(dir, 'prod', 'snapshot-old');
    const result = pinSnapshot(dir, 'prod', 'snapshot-new');
    expect(result.replaced).toBe('snapshot-old');
    expect(loadPinMap(dir)['prod']).toBe('snapshot-new');
  });
});

describe('unpinSnapshot', () => {
  it('removes an existing pin alias', () => {
    const dir = makeTmpDir();
    pinSnapshot(dir, 'dev', 'snap-dev');
    const result = unpinSnapshot(dir, 'dev');
    expect(result.alias).toBe('dev');
    expect(result.snapshotName).toBe('snap-dev');
    expect(loadPinMap(dir)).toEqual({});
  });

  it('throws when alias does not exist', () => {
    const dir = makeTmpDir();
    expect(() => unpinSnapshot(dir, 'nonexistent')).toThrow(/does not exist/i);
  });
});

describe('resolvePin', () => {
  it('returns snapshot name for known alias', () => {
    const dir = makeTmpDir();
    pinSnapshot(dir, 'latest', 'snap-latest');
    expect(resolvePin(dir, 'latest')).toBe('snap-latest');
  });

  it('returns undefined for unknown alias', () => {
    const dir = makeTmpDir();
    expect(resolvePin(dir, 'unknown')).toBeUndefined();
  });
});

describe('listPins', () => {
  it('returns all pinned aliases', () => {
    const dir = makeTmpDir();
    pinSnapshot(dir, 'a', 'snap-a');
    pinSnapshot(dir, 'b', 'snap-b');
    const pins = listPins(dir);
    expect(pins).toHaveLength(2);
    expect(pins).toContainEqual({ alias: 'a', snapshotName: 'snap-a' });
    expect(pins).toContainEqual({ alias: 'b', snapshotName: 'snap-b' });
  });

  it('returns empty array when no pins exist', () => {
    const dir = makeTmpDir();
    expect(listPins(dir)).toEqual([]);
  });
});
