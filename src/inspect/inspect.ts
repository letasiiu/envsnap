import { loadSnapshot } from '../snapshot';
import type { Snapshot } from '../snapshot';

export interface InspectResult {
  snapshot: Snapshot;
  keyCount: number;
  keys: string[];
  hasValue: (key: string) => boolean;
  getValue: (key: string) => string | undefined;
}

export function inspectSnapshot(snapshot: Snapshot): InspectResult {
  const keys = Object.keys(snapshot.env).sort();
  return {
    snapshot,
    keyCount: keys.length,
    keys,
    hasValue: (key: string) => key in snapshot.env,
    getValue: (key: string) => snapshot.env[key],
  };
}

export async function inspectSnapshotByName(
  name: string,
  storageDir: string
): Promise<InspectResult> {
  const snapshot = await loadSnapshot(name, storageDir);
  if (!snapshot) {
    throw new Error(`Snapshot "${name}" not found in ${storageDir}`);
  }
  return inspectSnapshot(snapshot);
}

export function filterKeys(
  result: InspectResult,
  pattern: string
): InspectResult {
  const regex = new RegExp(pattern, 'i');
  const filteredEnv = Object.fromEntries(
    Object.entries(result.snapshot.env).filter(([k]) => regex.test(k))
  );
  const filtered: Snapshot = { ...result.snapshot, env: filteredEnv };
  return inspectSnapshot(filtered);
}
