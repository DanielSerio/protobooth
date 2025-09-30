// RED: Write failing integration tests for screenshot capture with fixture injection
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import path from 'path';
import { ScreenshotCaptureService } from '@/screenshot/screenshot-capture-service';
import { FixtureManager } from '@/core/fixture-manager';
import type { FixtureConfig } from '@/types/fixtures';
import type { ViewportConfig } from '@/types/screenshot';

describe('Screenshot Capture Integration', () => {
  let screenshotService: ScreenshotCaptureService;
  let fixtureManager: FixtureManager;
  let mockBrowser: any;

  const testOutputDir = path.join(__dirname, '../../temp/test-screenshots');
  const demoAppsDir = path.join(__dirname, '../../demos');

  const mockFileOps = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    fileExists: vi.fn(),
    ensureDir: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined)
  };

  const testViewports: ViewportConfig[] = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1440, height: 900 }
  ];

  const testFixtures: FixtureConfig = {
    auth: {
      authenticated: {
        user: { id: '123', name: 'John Doe', email: 'john@example.com' },
        token: 'mock-jwt-token'
      },
      unauthenticated: null
    },
    dynamicRoutes: {
      '/user/[userId]': [
        { userId: '123' },
        { userId: '456' },
        { userId: '789' }
      ],
      '/product/[slug]': [
        { slug: 'laptop' },
        { slug: 'phone' }
      ]
    },
    globalState: {
      theme: 'light',
      language: 'en',
      featureFlags: { newFeature: true }
    }
  };

  beforeAll(async () => {
    // Mock browser with essential methods
    const mockPage = {
      setViewportSize: vi.fn().mockResolvedValue(undefined),
      goto: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn().mockResolvedValue(undefined),
      screenshot: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined)
    };

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined)
    };

    // Setup services
    fixtureManager = new FixtureManager(mockFileOps);
    await fixtureManager.setFixtures(testFixtures);

    screenshotService = new ScreenshotCaptureService({
      browser: mockBrowser,
      outputDir: testOutputDir,
      viewports: testViewports,
      fixtureManager,
      fileOperations: mockFileOps
    });
  });

  afterAll(async () => {
    // No cleanup needed for mocked browser
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset file operation mocks
    mockFileOps.fileExists.mockResolvedValue(true);
  });

  describe('TanStack Router Demo App', () => {
    const viteAppUrl = 'http://localhost:5173';
    const viteProjectPath = path.join(demoAppsDir, 'tanstack-router');

    it('should capture screenshots for static routes with auth fixtures', async () => {
      // Mock route discovery
      const staticRoutes = ['/home', '/about', '/contact'];
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: staticRoutes.map(route => ({ path: route, isDynamic: false })) })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: viteAppUrl,
        projectPath: viteProjectPath,
        routerType: 'vite',
        authState: 'authenticated'
      });

      // Should capture each route at each viewport
      expect(result.screenshots).toHaveLength(staticRoutes.length * testViewports.length);

      // Verify screenshot service was called for each route and viewport
      const expectedScreenshots = staticRoutes.length * testViewports.length;
      expect(result.screenshots).toHaveLength(expectedScreenshots);

      // Verify screenshot metadata
      for (const screenshot of result.screenshots) {
        expect(screenshot.route).toMatch(/^\/?(home|about|contact)$/);
        expect(['mobile', 'desktop']).toContain(screenshot.viewport);
        expect(screenshot.filePath).toContain(testOutputDir);
      }

      // Verify auth fixture was injected
      expect(result.injectedFixtures.auth).toEqual(testFixtures.auth!.authenticated);
    });

    it('should capture multiple instances for dynamic routes', async () => {
      // Mock route discovery with dynamic route
      const dynamicRoute = '/user/[userId]';
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: [{ path: dynamicRoute, isDynamic: true, parameters: ['userId'] }] })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: viteAppUrl,
        projectPath: viteProjectPath,
        routerType: 'vite',
        authState: 'authenticated'
      });

      // Should capture 3 user instances × 2 viewports = 6 screenshots
      const expectedInstances = ['user/123', 'user/456', 'user/789'];
      expect(result.screenshots).toHaveLength(expectedInstances.length * testViewports.length);

      // Verify screenshot metadata includes correct route instances
      const capturedRoutes = result.screenshots.map(s => s.route);
      expect(capturedRoutes).toContain('/user/123');
      expect(capturedRoutes).toContain('/user/456');
      expect(capturedRoutes).toContain('/user/789');
    });

    it('should inject global state fixtures during capture', async () => {
      const staticRoute = '/dashboard';
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: [{ path: staticRoute, isDynamic: false }] })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: viteAppUrl,
        projectPath: viteProjectPath,
        routerType: 'vite',
        authState: 'authenticated',
        includeGlobalState: true
      });

      expect(result.injectedFixtures.globalState).toEqual(testFixtures.globalState);
      expect(result.screenshots).toHaveLength(testViewports.length);
    });
  });

  describe('Next.js Demo App', () => {
    const nextAppUrl = 'http://localhost:3000';
    const nextProjectPath = path.join(demoAppsDir, 'nextjs');

    it('should capture screenshots for App Router routes', async () => {
      // Mock App Router discovery
      const appRoutes = ['/app-route', '/app-route/nested', '/app-route/[id]'];
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({
          appRouter: appRoutes.map(route => ({
            path: route,
            isDynamic: route.includes('['),
            parameters: route.includes('[id]') ? ['id'] : undefined
          }))
        })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: nextAppUrl,
        projectPath: nextProjectPath,
        routerType: 'nextjs',
        authState: 'unauthenticated'
      });

      // Static routes: 2 routes × 2 viewports = 4 screenshots
      // Dynamic route with no fixtures: 0 screenshots
      expect(result.screenshots).toHaveLength(4); // Only static routes
      expect(result.injectedFixtures.auth).toBeNull();
    });

    it('should capture screenshots for Pages Router routes', async () => {
      // Mock Pages Router discovery
      const pageRoutes = ['/page-route', '/page-route/about', '/page-route/[slug]'];
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({
          pagesRouter: pageRoutes.map(route => ({
            path: route,
            isDynamic: route.includes('['),
            parameters: route.includes('[slug]') ? ['slug'] : undefined
          }))
        })
      );

      // Add fixture for [slug] route
      const mockFixturesWithSlug = {
        ...testFixtures,
        dynamicRoutes: {
          ...testFixtures.dynamicRoutes,
          '/page-route/[slug]': [{ slug: 'test-page' }, { slug: 'another-page' }]
        }
      };
      await fixtureManager.setFixtures(mockFixturesWithSlug);

      const result = await screenshotService.captureRoutes({
        appUrl: nextAppUrl,
        projectPath: nextProjectPath,
        routerType: 'nextjs',
        authState: 'authenticated'
      });

      // Static routes: 2 × 2 viewports = 4
      // Dynamic route: 2 instances × 2 viewports = 4
      // Total = 8 screenshots
      expect(result.screenshots).toHaveLength(8);
    });
  });

  describe('Multi-Viewport Capture', () => {
    it('should capture screenshots at all configured viewports', async () => {
      const route = '/responsive-page';
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: [{ path: route, isDynamic: false }] })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: 'http://localhost:5173',
        projectPath: path.join(demoAppsDir, 'tanstack-router'),
        routerType: 'vite',
        authState: 'authenticated'
      });

      // Should have one screenshot per viewport
      expect(result.screenshots).toHaveLength(testViewports.length);

      // Verify each viewport was captured
      const screenshotsByViewport = result.screenshots.reduce((acc, screenshot) => {
        acc[screenshot.viewport] = (acc[screenshot.viewport] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(screenshotsByViewport.mobile).toBe(1);
      expect(screenshotsByViewport.desktop).toBe(1);
    });

    it('should apply correct viewport dimensions during capture', async () => {
      const route = '/viewport-test';
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: [{ path: route, isDynamic: false }] })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: 'http://localhost:5173',
        projectPath: path.join(demoAppsDir, 'tanstack-router'),
        routerType: 'vite',
        authState: 'authenticated'
      });

      // Verify viewport metadata is captured
      const mobileScreenshot = result.screenshots.find(s => s.viewport === 'mobile');
      const desktopScreenshot = result.screenshots.find(s => s.viewport === 'desktop');

      expect(mobileScreenshot?.dimensions).toEqual({ width: 375, height: 667 });
      expect(desktopScreenshot?.dimensions).toEqual({ width: 1440, height: 900 });
    });
  });

  describe('Error Handling', () => {
    it('should handle app server not running', async () => {
      // Configure mock to reject goto calls
      const mockPage = {
        setViewportSize: vi.fn().mockResolvedValue(undefined),
        goto: vi.fn().mockRejectedValue(new Error('net::ERR_CONNECTION_REFUSED')),
        evaluate: vi.fn().mockResolvedValue(undefined),
        reload: vi.fn().mockResolvedValue(undefined),
        screenshot: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined)
      };

      const failingBrowser = {
        newPage: vi.fn().mockResolvedValue(mockPage),
        close: vi.fn().mockResolvedValue(undefined)
      };

      const failingService = new ScreenshotCaptureService({
        browser: failingBrowser as any,
        outputDir: testOutputDir,
        viewports: testViewports,
        fixtureManager,
        fileOperations: mockFileOps
      });

      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: [{ path: '/test', isDynamic: false }] })
      );

      await expect(failingService.captureRoutes({
        appUrl: 'http://localhost:9999', // Non-existent server
        projectPath: path.join(demoAppsDir, 'tanstack-router'),
        routerType: 'vite',
        authState: 'authenticated'
      })).rejects.toThrow('Failed to connect to application server');
    });

    it('should handle invalid project path', async () => {
      // Mock file operations to indicate path doesn't exist
      mockFileOps.fileExists.mockResolvedValue(false);

      await expect(screenshotService.captureRoutes({
        appUrl: 'http://localhost:5173',
        projectPath: '/nonexistent/path',
        routerType: 'vite',
        authState: 'authenticated'
      })).rejects.toThrow('Project path does not exist');
    });

    it('should handle route discovery failures gracefully', async () => {
      vi.mocked(mockFileOps.readFile).mockRejectedValue(new Error('File read error'));

      await expect(screenshotService.captureRoutes({
        appUrl: 'http://localhost:5173',
        projectPath: path.join(demoAppsDir, 'tanstack-router'),
        routerType: 'vite',
        authState: 'authenticated'
      })).rejects.toThrow('Failed to discover routes');
    });
  });

  describe('Fixture Injection', () => {
    it('should inject auth fixtures into browser localStorage', async () => {
      const route = '/protected';
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: [{ path: route, isDynamic: false }] })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: 'http://localhost:5173',
        projectPath: path.join(demoAppsDir, 'tanstack-router'),
        routerType: 'vite',
        authState: 'authenticated'
      });

      // Verify fixture injection was called
      expect(result.injectedFixtures.auth).toEqual(testFixtures.auth!.authenticated);
      expect(result.fixtureInjectionLog).toContain('localStorage: auth');

      // Only check for globalState injection if includeGlobalState was true
      const hasGlobalState = result.injectedFixtures.globalState !== undefined;
      if (hasGlobalState) {
        expect(result.fixtureInjectionLog).toContain('localStorage: globalState');
      }
    });

    it('should inject dynamic route data into page context', async () => {
      const route = '/product/[slug]';
      vi.mocked(mockFileOps.readFile).mockResolvedValue(
        JSON.stringify({ routes: [{ path: route, isDynamic: true, parameters: ['slug'] }] })
      );

      const result = await screenshotService.captureRoutes({
        appUrl: 'http://localhost:5173',
        projectPath: path.join(demoAppsDir, 'tanstack-router'),
        routerType: 'vite',
        authState: 'authenticated'
      });

      // Should capture 2 product instances × 2 viewports = 4 screenshots
      expect(result.screenshots).toHaveLength(4);

      // Verify dynamic route fixtures were used
      const productScreenshots = result.screenshots.filter(s => s.route.includes('product/'));
      expect(productScreenshots.some(s => s.route.includes('laptop'))).toBe(true);
      expect(productScreenshots.some(s => s.route.includes('phone'))).toBe(true);
    });
  });
});