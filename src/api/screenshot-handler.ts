import { chromium, Browser } from 'playwright';
import { ScreenshotCaptureService } from '@/screenshot/screenshot-capture-service';
import { FixtureManager } from '@/core/fixture-manager';
import { createFileOperations } from '@/core/file-storage';
import type { CaptureRequest } from '@/types/screenshot';
import type { ProtoboothConfig } from '@/types/config';

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance (singleton pattern)
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true });
  }
  return browserInstance;
}

/**
 * Close the browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Handle screenshot capture request
 */
export async function handleScreenshotCapture(
  request: CaptureRequest,
  config: ProtoboothConfig,
  projectRoot: string
): Promise<{
  screenshots: Array<{
    route: string;
    viewport: string;
    filePath: string;
    dimensions: { width: number; height: number };
    timestamp: Date;
  }>;
  outputDirectory?: string;
}> {
  const outputDir = config.outputDir || '.protobooth/screenshots';
  const viewports = config.viewports || [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1440, height: 900 }
  ];

  // Create file operations
  const fileOperations = createFileOperations(projectRoot);

  // Create fixture manager
  const fixtureManager = new FixtureManager(fileOperations);
  if (config.fixtures) {
    await fixtureManager.setFixtures(config.fixtures);
  }

  // Get browser instance
  const browser = await getBrowser();

  // Create screenshot service with extended file operations
  const fs = await import('fs/promises');
  const screenshotService = new ScreenshotCaptureService({
    browser,
    outputDir,
    viewports,
    fixtureManager,
    fileOperations: {
      ...fileOperations,
      ensureDir: async (path: string) => {
        await fs.mkdir(path, { recursive: true });
      },
      remove: async (path: string) => {
        await fs.rm(path, { recursive: true, force: true });
      }
    }
  });

  // Capture screenshots
  const result = await screenshotService.captureRoutes(request);

  return {
    screenshots: result.screenshots,
    outputDirectory: outputDir
  };
}