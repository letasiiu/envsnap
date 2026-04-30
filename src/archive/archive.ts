import * as fs from "fs";
import * as path from "path";
import { loadSnapshot, listSnapshots } from "../snapshot";
import { Snapshot } from "../snapshot";

export interface ArchiveEntry {
  name: string;
  snapshot: Snapshot;
  archivedAt: string;
}

export interface ArchiveManifest {
  version: number;
  createdAt: string;
  entries: ArchiveEntry[];
}

export function getArchiveFilePath(storageDir: string, archiveName: string): string {
  return path.join(storageDir, `${archiveName}.archive.json`);
}

export function createArchive(
  storageDir: string,
  snapshotNames: string[]
): ArchiveManifest {
  const entries: ArchiveEntry[] = snapshotNames.map((name) => {
    const snapshot = loadSnapshot(storageDir, name);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${name}`);
    }
    return {
      name,
      snapshot,
      archivedAt: new Date().toISOString(),
    };
  });

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    entries,
  };
}

export function saveArchive(
  storageDir: string,
  archiveName: string,
  manifest: ArchiveManifest
): string {
  const filePath = getArchiveFilePath(storageDir, archiveName);
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), "utf-8");
  return filePath;
}

export function loadArchive(
  storageDir: string,
  archiveName: string
): ArchiveManifest | null {
  const filePath = getArchiveFilePath(storageDir, archiveName);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ArchiveManifest;
}

export function listArchives(storageDir: string): string[] {
  if (!fs.existsSync(storageDir)) return [];
  return fs
    .readdirSync(storageDir)
    .filter((f) => f.endsWith(".archive.json"))
    .map((f) => f.replace(/\.archive\.json$/, ""));
}

export function archiveAllSnapshots(
  storageDir: string,
  archiveName: string
): ArchiveManifest {
  const names = listSnapshots(storageDir);
  if (names.length === 0) {
    throw new Error("No snapshots found to archive.");
  }
  const manifest = createArchive(storageDir, names);
  saveArchive(storageDir, archiveName, manifest);
  return manifest;
}
