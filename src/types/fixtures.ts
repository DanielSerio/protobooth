// Fixture data types for consistent screenshot capture

export interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AuthFixture {
  user: UserData;
  token: string;
  permissions?: string[];
  [key: string]: string | string[] | UserData | undefined;
}

export interface DynamicRouteFixture {
  [key: string]: string | number | boolean | undefined;
}

export interface GlobalStateFixture {
  theme?: string;
  language?: string;
  featureFlags?: Record<string, boolean>;
  [key: string]: string | Record<string, boolean> | undefined;
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
  data?: Record<string, string | number | boolean>;
}

export interface DiscoveredRoute {
  path: string;
  isDynamic: boolean;
  parameters?: string[];
}

export interface ProcessedRoute {
  route: string;
  fixtureData?: Record<string, string | number | boolean>;
  screenshotPath: string;
}