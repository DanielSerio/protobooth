import { Browser } from 'playwright';
import path from 'path';
import type { FixtureManager } from '@/core/fixture-manager';
import type {
  ViewportConfig,
  ScreenshotResult,
  CaptureRequest,
  CaptureResult
} from '@/types/screenshot';
import type {
  AuthFixture,
  GlobalStateFixture,
  DiscoveredRouteWithFixtures
} from '@/types/fixtures';

// File operations interface (Dependency Inversion Principle)
export interface FileOperations {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  ensureDir(path: string): Promise<void>;
  remove(path: string): Promise<void>;
}

// Route discovery interface (Single Responsibility Principle)
export interface RouteDiscovery {
  discoverRoutes(projectPath: string): Promise<DiscoveredRouteWithFixtures[]>;
}

// Browser controller interface (Single Responsibility Principle)
export interface BrowserController {
  captureScreenshot(options: {
    url: string;
    viewport: ViewportConfig;
    authFixture: AuthFixture | null;
    globalState?: GlobalStateFixture;
    outputPath: string;
  }): Promise<ScreenshotResult>;
}

// Request validator interface (Single Responsibility Principle)
export interface RequestValidator {
  validate(request: CaptureRequest): Promise<void>;
}

// Default route discovery implementation
export class DefaultRouteDiscovery implements RouteDiscovery {
  constructor(private fileOps: FileOperations) {}

  async discoverRoutes(projectPath: string): Promise<DiscoveredRouteWithFixtures[]> {
    try {
      // Mock implementation - in reality would use ViteRouterDiscovery/NextjsRouterDiscovery
      const content = await this.fileOps.readFile(path.join(projectPath, 'routes.json'));
      const data = JSON.parse(content);
      return [...(data.routes || []), ...(data.appRouter || []), ...(data.pagesRouter || [])];
    } catch (error) {
      throw new Error('Failed to discover routes');
    }
  }
}

// Playwright browser controller implementation
export class PlaywrightBrowserController implements BrowserController {
  constructor(private browser: Browser) {}

  async captureScreenshot(options: {
    url: string;
    viewport: ViewportConfig;
    authFixture: AuthFixture | null;
    globalState?: GlobalStateFixture;
    outputPath: string;
  }): Promise<ScreenshotResult> {
    const page = await this.browser.newPage();

    try {
      // Set viewport
      await page.setViewportSize({
        width: options.viewport.width,
        height: options.viewport.height
      });

      // Navigate to URL and wait for app to be ready
      try {
        await page.goto(options.url, { waitUntil: 'networkidle' });
      } catch (error) {
        throw new Error('Failed to connect to application server');
      }

      // Inject fixtures into localStorage
      if (options.authFixture) {
        await page.evaluate((auth) => {
          localStorage.setItem('auth', JSON.stringify(auth));
        }, options.authFixture);
      }

      if (options.globalState) {
        await page.evaluate((state) => {
          localStorage.setItem('globalState', JSON.stringify(state));
        }, options.globalState);
      }

      // Reload page to apply injected data
      if (options.authFixture || options.globalState) {
        await page.reload({ waitUntil: 'networkidle' });
      }

      // Take screenshot
      await page.screenshot({
        path: options.outputPath,
        fullPage: true
      });

      // Extract route from URL
      const url = new URL(options.url);
      const route = url.pathname;

      return {
        route,
        viewport: options.viewport.name,
        dimensions: {
          width: options.viewport.width,
          height: options.viewport.height
        },
        filePath: options.outputPath,
        timestamp: new Date()
      };
    } finally {
      await page.close();
    }
  }
}

// Default request validator implementation
export class DefaultRequestValidator implements RequestValidator {
  constructor(private fileOps: FileOperations) {}

