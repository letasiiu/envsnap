import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot } from '../snapshot';
import { Snapshot } from '../snapshot';

export interface RestoreResult {
  applied: string[];
  skipped: string[];
  envFilePath: string;
}

export interface RestoreOptions {
  outputPath?: string;
  overwrite?: boolean;
  filter?: (key: string) => boolean;
}

/**
 * Serialize snapshot variables into .env file format
 */
export function serializeToEnvFile(snapshot: Snapshot): string {
  const lines: string[] = [
    `# envsnap restore: ${snapshot.name}`,
    `# captured at: ${new Date(snapshot.createdAt).toISOString()}`,
    '',
  ];

  for (const [key, value] of Object.entries(snapshot.variables)) {
    const escaped = value.replace(/"/g, '\\"');
    lines.push(`${key}="${escaped}"`);
  }

  return lines.join('\n') + '\n';
}

/**
 * Restore a snapshot by writing variables to a .env file
 */
export function restoreSnapshot(
  snapshot: Snapshot,
  options: RestoreOptions = {}
): RestoreResult {
  const outputPath = options.outputPath ?? path.join(process.cwd(), '.env');
  const overwrite = options.overwrite ?? false;
  const filter = options.filter ?? (() => true);

  const applied: string[] = [];
  const skipped: string[] = [];

  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(snapshot.variables)) {
    if (filter(key)) {
      filtered[key] = value;
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  if (!overwrite && fs.existsSync(outputPath)) {
    throw new Error(
      `File already exists at ${outputPath}. Use --overwrite to replace it.`
    );
  }

  const content = serializeToEnvFile({ ...snapshot, variables: filtered });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');

  return { applied, skipped, envFilePath: outputPath };
}

/**
 * Load a snapshot by name and restore it
 */
export function restoreSnapshotByName(
  name: string,
  storageDir: string,
  options: RestoreOptions = {}
): RestoreResult {
  const snapshot = loadSnapshot(name, storageDir);
  return restoreSnapshot(snapshot, options);
}
