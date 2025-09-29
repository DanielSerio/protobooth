// Screenshot capture types
export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
}

export interface ScreenshotResult {
  route: string;
  viewport: string;
  dimensions: { width: number; height: number };
  filePath: string;
  timestamp: Date;
}

export interface CaptureRequest {
  appUrl: string;
  projectPath: string;
  routerType: 'vite' | 'nextjs';
  authState: 'authenticated' | 'unauthenticated';
  includeGlobalState?: boolean;
}

export interface CaptureResult {
  screenshots: ScreenshotResult[];
  injectedFixtures: {
    auth: any;
    globalState?: any;
  };
  fixtureInjectionLog: string[];
  totalRoutes: number;
  totalScreenshots: number;
}