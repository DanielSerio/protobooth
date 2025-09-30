import fs from 'fs/promises';
import path from 'path';

/**
 * File storage service for persisting workflow state and annotations.
 * Uses simple JSON files for data persistence (no database required).
 */
export class FileStorage {
  private readonly storageDir: string;

  constructor(projectRoot: string) {
    this.storageDir = path.join(projectRoot, '.protobooth');
  }

  /**
   * Ensure the storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
      throw new Error('Failed to initialize storage directory');
    }
  }

  /**
   * Read a file from storage
   */
  async readFile(filename: string): Promise<string> {
    const filePath = path.join(this.storageDir, filename);
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File not found: ${filename}`);
      }
      throw error;
    }
  }

  /**
   * Write a file to storage
   */
  async writeFile(filename: string, content: string): Promise<void> {
    await this.ensureStorageDir();
    const filePath = path.join(this.storageDir, filename);
    try {
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      console.error('Failed to write file:', error);
      throw new Error(`Failed to write file: ${filename}`);
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    const filePath = path.join(this.storageDir, filename);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.storageDir, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * List all files in storage directory
   */
  async listFiles(): Promise<string[]> {
    try {
      const exists = await this.fileExists('.');
      if (!exists) {
        return [];
      }
      return await fs.readdir(this.storageDir);
    } catch {
      return [];
    }
  }

  /**
   * Get the storage directory path
   */
  getStorageDir(): string {
    return this.storageDir;
  }
}

/**
 * Create file operations interface compatible with UI hooks
 */
export function createFileOperations(projectRoot: string) {
  const storage = new FileStorage(projectRoot);

  return {
    readFile: (filename: string) => storage.readFile(filename),
    writeFile: (filename: string, content: string) => storage.writeFile(filename, content),
    fileExists: (filename: string) => storage.fileExists(filename)
  };
}