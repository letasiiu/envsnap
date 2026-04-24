import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export interface Snapshot {
  name: string;
  createdAt: string;
  env: Record<string, string>;
}

export function captureEnv(envFilePath?: string): Record<string, string> {
  if (envFilePath) {
    const resolved = path.resolve(envFilePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Env file not found: ${resolved}`);
    }
    const parsed = dotenv.parse(fs.readFileSync(resolved));
    return parsed;
  }
  // Capture from process.env, excluding internal Node/system vars
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      env[key] = value;
    }
  }
  return env;
}

export function createSnapshot(name: string, envFilePath?: string): Snapshot {
  const env = captureEnv(envFilePath);
  return {
    name,
    createdAt: new Date().toISOString(),
    env,
  };
}

export function saveSnapshot(snapshot: Snapshot, storageDir: string): string {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  const filePath = path.join(storageDir, `${snapshot.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filePath;
}

export function loadSnapshot(name: string, storageDir: string): Snapshot {
  const filePath = path.join(storageDir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot '${name}' not found in ${storageDir}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Snapshot;
}

export function listSnapshots(storageDir: string): string[] {
  if (!fs.existsSync(storageDir)) {
    return [];
  }
  return fs
    .readdirSync(storageDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}
