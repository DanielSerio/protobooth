import { chromium, Browser } from 'playwright';
import { FileStorage, createFileOperations } from './file-storage';
import { FixtureManager } from './fixture-manager';
import { ScreenshotCaptureService } from '@/screenshot/screenshot-capture-service';
import type { ProtoboothConfig } from '@/types/config';
import type { FileOperations } from '@/types/file-operations';
import type { ViewportConfig } from '@/types/screenshot';

/**
 * Factory for creating fully configured service instances.
 * Handles dependency injection and service wiring from plugin configuration.
 */
export class ServiceFactory {
  private fileOperations: FileOperations;
  private fixtureManager: FixtureManager;
  private browserInstance: Browser | null = null;

  constructor(
    private readonly projectRoot: string,
    private readonly config: ProtoboothConfig
  ) {
    // Create file operations
    this.fileOperations = createFileOperations(projectRoot);

    // Create fixture manager with config
    this.fixtureManager = new FixtureManager(this.fileOperations);
    if (config.fixtures) {
      // Note: setFixtures is async but we'll handle initialization in async methods
      this.fixtureManager.setFixtures(config.fixtures);
    }
  }

  /**
   * Get or create browser instance (singleton)
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browserInstance) {
      this.browserInstance = await chromium.launch({ headless: true });
    }
    return this.browserInstance;
  }

  /**
   * Close browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
    }
  }

  /**
   * Create screenshot capture service
   */
  async createScreenshotService(): Promise<ScreenshotCaptureService> {
    const browser = await this.getBrowser();
    const outputDir = this.config.outputDir || '.protobooth/screenshots';
    const viewports: ViewportConfig[] = this.config.viewports || [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'desktop', width: 1440, height: 900 }
    ];

    return new ScreenshotCaptureService({
      browser,
      outputDir,
      viewports,
      fixtureManager: this.fixtureManager,
      fileOperations: this.fileOperations
    });
  }

  /**
   * Get file operations instance
   */
  getFileOperations(): FileOperations {
    return this.fileOperations;
  }

  /**
   * Get fixture manager instance
   */
  getFixtureManager(): FixtureManager {
    return this.fixtureManager;
  }

  /**
   * Get configuration
   */
  getConfig(): ProtoboothConfig {
    return this.config;
  }

  /**
   * Create file storage instance
   */
  createFileStorage(): FileStorage {
    return new FileStorage(this.projectRoot);
  }
}

/**
 * Create service factory from plugin configuration
 */
export function createServiceFactory(
  projectRoot: string,
  config: ProtoboothConfig
): ServiceFactory {
  return new ServiceFactory(projectRoot, config);
}
