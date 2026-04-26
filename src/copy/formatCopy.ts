import { CopyResult } from './copy';

export function formatCopyResult(result: CopyResult): string {
  if (result.success) {
    return `✔ Snapshot "${result.sourceName}" copied to "${result.destName}" successfully.`;
  }
  return `✖ Copy failed: ${result.error}`;
}

export function formatCopyError(sourceName: string, destName: string, reason: string): string {
  return `✖ Cannot copy "${sourceName}" → "${destName}": ${reason}`;
}

export function formatCopyHelp(): string {
  return [
    'Usage: envsnap copy <source> <destination>',
    '',
    'Copies an existing snapshot to a new name.',
    'The destination snapshot must not already exist.',
    '',
    'Examples:',
    '  envsnap copy production production-backup',
    '  envsnap copy staging staging-2024',
  ].join('\n');
}
