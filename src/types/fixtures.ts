// Fixture data types for consistent screenshot capture

export interface UserData {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface AuthFixture {
  user: UserData;
  token: string;
  permissions?: string[];
  [key: string]: any;
}

export interface DynamicRouteFixture {
  [key: string]: any;
}

export interface GlobalStateFixture {
  theme?: string;
  language?: string;
  featureFlags?: Record<string, boolean>;
  [key: string]: any;
}

export interface FixtureConfig {
  auth?: {
    authenticated: AuthFixture | null;
    unauthenticated: null;
  };
  dynamicRoutes?: {
    [routePattern: string]: DynamicRouteFixture[];
  };
  globalState?: GlobalStateFixture;
}

export interface DiscoveredRouteWithFixtures {
  path: string;
  isDynamic: boolean;
  parameters?: string[];
}

export interface RouteFixture {
  route: string;
  name: string;
  data?: Record<string, any>;
}

export interface DiscoveredRoute {
  path: string;
  isDynamic: boolean;
  parameters?: string[];
}

export interface ProcessedRoute {
  route: string;
  fixtureData?: Record<string, any>;
  screenshotPath: string;
}