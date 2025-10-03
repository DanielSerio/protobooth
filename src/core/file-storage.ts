import fs from 'fs/promises';
import path from 'path';
import type { FileOperations } from '@/types/file-operations';

/**
 * File storage service for persisting workflow state and annotations.
 * Uses simple JSON files for data persistence (no database required).
 */
export class FileStorage implements FileOperations {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to write file:', {
        filename,
        filePath,
        storageDir: this.storageDir,
        error: errorMessage,
        fullError: error
      });
      throw new Error(`Failed to write file: ${filename} - ${errorMessage}`);
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

  /**
   * Ensure a directory exists (create if needed)
   */
  async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw new Error('Failed to create directory');
    }
  }

  /**
   * Remove a file or directory
   */
  async remove(targetPath: string): Promise<void> {
    await fs.rm(targetPath, { recursive: true, force: true });
  }
}

/**
 * Create file operations interface compatible with UI hooks
 */
export function createFileOperations(projectRoot: string): FileOperations {
  const storage = new FileStorage(projectRoot);

  return {
    readFile: (filename: string) => storage.readFile(filename),
    writeFile: (filename: string, content: string) => storage.writeFile(filename, content),
    fileExists: (filename: string) => storage.fileExists(filename),
    ensureDir: (path: string) => storage.ensureDir(path),
    remove: (path: string) => storage.remove(path)
  };
}