import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot, saveSnapshot } from '../snapshot';
import { resolveStorageDir } from '../config';

export function snapshotExists(name: string, storageDir: string): boolean {
  const filePath = path.join(storageDir, `${name}.json`);
  return fs.existsSync(filePath);
}

export interface CopyResult {
  success: boolean;
  sourceName: string;
  destName: string;
  error?: string;
}

export async function copySnapshot(
  sourceName: string,
  destName: string,
  storageDir?: string
): Promise<CopyResult> {
  const dir = storageDir ?? resolveStorageDir();

  if (!snapshotExists(sourceName, dir)) {
    return {
      success: false,
      sourceName,
      destName,
      error: `Source snapshot "${sourceName}" does not exist.`,
    };
  }

  if (snapshotExists(destName, dir)) {
    return {
      success: false,
      sourceName,
      destName,
      error: `Destination snapshot "${destName}" already exists.`,
    };
  }

  const snapshot = await loadSnapshot(sourceName, dir);
  const copied = {
    ...snapshot,
    name: destName,
    createdAt: new Date().toISOString(),
  };

  await saveSnapshot(copied, dir);

  return { success: true, sourceName, destName };
}
