import * as path from 'path';
import * as os from 'os';

export interface EnvsnapConfig {
  /** Directory where snapshots are stored */
  storageDir: string;
  /** Default .env file path relative to cwd */
  defaultEnvFile: string;
}

const DEFAULT_STORAGE_DIR = path.join(os.homedir(), '.envsnap', 'snapshots');

export function getDefaultConfig(): EnvsnapConfig {
  return {
    storageDir:
      process.env.ENVSNAP_STORAGE_DIR ?? DEFAULT_STORAGE_DIR,
    defaultEnvFile:
      process.env.ENVSNAP_ENV_FILE ?? path.join(process.cwd(), '.env'),
  };
}

/**
 * Resolves the storage directory, preferring an explicit override,
 * then an env var, then the default home-directory path.
 */
export function resolveStorageDir(override?: string): string {
  if (override) {
    return path.resolve(override);
  }
  return getDefaultConfig().storageDir;
}
