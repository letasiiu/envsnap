import { searchSnapshots, formatSearchResults } from './search';
import * as snapshotModule from '../snapshot/snapshot';
import { Snapshot } from '../snapshot/snapshot';

const makeSnapshot = (id: string, env: Record<string, string>): Snapshot => ({
  id,
  createdAt: '2024-01-01T00:00:00.000Z',
  env,
});

const STORAGE_DIR = '/tmp/test-storage';

const snapshots: Snapshot[] = [
  makeSnapshot('snap-1', { NODE_ENV: 'production', API_URL: 'https://api.example.com', PORT: '3000' }),
  makeSnapshot('snap-2', { NODE_ENV: 'development', API_URL: 'https://dev.example.com', DEBUG: 'true' }),
  makeSnapshot('snap-3', { DATABASE_URL: 'postgres://localhost/db', PORT: '5432' }),
];

beforeEach(() => {
  jest.spyOn(snapshotModule, 'listSnapshots').mockResolvedValue(snapshots.map(s => s.id));
  jest.spyOn(snapshotModule, 'loadSnapshot').mockImplementation(async (id) => {
    const snap = snapshots.find(s => s.id === id);
    if (!snap) throw new Error(`Snapshot ${id} not found`);
    return snap;
  });
});

afterEach(() => jest.restoreAllMocks());

describe('searchSnapshots', () => {
  it('finds snapshots matching a key pattern', async () => {
    const results = await searchSnapshots({ key: 'API', storageDir: STORAGE_DIR });
    expect(results).toHaveLength(2);
    expect(results[0].snapshotId).toBe('snap-1');
    expect(results[0].matches).toHaveProperty('API_URL');
  });

  it('finds snapshots matching a value pattern', async () => {
    const results = await searchSnapshots({ value: 'true', storageDir: STORAGE_DIR });
    expect(results).toHaveLength(1);
    expect(results[0].snapshotId).toBe('snap-2');
  });

  it('filters by both key and value', async () => {
    const results = await searchSnapshots({ key: 'NODE_ENV', value: 'production', storageDir: STORAGE_DIR });
    expect(results).toHaveLength(1);
    expect(results[0].snapshotId).toBe('snap-1');
  });

  it('returns empty array when no matches', async () => {
    const results = await searchSnapshots({ key: 'NONEXISTENT', storageDir: STORAGE_DIR });
    expect(results).toHaveLength(0);
  });

  it('throws when neither key nor value is provided', async () => {
    await expect(searchSnapshots({ storageDir: STORAGE_DIR })).rejects.toThrow(
      'At least one of key or value must be provided'
    );
  });

  it('includes createdAt in each result', async () => {
    const results = await searchSnapshots({ key: 'PORT', storageDir: STORAGE_DIR });
    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result).toHaveProperty('createdAt');
      expect(typeof result.createdAt).toBe('string');
    });
  });
});

describe('formatSearchResults', () => {
  it('returns no-matches message for empty results', () => {
    expect(formatSearchResults([])).toBe('No matches found.');
  });

  it('formats results with snapshot id and matched vars', () => {
    const results = [{ snapshotId: 'snap-1', createdAt: '2024-01-01T00:00:00.000Z', matches: { PORT: '3000' } }];
    const output = formatSearchResults(results);
    expect(output).toContain('snap-1');
    expect(output).toContain('PORT=3000');
  });

  it('formats multiple results', () => {
    const results = [
      { snapshotId: 'snap-1', createdAt: '2024-01-01T00:00:00.000Z', matches: { A: '1' } },
      { snapshotId: 'snap-2', createdAt: '2024-01-02T00:00:00.000Z', matches: { B: '2' } },
    ];
    const output = formatSearchResults(results);
    expect(output).toContain('snap-1');
    expect(output).toContain('snap-2');
    expect(output).toContain('A=1');
    expect(output).toContain('B=2');
  });
});
