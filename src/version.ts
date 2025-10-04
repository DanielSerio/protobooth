/**
 * Version constant - automatically updated from package.json during build
 */
import packageJson from '../package.json';

export const VERSION = packageJson.version;
export const MAJOR_VERSION = parseInt(VERSION.split('.')[0]);
export const MINOR_VERSION = parseInt(VERSION.split('.')[1]);
export const PATCH_VERSION = parseInt(VERSION.split('.')[2].split('-')[0]);
export const IS_PRERELEASE = VERSION.includes('-');

/**
 * Checks if a data version is compatible with the current version
 * @param dataVersion - Version string from .protobooth data files
 * @returns true if compatible, false otherwise
 */
export function isCompatibleVersion(dataVersion: string): boolean {
  const dataMajor = parseInt(dataVersion.split('.')[0]);
  return dataMajor === MAJOR_VERSION;
}

/**
 * Gets a user-friendly error message for version mismatches
 * @param dataVersion - Version string from .protobooth data files
 * @returns Error message with migration instructions
 */
export function getVersionMismatchMessage(dataVersion: string): string {
  return (
    `Version mismatch detected!\n\n` +
    `Your .protobooth data was created with v${dataVersion}, ` +
    `but you're using protobooth v${VERSION}.\n\n` +
    `This may cause compatibility issues. Options:\n` +
    `1. Run 'npx protobooth cleanup' and start fresh\n` +
    `2. Install the matching version: npm install protobooth@${dataVersion}\n\n` +
    `For major version changes, see migration guide at:\n` +
    `https://github.com/anthropics/protobooth/blob/main/VERSIONING.md`
  );
}
