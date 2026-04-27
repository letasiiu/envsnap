import * as fs from "fs";
import * as path from "path";
import { loadTagMap, saveTagMap } from "../tag/tag";
import { loadHistory, saveHistory } from "../history/history";

export function snapshotExists(storageDir: string, name: string): boolean {
  const filePath = path.join(storageDir, `${name}.json`);
  return fs.existsSync(filePath);
}

export interface DeleteResult {
  success: boolean;
  name: string;
  tagsRemoved: string[];
  historyPruned: number;
  error?: string;
}

export function deleteSnapshot(
  storageDir: string,
  name: string
): DeleteResult {
  if (!snapshotExists(storageDir, name)) {
    return {
      success: false,
      name,
      tagsRemoved: [],
      historyPruned: 0,
      error: `Snapshot "${name}" does not exist.`,
    };
  }

  const filePath = path.join(storageDir, `${name}.json`);
  fs.unlinkSync(filePath);

  // Remove tags referencing this snapshot
  const tagMap = loadTagMap(storageDir);
  const tagsRemoved: string[] = [];
  for (const [tag, snapName] of Object.entries(tagMap)) {
    if (snapName === name) {
      tagsRemoved.push(tag);
      delete tagMap[tag];
    }
  }
  if (tagsRemoved.length > 0) {
    saveTagMap(storageDir, tagMap);
  }

  // Prune history entries for this snapshot
  const history = loadHistory(storageDir);
  const before = history.length;
  const pruned = history.filter((entry) => entry.snapshotName !== name);
  const historyPruned = before - pruned.length;
  if (historyPruned > 0) {
    saveHistory(storageDir, pruned);
  }

  return { success: true, name, tagsRemoved, historyPruned };
}
