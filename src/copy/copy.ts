import * as fs from "fs";
import * as path from "path";
import { loadSnapshot, saveSnapshot } from "../snapshot";
import type { Snapshot } from "../snapshot";

export interface CopyResult {
  success: boolean;
  sourceName: string;
  destName: string;
  error?: string;
}

export function snapshotExists(storageDir: string, name: string): boolean {
  const filePath = path.join(storageDir, `${name}.json`);
  return fs.existsSync(filePath);
}

export async function copySnapshot(
  storageDir: string,
  sourceName: string,
  destName: string
): Promise<CopyResult> {
  if (!snapshotExists(storageDir, sourceName)) {
    return {
      success: false,
      sourceName,
      destName,
      error: `Source snapshot "${sourceName}" does not exist.`,
    };
  }

  if (snapshotExists(storageDir, destName)) {
    return {
      success: false,
      sourceName,
      destName,
      error: `Destination snapshot "${destName}" already exists.`,
    };
  }

  const source: Snapshot = await loadSnapshot(storageDir, sourceName);

  const copy: Snapshot = {
    ...source,
    name: destName,
    createdAt: new Date().toISOString(),
  };

  await saveSnapshot(storageDir, copy);

  return { success: true, sourceName, destName };
}
