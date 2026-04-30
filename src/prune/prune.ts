import * as fs from "fs";
import * as path from "path";
import { listSnapshots, loadSnapshot } from "../snapshot";
import { loadPinMap } from "../pin";

export interface PruneOptions {
  keepLast?: number;
  olderThanDays?: number;
  dryRun?: boolean;
}

export interface PruneResult {
  removed: string[];
  kept: string[];
  pinned: string[];
  dryRun: boolean;
}

export async function pruneSnapshots(
  storageDir: string,
  options: PruneOptions = {}
): Promise<PruneResult> {
  const { keepLast, olderThanDays, dryRun = false } = options;
  const allNames = await listSnapshots(storageDir);
  const pinMap = await loadPinMap(storageDir);
  const pinnedNames = new Set(Object.keys(pinMap));

  const snapshots = await Promise.all(
    allNames.map(async (name) => {
      const snap = await loadSnapshot(storageDir, name);
      return { name, createdAt: snap?.createdAt ?? 0 };
    })
  );

  snapshots.sort((a, b) => b.createdAt - a.createdAt);

  const cutoffMs =
    olderThanDays !== undefined
      ? Date.now() - olderThanDays * 24 * 60 * 60 * 1000
      : null;

  const toRemove: string[] = [];
  const toKeep: string[] = [];
  const pinned: string[] = [];

  snapshots.forEach((snap, index) => {
    if (pinnedNames.has(snap.name)) {
      pinned.push(snap.name);
      return;
    }
    const tooOld = cutoffMs !== null && snap.createdAt < cutoffMs;
    const beyondKeep = keepLast !== undefined && index >= keepLast;
    if (tooOld || beyondKeep) {
      toRemove.push(snap.name);
    } else {
      toKeep.push(snap.name);
    }
  });

  if (!dryRun) {
    for (const name of toRemove) {
      const filePath = path.join(storageDir, `${name}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  return { removed: toRemove, kept: toKeep, pinned, dryRun };
}
