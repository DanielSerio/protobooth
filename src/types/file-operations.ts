/**
 * Shared file operations interface for dependency injection.
 * Implemented by FileStorage and used across services.
 */
export interface FileOperations {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  ensureDir(path: string): Promise<void>;
  remove(path: string): Promise<void>;
}
