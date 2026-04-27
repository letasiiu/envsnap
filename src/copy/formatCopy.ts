import type { CopyResult } from './copy';

export function formatCopyResult(result: CopyResult): string {
  if (result.success) {
    return `✔ Snapshot "${result.sourceName}" copied to "${result.destName}" successfully.`;
  }
  return `✖ Copy failed: ${result.error}`;
}

export function formatCopyError(message: string): string {
  return `✖ Error: ${message}`;
}

export function formatCopyHelp(): string {
  return [
    'Usage: envsnap copy <source> <destination>',
    '',
    'Copy an existing snapshot to a new name.',
    '',
    'Arguments:',
    '  source       Name of the snapshot to copy',
    '  destination  Name for the new snapshot copy',
    '',
    'Examples:',
    '  envsnap copy production production-backup',
    '  envsnap copy staging staging-2024',
  ].join('\n');
}
