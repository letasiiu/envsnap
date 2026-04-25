import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot, saveSnapshot, listSnapshots } from '../snapshot';
import { loadTagMap, saveTagMap } from '../tag';
import { recordAction } from '../history';

export interface RenameResult {
  oldName: string;
  newName: string;
  success: boolean;
  error?: string;
}

export function snapshotExists(storageDir: string, name: string): boolean {
  const snapshots = listSnapshots(storageDir);
  return snapshots.includes(name);
}

export function renameSnapshot(
  storageDir: string,
  oldName: string,
  newName: string
): RenameResult {
  if (!snapshotExists(storageDir, oldName)) {
    return { oldName, newName, success: false, error: `Snapshot "${oldName}" not found.` };
  }

  if (snapshotExists(storageDir, newName)) {
    return { oldName, newName, success: false, error: `Snapshot "${newName}" already exists.` };
  }

  if (!newName || !/^[\w\-\.]+$/.test(newName)) {
    return { oldName, newName, success: false, error: `Invalid snapshot name: "${newName}".` };
  }

  const snapshot = loadSnapshot(storageDir, oldName);
  const renamed = { ...snapshot, name: newName, updatedAt: new Date().toISOString() };
  saveSnapshot(storageDir, renamed);

  const oldFilePath = path.join(storageDir, `${oldName}.json`);
  if (fs.existsSync(oldFilePath)) {
    fs.unlinkSync(oldFilePath);
  }

  const tagMap = loadTagMap(storageDir);
  if (tagMap[oldName]) {
    tagMap[newName] = tagMap[oldName];
    delete tagMap[oldName];
    saveTagMap(storageDir, tagMap);
  }

  recordAction(storageDir, {
    action: 'rename',
    snapshotName: newName,
    timestamp: new Date().toISOString(),
    details: `Renamed from "${oldName}" to "${newName}"`
  });

  return { oldName, newName, success: true };
}