  async validate(request: CaptureRequest): Promise<void> {
    // Check if project path exists
    if (!(await this.fileOps.fileExists(request.projectPath))) {
      throw new Error('Project path does not exist');
    }

    // Validate router type
    if (!['vite', 'nextjs'].includes(request.routerType)) {
      throw new Error(`Invalid router type: ${request.routerType}`);
    }

    // Validate auth state
    if (!['authenticated', 'unauthenticated'].includes(request.authState)) {
      throw new Error(`Invalid auth state: ${request.authState}`);
    }
  }
}

export interface ScreenshotCaptureConfig {
  browser: Browser;
  outputDir: string;
  viewports: ViewportConfig[];
  fixtureManager: FixtureManager;
  fileOperations: FileOperations;
}

export class ScreenshotCaptureService {
  private readonly outputDir: string;
  private readonly viewports: ViewportConfig[];
  private readonly fixtureManager: FixtureManager;
  private readonly fileOps: FileOperations;
  private readonly routeDiscovery: RouteDiscovery;
  private readonly browserController: BrowserController;
  private readonly validator: RequestValidator;

  constructor(
    config: ScreenshotCaptureConfig,
    routeDiscovery?: RouteDiscovery,
    browserController?: BrowserController,
    validator?: RequestValidator
  ) {
    this.outputDir = config.outputDir;
    this.viewports = config.viewports;
    this.fixtureManager = config.fixtureManager;
    this.fileOps = config.fileOperations;
    this.routeDiscovery = routeDiscovery || new DefaultRouteDiscovery(config.fileOperations);
    this.browserController = browserController || new PlaywrightBrowserController(config.browser);
    this.validator = validator || new DefaultRequestValidator(config.fileOperations);
  }

  async captureRoutes(request: CaptureRequest): Promise<CaptureResult> {
    // Validate request using injected validator
    await this.validator.validate(request);

    // Discover routes using injected route discovery
    const routes = await this.routeDiscovery.discoverRoutes(request.projectPath);

    // Generate route instances with fixtures
    const routeInstances = await this.generateRouteInstances(routes);

    // Prepare fixtures for injection
    const authFixture = this.fixtureManager.getAuthFixture(request.authState);
    const globalState = request.includeGlobalState
      ? this.fixtureManager.getGlobalState() || {}
      : undefined;

    const screenshots: ScreenshotResult[] = [];
    const fixtureInjectionLog: string[] = [];

    // Ensure output directory exists
    await this.fileOps.ensureDir(this.outputDir);

    // Capture screenshots for each route instance at each viewport
    for (const routeInstance of routeInstances) {
      for (const viewport of this.viewports) {
        try {
          // Generate screenshot filename
          const routePath = routeInstance === '/' ? 'index' : routeInstance.slice(1);
          const filename = `${routePath.replace(/\//g, '_')}_${viewport.name}.png`;
          const outputPath = path.join(this.outputDir, filename);

          const screenshot = await this.browserController.captureScreenshot({
            url: `${request.appUrl}${routeInstance}`,
            viewport,
            authFixture,
            globalState,
            outputPath
          });

          screenshots.push(screenshot);
          fixtureInjectionLog.push(`Route: ${routeInstance}, Viewport: ${viewport.name}`);

          if (authFixture) {
            fixtureInjectionLog.push('localStorage: auth');
          }
          if (globalState) {
            fixtureInjectionLog.push('localStorage: globalState');
          }
        } catch (error) {
          throw new Error(`Failed to capture screenshot for ${routeInstance} at ${viewport.name}: ${error}`);
        }
      }
    }

    return {
      screenshots,
      injectedFixtures: {
        auth: authFixture,
        globalState
      },
      fixtureInjectionLog,
      totalRoutes: routes.length,
      totalScreenshots: screenshots.length
    };
  }


  private async generateRouteInstances(routes: DiscoveredRouteWithFixtures[]): Promise<string[]> {
    const instances: string[] = [];

    for (const route of routes) {
      if (route.isDynamic) {
        const routeInstances = this.fixtureManager.generateRouteInstances(route.path);
        instances.push(...routeInstances);
      } else {
        instances.push(route.path);
      }
    }

    return instances;
  }
}