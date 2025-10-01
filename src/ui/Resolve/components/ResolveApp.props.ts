import type { CaptureResult } from '@/types/screenshot';

export interface FileOperations {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  fileExists: (path: string) => Promise<boolean>;
}

export interface CaptureOptions {
  appUrl: string;
  projectPath: string;
  routerType: 'vite' | 'nextjs';
  authState: 'authenticated' | 'unauthenticated';
}

export interface ScreenshotService {
  captureRoutes: (options: CaptureOptions) => Promise<CaptureResult>;
}

export interface FixtureManager {
  getAuthFixture(state: 'authenticated' | 'unauthenticated'): unknown;
  getGlobalState():
    | Record<string, string | Record<string, boolean> | undefined>
    | undefined;
}

export interface ResolveAppProps {
  fileOperations?: FileOperations;
  screenshotService?: ScreenshotService;
  fixtureManager?: FixtureManager;
}
