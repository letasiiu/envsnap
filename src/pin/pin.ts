import * as fs from 'fs';
import * as path from 'path';

export interface PinMap {
  [alias: string]: string; // alias -> snapshot name
}

export function getPinFilePath(storageDir: string): string {
  return path.join(storageDir, '.pins.json');
}

export function loadPinMap(storageDir: string): PinMap {
  const filePath = getPinFilePath(storageDir);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as PinMap;
}

export function savePinMap(storageDir: string, pins: PinMap): void {
  const filePath = getPinFilePath(storageDir);
  fs.writeFileSync(filePath, JSON.stringify(pins, null, 2), 'utf-8');
}

export function pinSnapshot(
  storageDir: string,
  alias: string,
  snapshotName: string
): { alias: string; snapshotName: string; replaced?: string } {
  const pins = loadPinMap(storageDir);
  const replaced = pins[alias];
  pins[alias] = snapshotName;
  savePinMap(storageDir, pins);
  return { alias, snapshotName, replaced };
}

export function unpinSnapshot(
  storageDir: string,
  alias: string
): { alias: string; snapshotName: string } {
  const pins = loadPinMap(storageDir);
  if (!(alias in pins)) {
    throw new Error(`Pin alias "${alias}" does not exist.`);
  }
  const snapshotName = pins[alias];
  delete pins[alias];
  savePinMap(storageDir, pins);
  return { alias, snapshotName };
}

export function resolvePin(storageDir: string, alias: string): string | undefined {
  const pins = loadPinMap(storageDir);
  return pins[alias];
}

export function listPins(storageDir: string): Array<{ alias: string; snapshotName: string }> {
  const pins = loadPinMap(storageDir);
  return Object.entries(pins).map(([alias, snapshotName]) => ({ alias, snapshotName }));
}
