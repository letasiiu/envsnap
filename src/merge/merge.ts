import { Snapshot } from '../snapshot/index';

export type MergeStrategy = 'ours' | 'theirs' | 'union' | 'intersection';

export interface MergeResult {
  merged: Snapshot;
  conflicts: string[];
  addedKeys: string[];
  removedKeys: string[];
}

/**
 * Merge two snapshots using the given strategy.
 * - ours: prefer base values on conflict
 * - theirs: prefer other values on conflict
 * - union: include all keys, prefer other on conflict
 * - intersection: only include keys present in both, prefer other on conflict
 */
export function mergeSnapshots(
  base: Snapshot,
  other: Snapshot,
  strategy: MergeStrategy = 'union'
): MergeResult {
  const baseKeys = new Set(Object.keys(base.env));
  const otherKeys = new Set(Object.keys(other.env));
  const allKeys = new Set([...baseKeys, ...otherKeys]);

  const conflicts: string[] = [];
  const addedKeys: string[] = [];
  const removedKeys: string[] = [];
  const mergedEnv: Record<string, string> = {};

  for (const key of allKeys) {
    const inBase = baseKeys.has(key);
    const inOther = otherKeys.has(key);

    if (strategy === 'intersection' && !(inBase && inOther)) {
      if (inBase) removedKeys.push(key);
      continue;
    }

    if (inBase && inOther) {
      if (base.env[key] !== other.env[key]) {
        conflicts.push(key);
      }
      mergedEnv[key] = strategy === 'ours' ? base.env[key] : other.env[key];
    } else if (inBase) {
      if (strategy === 'theirs') {
        removedKeys.push(key);
      } else {
        mergedEnv[key] = base.env[key];
      }
    } else {
      addedKeys.push(key);
      mergedEnv[key] = other.env[key];
    }
  }

  const merged: Snapshot = {
    id: `merge-${Date.now()}`,
    name: `${base.name}+${other.name}`,
    createdAt: new Date().toISOString(),
    env: mergedEnv,
  };

  return { merged, conflicts, addedKeys, removedKeys };
}
