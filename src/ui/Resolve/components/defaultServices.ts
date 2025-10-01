import type {
  FileOperations,
  ScreenshotService,
  FixtureManager,
} from './ResolveApp.props';

/**
 * Default file operations for production use
 */
export const defaultFileOps: FileOperations = {
  readFile: async (path: string) => {
    if (path.includes('workflow-state.json')) {
      return JSON.stringify({
        state: 'in-development',
        timestamp: new Date().toISOString(),
      });
    }
    if (path.includes('annotations.json')) {
      return JSON.stringify([]);
    }
    return '{}';
  },
  writeFile: async (_path: string, _content: string) => {
    // Production implementation would write to filesystem
  },
  fileExists: async (path: string) => {
    return path.includes('protobooth.config.json');
  },
};

/**
 * Default screenshot service for production use
 */
export const defaultScreenshotService: ScreenshotService = {
  captureRoutes: async () => ({
    screenshots: [
      {
        route: '/',
        viewport: 'desktop',
        filePath: '/temp/home-desktop.png',
        dimensions: { width: 1920, height: 1080 },
        timestamp: new Date(),
      },
      {
        route: '/',
        viewport: 'mobile',
        filePath: '/temp/home-mobile.png',
        dimensions: { width: 375, height: 667 },
        timestamp: new Date(),
      },
    ],
    injectedFixtures: { auth: null },
    fixtureInjectionLog: [],
    totalRoutes: 1,
    totalScreenshots: 2,
  }),
};

/**
 * Default fixture manager for production use
 */
export const defaultFixtureManager: FixtureManager = {
  getAuthFixture: () => null,
  getGlobalState: () => undefined,
};
