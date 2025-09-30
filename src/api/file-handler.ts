import { FileStorage } from '@/core/file-storage';

/**
 * Handle file read request
 */
export async function handleFileRead(
  filename: string,
  projectRoot: string
): Promise<string> {
  const storage = new FileStorage(projectRoot);
  return storage.readFile(filename);
}

/**
 * Handle file write request
 */
export async function handleFileWrite(
  filename: string,
  content: string,
  projectRoot: string
): Promise<void> {
  const storage = new FileStorage(projectRoot);
  await storage.writeFile(filename, content);
}

/**
 * Handle file exists check
 */
export async function handleFileExists(
  filename: string,
  projectRoot: string
): Promise<boolean> {
  const storage = new FileStorage(projectRoot);
  return storage.fileExists(filename);
}