// UI component and route injection types

export interface InjectedRoute {
  path: string;
  component: string;
  environment: 'development' | 'staging' | 'staging-simulation';
}

export interface RouteInjectionConfig {
  routes: InjectedRoute[];
  environment: 'development' | 'staging' | 'staging-simulation';
  projectPath: string;
  outputDir: string;
  nextjsRouter?: 'app' | 'pages';
}

export interface RouteValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UIState {
  currentWorkflow: 'idle' | 'capturing' | 'reviewing' | 'annotating';
  screenshotSession?: {
    id: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    screenshots: string[];
    createdAt: Date;
  };
  annotations?: {
    sessionId: string;
    annotations: AnnotationData[];
    status: 'draft' | 'published';
  };
}

export interface AnnotationData {
  id: string;
  route: string;
  viewport: string;
  position: { x: number; y: number };
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved';
  timestamp: Date;
}

export interface FileStateManager {
  saveState(state: UIState): Promise<void>;
  loadState(): Promise<UIState>;
  clearState(): Promise<void>;
}

// Re-export types from their respective packages
import type { ViteDevServer } from 'vite';

export type { ViteDevServer } from 'vite';

// Custom types for Next.js API handlers (avoiding direct next dependency)
export interface NextApiRequest {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
}

export interface NextApiResponse {
  setHeader(name: string, value: string): void;
  writeHead(statusCode: number, headers?: Record<string, string>): void;
  end(data?: string): void;
  json?(data: Record<string, unknown> | unknown[]): void;
}

// Custom type for Next.js dev server with router capabilities
export interface NextjsDevServerWithRouter {
  router: {
    add(method: string, path: string, handler: (req: NextApiRequest, res: NextApiResponse) => void): void;
    get(path: string, handler: (req: NextApiRequest, res: NextApiResponse) => void): void;
    post(path: string, handler: (req: NextApiRequest, res: NextApiResponse) => void): void;
  };
  config: {
    dir: string;
  };
}

export interface DevServerIntegration {
  injectRoutes(server: ViteDevServer | NextjsDevServerWithRouter, config: RouteInjectionConfig): Promise<void>;
  generateRouteComponents(config: RouteInjectionConfig): Promise<void>;
  cleanup(): Promise<void>;
}