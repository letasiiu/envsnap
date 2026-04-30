import * as fs from "fs";
import * as path from "path";
import { loadSnapshot, saveSnapshot } from "../snapshot";
import { resolveStorageDir } from "../config";

export function snapshotExists(name: string, storageDir: string): boolean {
  const filePath = path.join(storageDir, `${name}.json`);
  return fs.existsSync(filePath);
}

export interface CloneResult {
  success: boolean;
  sourceName: string;
  targetName: string;
  keyCount: number;
  error?: string;
}

export async function cloneSnapshot(
  sourceName: string,
  targetName: string,
  storageDir?: string
): Promise<CloneResult> {
  const dir = storageDir ?? resolveStorageDir();

  if (!snapshotExists(sourceName, dir)) {
    return {
      success: false,
      sourceName,
      targetName,
      keyCount: 0,
      error: `Source snapshot "${sourceName}" does not exist.`,
    };
  }

  if (snapshotExists(targetName, dir)) {
    return {
      success: false,
      sourceName,
      targetName,
      keyCount: 0,
      error: `Target snapshot "${targetName}" already exists. Use a different name or delete it first.`,
    };
  }

  const source = await loadSnapshot(sourceName, dir);
  const cloned = {
    ...source,
    name: targetName,
    createdAt: new Date().toISOString(),
  };

  await saveSnapshot(cloned, dir);

  return {
    success: true,
    sourceName,
    targetName,
    keyCount: Object.keys(source.env).length,
  };
}
