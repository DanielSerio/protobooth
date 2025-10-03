// Screenshot capture types
import type { AuthFixture, GlobalStateFixture } from './fixtures';

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

// Alias for client-facing screenshot data
export type Screenshot = ScreenshotResult;

export interface CaptureRequest {
  appUrl: string;
  projectPath?: string; // Optional - server will use its own project root if not provided
  routerType: 'vite' | 'nextjs';
  authState: 'authenticated' | 'unauthenticated';
  includeGlobalState?: boolean;
}

export interface CaptureResult {
  screenshots: ScreenshotResult[];
  injectedFixtures: {
    auth: AuthFixture | null;
    globalState?: GlobalStateFixture;
  };
  fixtureInjectionLog: string[];
  totalRoutes: number;
  totalScreenshots: number;
}