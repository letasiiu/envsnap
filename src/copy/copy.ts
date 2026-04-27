import * as fs from "fs";
import * as path from "path";
import { loadSnapshot, saveSnapshot } from "../snapshot";
import { resolveStorageDir } from "../config";

export function snapshotExists(storageDir: string, name: string): boolean {
  const filePath = path.join(storageDir, `${name}.json`);
  return fs.existsSync(filePath);
}

export interface CopyResult {
  success: boolean;
  source: string;
  destination: string;
  error?: string;
}

export async function copySnapshot(
  source: string,
  destination: string,
  storageDir?: string
): Promise<CopyResult> {
  const dir = storageDir ?? resolveStorageDir();

  if (!snapshotExists(dir, source)) {
    return {
      success: false,
      source,
      destination,
      error: `Source snapshot "${source}" does not exist.`,
    };
  }

  if (snapshotExists(dir, destination)) {
    return {
      success: false,
      source,
      destination,
      error: `Destination snapshot "${destination}" already exists.`,
    };
  }

  const snapshot = await loadSnapshot(source, dir);
  const copied = {
    ...snapshot,
    name: destination,
    createdAt: new Date().toISOString(),
  };

  await saveSnapshot(copied, dir);

  return { success: true, source, destination };
}
