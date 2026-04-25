import { loadSnapshot, listSnapshots } from '../snapshot';
import { Snapshot } from '../snapshot/snapshot';

export interface SearchOptions {
  key?: string;
  value?: string;
  storageDir: string;
}

export interface SearchResult {
  snapshotId: string;
  createdAt: string;
  matches: Record<string, string>;
}

/**
 * Search across all snapshots for env vars matching key and/or value patterns.
 */
export async function searchSnapshots(
  options: SearchOptions
): Promise<SearchResult[]> {
  const { key, value, storageDir } = options;

  if (!key && !value) {
    throw new Error('At least one of key or value must be provided for search.');
  }

  const ids = await listSnapshots(storageDir);
  const results: SearchResult[] = [];

  for (const id of ids) {
    const snapshot = await loadSnapshot(id, storageDir);
    const matches: Record<string, string> = {};

    for (const [k, v] of Object.entries(snapshot.env)) {
      const keyMatch = key ? k.toLowerCase().includes(key.toLowerCase()) : true;
      const valueMatch = value ? v.toLowerCase().includes(value.toLowerCase()) : true;

      if (keyMatch && valueMatch) {
        matches[k] = v;
      }
    }

    if (Object.keys(matches).length > 0) {
      results.push({
        snapshotId: snapshot.id,
        createdAt: snapshot.createdAt,
        matches,
      });
    }
  }

  return results;
}

/**
 * Format search results for CLI output.
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No matches found.';
  }

  const lines: string[] = [];

  for (const result of results) {
    lines.push(`Snapshot: ${result.snapshotId}  (${result.createdAt})`);
    for (const [k, v] of Object.entries(result.matches)) {
      lines.push(`  ${k}=${v}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
