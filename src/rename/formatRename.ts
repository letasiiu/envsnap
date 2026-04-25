import { RenameResult } from './rename';

export function formatRenameResult(result: RenameResult): string {
  if (!result.success) {
    return `✗ Rename failed: ${result.error}`;
  }
  return `✓ Snapshot renamed: "${result.oldName}" → "${result.newName}"`;
}

export function formatRenameError(oldName: string, newName: string, error: string): string {
  return `✗ Could not rename "${oldName}" to "${newName}": ${error}`;
}

export function formatRenameHelp(): string {
  const lines = [
    'Usage: envsnap rename <old-name> <new-name>',
    '',
    'Renames an existing snapshot and updates all associated tags.',
    '',
    'Arguments:',
    '  old-name   The current name of the snapshot',
    '  new-name   The desired new name (alphanumeric, hyphens, dots, underscores)',
    '',
    'Notes:',
    '  - Tags associated with the old name are transferred to the new name.',
    '  - The rename action is recorded in history.',
  ];
  return lines.join('\n');
}
