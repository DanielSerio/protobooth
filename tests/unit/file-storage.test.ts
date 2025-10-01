// TDD RED: Unit tests for FileStorage with new methods
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileStorage } from '@/core/file-storage';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
vi.mock('fs/promises');

describe('FileStorage', () => {
  let storage: FileStorage;
  const projectRoot = '/test/project';
  const storageDir = path.join(projectRoot, '.protobooth');

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new FileStorage(projectRoot);
  });

  describe('ensureDir', () => {
    it('should create directory recursively', async () => {
      const dirPath = '/test/screenshots';

      await storage.ensureDir(dirPath);

      expect(fs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
    });

    it('should handle directory creation errors', async () => {
      const dirPath = '/test/screenshots';
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error('Permission denied'));

      await expect(storage.ensureDir(dirPath)).rejects.toThrow('Failed to create directory');
    });
  });

  describe('remove', () => {
    it('should remove file or directory recursively', async () => {
      const targetPath = '/test/temp/file.txt';

      await storage.remove(targetPath);

      expect(fs.rm).toHaveBeenCalledWith(targetPath, { recursive: true, force: true });
    });

    it('should not throw if file does not exist (force: true)', async () => {
      const targetPath = '/test/nonexistent.txt';
      vi.mocked(fs.rm).mockResolvedValueOnce(undefined);

      await expect(storage.remove(targetPath)).resolves.not.toThrow();
    });
  });

  describe('existing methods still work', () => {
    it('should read file successfully', async () => {
      const filename = 'test.json';
      const content = '{"test": true}';
      vi.mocked(fs.readFile).mockResolvedValueOnce(content);

      const result = await storage.readFile(filename);

      expect(result).toBe(content);
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(storageDir, filename),
        'utf-8'
      );
    });

    it('should write file successfully', async () => {
      const filename = 'test.json';
      const content = '{"test": true}';
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

      await storage.writeFile(filename, content);

      expect(fs.mkdir).toHaveBeenCalledWith(storageDir, { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(storageDir, filename),
        content,
        'utf-8'
      );
    });

    it('should check if file exists', async () => {
      const filename = 'test.json';
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await storage.fileExists(filename);

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(path.join(storageDir, filename));
    });

    it('should return false if file does not exist', async () => {
      const filename = 'nonexistent.json';
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await storage.fileExists(filename);

      expect(result).toBe(false);
    });

    it('should delete file successfully', async () => {
      const filename = 'test.json';
      vi.mocked(fs.unlink).mockResolvedValueOnce(undefined);

      await storage.deleteFile(filename);

      expect(fs.unlink).toHaveBeenCalledWith(path.join(storageDir, filename));
    });

    it('should list files in storage directory', async () => {
      const files = ['file1.json', 'file2.json'];
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);
      vi.mocked(fs.readdir).mockResolvedValueOnce(files as any);

      const result = await storage.listFiles();

      expect(result).toEqual(files);
      expect(fs.readdir).toHaveBeenCalledWith(storageDir);
    });
  });

  describe('getStorageDir', () => {
    it('should return the storage directory path', () => {
      expect(storage.getStorageDir()).toBe(storageDir);
    });
  });
});
