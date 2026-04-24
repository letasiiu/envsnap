import * as fs from 'fs';
import * as path from 'path';
import { resolveStorageDir } from '../config';

export interface TagMap {
  [tag: string]: string[]; // tag -> list of snapshot names
}

const TAG_FILE = 'tags.json';

function getTagFilePath(storageDir?: string): string {
  const dir = storageDir ?? resolveStorageDir();
  return path.join(dir, TAG_FILE);
}

export function loadTagMap(storageDir?: string): TagMap {
  const filePath = getTagFilePath(storageDir);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as TagMap;
}

export function saveTagMap(tagMap: TagMap, storageDir?: string): void {
  const dir = storageDir ?? resolveStorageDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = getTagFilePath(storageDir);
  fs.writeFileSync(filePath, JSON.stringify(tagMap, null, 2), 'utf-8');
}

export function addTag(snapshotName: string, tag: string, storageDir?: string): TagMap {
  const tagMap = loadTagMap(storageDir);
  if (!tagMap[tag]) {
    tagMap[tag] = [];
  }
  if (!tagMap[tag].includes(snapshotName)) {
    tagMap[tag].push(snapshotName);
  }
  saveTagMap(tagMap, storageDir);
  return tagMap;
}

export function removeTag(snapshotName: string, tag: string, storageDir?: string): TagMap {
  const tagMap = loadTagMap(storageDir);
  if (!tagMap[tag]) {
    return tagMap;
  }
  tagMap[tag] = tagMap[tag].filter((name) => name !== snapshotName);
  if (tagMap[tag].length === 0) {
    delete tagMap[tag];
  }
  saveTagMap(tagMap, storageDir);
  return tagMap;
}

export function getSnapshotsByTag(tag: string, storageDir?: string): string[] {
  const tagMap = loadTagMap(storageDir);
  return tagMap[tag] ?? [];
}

export function getTagsForSnapshot(snapshotName: string, storageDir?: string): string[] {
  const tagMap = loadTagMap(storageDir);
  return Object.entries(tagMap)
    .filter(([, snapshots]) => snapshots.includes(snapshotName))
    .map(([tag]) => tag);
}

export function listAllTags(storageDir?: string): string[] {
  const tagMap = loadTagMap(storageDir);
  return Object.keys(tagMap);
}
