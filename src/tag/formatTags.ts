import { TagMap } from './tag';

/**
 * Formats a TagMap into a human-readable table string.
 */
export function formatTagTable(tagMap: TagMap): string {
  const tags = Object.keys(tagMap);
  if (tags.length === 0) {
    return 'No tags found.';
  }

  const lines: string[] = ['Tags:', ''];
  const maxTagLen = Math.max(...tags.map((t) => t.length), 3);

  lines.push(`  ${'TAG'.padEnd(maxTagLen)}  SNAPSHOTS`);
  lines.push(`  ${'─'.repeat(maxTagLen)}  ${'─'.repeat(30)}`);

  for (const tag of tags.sort()) {
    const snapshots = tagMap[tag];
    lines.push(`  ${tag.padEnd(maxTagLen)}  ${snapshots.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Formats the list of tags attached to a single snapshot.
 */
export function formatSnapshotTags(snapshotName: string, tags: string[]): string {
  if (tags.length === 0) {
    return `Snapshot "${snapshotName}" has no tags.`;
  }
  return `Tags for "${snapshotName}": ${tags.join(', ')}`;
}
