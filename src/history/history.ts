import * as fs from "fs";
import * as path from "path";
import { resolveStorageDir } from "../config";

export interface HistoryEntry {
  snapshotId: string;
  name: string;
  action: "created" | "restored" | "deleted" | "tagged";
  timestamp: string;
  meta?: Record<string, string>;
}

const HISTORY_FILE = "history.json";

export function getHistoryFilePath(storageDir?: string): string {
  const dir = storageDir ?? resolveStorageDir();
  return path.join(dir, HISTORY_FILE);
}

export function loadHistory(storageDir?: string): HistoryEntry[] {
  const filePath = getHistoryFilePath(storageDir);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as HistoryEntry[];
}

export function saveHistory(entries: HistoryEntry[], storageDir?: string): void {
  const filePath = getHistoryFilePath(storageDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf-8");
}

export function recordAction(
  snapshotId: string,
  name: string,
  action: HistoryEntry["action"],
  meta?: Record<string, string>,
  storageDir?: string
): HistoryEntry {
  const entries = loadHistory(storageDir);
  const entry: HistoryEntry = {
    snapshotId,
    name,
    action,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
  entries.push(entry);
  saveHistory(entries, storageDir);
  return entry;
}

export function getHistoryForSnapshot(
  snapshotId: string,
  storageDir?: string
): HistoryEntry[] {
  return loadHistory(storageDir).filter((e) => e.snapshotId === snapshotId);
}

export function clearHistory(storageDir?: string): void {
  saveHistory([], storageDir);
}
