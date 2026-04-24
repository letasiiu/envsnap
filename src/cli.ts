#!/usr/bin/env node

/**
 * envsnap CLI entry point
 * Handles command parsing and dispatches to snapshot/diff operations
 */

import { Command } from 'commander';
import * as path from 'path';
import { captureEnv, createSnapshot, saveSnapshot, loadSnapshot, listSnapshots } from './snapshot';
import { diffSnapshots, formatDiff } from './diff';
import { getDefaultConfig, resolveStorageDir } from './config';

const program = new Command();

program
  .name('envsnap')
  .description('Snapshot, diff, and restore environment variable sets across projects')
  .version('0.1.0');

/**
 * `envsnap save <name>` — capture current environment and save as a named snapshot
 */
program
  .command('save <name>')
  .description('Save current environment variables as a named snapshot')
  .option('-d, --dir <dir>', 'Storage directory for snapshots')
  .option('--filter <prefix>', 'Only capture variables matching this prefix')
  .action(async (name: string, options: { dir?: string; filter?: string }) => {
    try {
      const config = getDefaultConfig();
      const storageDir = resolveStorageDir(options.dir ?? config.storageDir);
      const env = captureEnv(options.filter);
      const snapshot = createSnapshot(name, env);
      await saveSnapshot(snapshot, storageDir);
      console.log(`✔ Snapshot "${name}" saved (${Object.keys(env).length} variables)`);
    } catch (err) {
      console.error(`✖ Failed to save snapshot: ${(err as Error).message}`);
      process.exit(1);
    }
  });

/**
 * `envsnap list` — list all saved snapshots
 */
program
  .command('list')
  .description('List all saved snapshots')
  .option('-d, --dir <dir>', 'Storage directory for snapshots')
  .action(async (options: { dir?: string }) => {
    try {
      const config = getDefaultConfig();
      const storageDir = resolveStorageDir(options.dir ?? config.storageDir);
      const snapshots = await listSnapshots(storageDir);
      if (snapshots.length === 0) {
        console.log('No snapshots found.');
        return;
      }
      console.log('Saved snapshots:');
      for (const snap of snapshots) {
        console.log(`  • ${snap.name}  (${new Date(snap.createdAt).toLocaleString()}, ${Object.keys(snap.env).length} vars)`);
      }
    } catch (err) {
      console.error(`✖ Failed to list snapshots: ${(err as Error).message}`);
      process.exit(1);
    }
  });

/**
 * `envsnap diff <a> <b>` — show differences between two snapshots
 */
program
  .command('diff <snapshotA> <snapshotB>')
  .description('Show differences between two named snapshots')
  .option('-d, --dir <dir>', 'Storage directory for snapshots')
  .action(async (snapshotA: string, snapshotB: string, options: { dir?: string }) => {
    try {
      const config = getDefaultConfig();
      const storageDir = resolveStorageDir(options.dir ?? config.storageDir);
      const a = await loadSnapshot(snapshotA, storageDir);
      const b = await loadSnapshot(snapshotB, storageDir);
      const result = diffSnapshots(a, b);
      const output = formatDiff(result);
      if (!output.trim()) {
        console.log('No differences found between snapshots.');
      } else {
        console.log(output);
      }
    } catch (err) {
      console.error(`✖ Failed to diff snapshots: ${(err as Error).message}`);
      process.exit(1);
    }
  });

/**
 * `envsnap restore <name>` — print export statements to restore a snapshot
 */
program
  .command('restore <name>')
  .description('Print export statements to restore a snapshot into the current shell')
  .option('-d, --dir <dir>', 'Storage directory for snapshots')
  .action(async (name: string, options: { dir?: string }) => {
    try {
      const config = getDefaultConfig();
      const storageDir = resolveStorageDir(options.dir ?? config.storageDir);
      const snapshot = await loadSnapshot(name, storageDir);
      const lines = Object.entries(snapshot.env)
        .map(([key, value]) => `export ${key}=${JSON.stringify(value)}`);
      console.log(lines.join('\n'));
    } catch (err) {
      console.error(`✖ Failed to restore snapshot: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
