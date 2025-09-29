// Configuration types for protobooth
export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
}

export interface FixtureConfig {
  auth?: {
    user?: Record<string, any>;
    isAuthenticated?: boolean;
    permissions?: string[];
  };
  dynamicRoutes?: {
    [routePattern: string]: Record<string, any> | Record<string, any>[];
  };
  globalState?: {
    theme?: string;
    language?: string;
    featureFlags?: Record<string, boolean>;
    [key: string]: any;
  };
}

export interface ProtoboothConfig {
  enabled?: boolean;
  fixtures?: FixtureConfig;
  viewports?: ViewportConfig[];
  outputDir?: string;
}