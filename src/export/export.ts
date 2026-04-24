import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from '../snapshot';

export type ExportFormat = 'dotenv' | 'json' | 'shell';

export function exportToDotenv(snapshot: Snapshot): string {
  const lines: string[] = [
    `# Exported from envsnap snapshot: ${snapshot.name}`,
    `# Created: ${new Date(snapshot.createdAt).toISOString()}`,
    '',
  ];
  for (const [key, value] of Object.entries(snapshot.env)) {
    const escaped = value.replace(/"/g, '\\"');
    lines.push(`${key}="${escaped}"`);
  }
  return lines.join('\n') + '\n';
}

export function exportToJson(snapshot: Snapshot): string {
  return JSON.stringify(
    {
      name: snapshot.name,
      createdAt: snapshot.createdAt,
      env: snapshot.env,
    },
    null,
    2
  );
}

export function exportToShell(snapshot: Snapshot): string {
  const lines: string[] = [
    `#!/bin/sh`,
    `# Exported from envsnap snapshot: ${snapshot.name}`,
    `# Created: ${new Date(snapshot.createdAt).toISOString()}`,
    '',
  ];
  for (const [key, value] of Object.entries(snapshot.env)) {
    const escaped = value.replace(/'/g, "'\\''" );
    lines.push(`export ${key}='${escaped}'`);
  }
  return lines.join('\n') + '\n';
}

export function exportSnapshot(
  snapshot: Snapshot,
  format: ExportFormat,
  outputPath?: string
): string {
  let content: string;
  switch (format) {
    case 'dotenv':
      content = exportToDotenv(snapshot);
      break;
    case 'json':
      content = exportToJson(snapshot);
      break;
    case 'shell':
      content = exportToShell(snapshot);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf-8');
  }

  return content;
}
