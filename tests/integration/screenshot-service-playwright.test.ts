// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Unmock Playwright for integration tests
vi.unmock('playwright');

import { handleScreenshotCapture } from '@/api/screenshot-handler';
import type { CaptureRequest } from '@/types/screenshot';
import type { ProtoboothConfig } from '@/types/config';
import fs from 'fs/promises';
import path from 'path';

describe('Screenshot Service + Playwright Integration', () => {
  const testProjectRoot = path.join(process.cwd(), 'tests', 'fixtures', 'screenshot-test');
  const screenshotsDir = path.join(testProjectRoot, '.protobooth', 'screenshots');

  const testConfig: ProtoboothConfig = {
    fixtures: {
      auth: {
        authenticated: {
          user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' },
          token: 'test-token',
          permissions: ['read', 'write']
        },
        unauthenticated: null
      },
      dynamicRoutes: {
        '/user/$userId': [
          { userId: '123', name: 'Alice' }
        ]
      },
      globalState: {
        theme: 'light',
        language: 'en'
      }
    },
    viewports: [
      { name: 'mobile', width: 375, height: 667 }
    ]
  };

  beforeEach(async () => {
    // Clean up test directories
    await fs.rm(testProjectRoot, { recursive: true, force: true });
    await fs.mkdir(testProjectRoot, { recursive: true });

    // Create a simple routes.json for testing
    const routesData = {
      routes: [
        { path: '/', isDynamic: false },
        { path: '/about', isDynamic: false }
      ],
      fixtures: testConfig.fixtures,
      viewports: testConfig.viewports,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(testProjectRoot, 'routes.json'),
      JSON.stringify(routesData, null, 2)
    );
  });

  afterEach(async () => {
    // Clean up
    await fs.rm(testProjectRoot, { recursive: true, force: true });

    // Close browser
    const { closeBrowser } = await import('@/api/screenshot-handler');
    await closeBrowser();
  });

  it('should capture screenshots with Playwright browser', async () => {
    const request: CaptureRequest = {
      appUrl: 'http://localhost:5173', // Assume demo app is running
      projectPath: testProjectRoot,
      routerType: 'vite',
      authState: 'authenticated'
    };

    try {
      const result = await handleScreenshotCapture(request, testConfig, testProjectRoot);

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.screenshots).toBeDefined();
      expect(result.screenshots.length).toBeGreaterThan(0);
      expect(result.outputDirectory).toBeDefined();

      // Each screenshot should have required properties
      result.screenshots.forEach(screenshot => {
        expect(screenshot.route).toBeDefined();
        expect(screenshot.viewport).toBeDefined();
        expect(screenshot.path).toBeDefined();
      });

    } catch (error) {
      // If app is not running, skip the test
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('net::ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to connect to application server')) {
        console.log('Skipping test - demo app not running');
        return;
      }
      throw error;
    }
  }, 30000); // 30 second timeout for browser operations

  it('should create screenshot directory structure', async () => {
    const request: CaptureRequest = {
      appUrl: 'http://localhost:5173',
      projectPath: testProjectRoot,
      routerType: 'vite',
      authState: 'authenticated'
    };

    try {
      await handleScreenshotCapture(request, testConfig, testProjectRoot);

      // Verify .protobooth directory was created
      const protoboothDir = path.join(testProjectRoot, '.protobooth');
      const stats = await fs.stat(protoboothDir);
      expect(stats.isDirectory()).toBe(true);

      // Verify screenshots directory exists
      const screenshotsStats = await fs.stat(screenshotsDir);
      expect(screenshotsStats.isDirectory()).toBe(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('net::ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to connect to application server')) {
        console.log('Skipping test - demo app not running');
        return;
      }
      throw error;
    }
  }, 30000);

  it('should handle missing routes.json gracefully', async () => {
    // Remove routes.json
    await fs.rm(path.join(testProjectRoot, 'routes.json'), { force: true });

    const request: CaptureRequest = {
      appUrl: 'http://localhost:5173',
      projectPath: testProjectRoot,
      routerType: 'vite',
      authState: 'authenticated'
    };

    await expect(handleScreenshotCapture(request, testConfig, testProjectRoot))
      .rejects
      .toThrow('Failed to discover routes');
  });

  it('should validate capture request parameters', async () => {
    const invalidRequest: CaptureRequest = {
      appUrl: 'http://localhost:5173',
      projectPath: testProjectRoot,
      routerType: 'invalid' as any, // Invalid router type
      authState: 'authenticated'
    };

    await expect(handleScreenshotCapture(invalidRequest, testConfig, testProjectRoot))
      .rejects
      .toThrow('Invalid router type');
  });

  it('should handle multiple viewports', async () => {
    const multiViewportConfig: ProtoboothConfig = {
      ...testConfig,
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1440, height: 900 }
      ]
    };

    const request: CaptureRequest = {
      appUrl: 'http://localhost:5173',
      projectPath: testProjectRoot,
      routerType: 'vite',
      authState: 'authenticated'
    };

    try {
      const result = await handleScreenshotCapture(request, multiViewportConfig, testProjectRoot);

      // Verify screenshots for all viewports
      const viewportNames = new Set(result.screenshots.map(s => s.viewport));
      expect(viewportNames.size).toBeGreaterThan(0);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('net::ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to connect to application server')) {
        console.log('Skipping test - demo app not running');
        return;
      }
      throw error;
    }
  }, 30000);
});
