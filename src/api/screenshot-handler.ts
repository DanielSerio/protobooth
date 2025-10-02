import { createServiceFactory } from '@/core/service-factory';
import type { CaptureRequest } from '@/types/screenshot';
import type { ProtoboothConfig } from '@/types/config';

// Singleton service factory instance
let serviceFactory: ReturnType<typeof createServiceFactory> | null = null;

/**
 * Close the browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (serviceFactory) {
    await serviceFactory.closeBrowser();
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
  // Create or reuse service factory
  if (!serviceFactory) {
    serviceFactory = createServiceFactory(projectRoot, config);
  }

  // Create screenshot service
  const screenshotService = await serviceFactory.createScreenshotService();

  // Capture screenshots
  const result = await screenshotService.captureRoutes(request);

  const outputDir = config.outputDir || '.protobooth/screenshots';
  return {
    screenshots: result.screenshots,
    outputDirectory: outputDir
  };
}