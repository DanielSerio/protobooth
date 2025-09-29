import type { FixtureConfig, ViewportConfig } from '@/types/fixtures';
import path from 'path';
import fs from 'fs/promises';

export interface NextjsPluginOptions {
  fixtures?: FixtureConfig;
  viewports?: ViewportConfig[];
  dev?: boolean;
  routesDir?: string;
  routerType?: 'pages' | 'app';
}

export interface DiscoveredRoute {
  path: string;
  isDynamic: boolean;
  parameters?: string[];
  filePath: string;
}

interface RoutesData {
  routes: DiscoveredRoute[];
  fixtures: FixtureConfig;
  viewports: ViewportConfig[];
  timestamp: string;
}

export function createNextPlugin(options: NextjsPluginOptions = {}) {
  const {
    fixtures = {},
    viewports = [],
    dev = false,
    routesDir = 'pages',
    routerType = 'pages'
  } = options;

  const plugin = {
    name: 'protobooth-nextjs',

    async discoverRoutes(dir: string, type: 'pages' | 'app' = routerType): Promise<DiscoveredRoute[]> {
      const routes: DiscoveredRoute[] = [];

      try {
        await this.discoverRoutesRecursive(dir, '', routes, type);
      } catch (error) {
        console.warn('Protobooth: Route discovery failed:', error);
      }

      // Filter out protobooth routes
      return routes.filter(route => !route.path.startsWith('/protobooth'));
    },

    async discoverRoutesRecursive(dir: string, basePath: string, routes: DiscoveredRoute[], type: 'pages' | 'app'): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Skip protobooth directories
            if (entry.name === 'protobooth') {
              continue;
            }

            // Recurse into subdirectories
            const subPath = basePath + '/' + entry.name;
            await this.discoverRoutesRecursive(fullPath, subPath, routes, type);
          } else if (entry.isFile()) {
            const route = this.parseRouteFromFile(entry.name, fullPath, basePath, type);
            if (route) {
              routes.push(route);
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read - skip silently
      }
    },

    parseRouteFromFile(fileName: string, filePath: string, basePath: string, type: 'pages' | 'app'): DiscoveredRoute | null {
      // Skip non-page files
      if (type === 'pages') {
        // Pages router: only include .tsx/.jsx files, exclude _app, _document, etc.
        if (!fileName.match(/\.(tsx|jsx)$/) || fileName.startsWith('_')) {
          return null;
        }
      } else {
        // App router: only include page.tsx/page.jsx files
        if (!fileName.match(/^page\.(tsx|jsx)$/)) {
          return null;
        }
      }

      let routePath: string;

      if (type === 'pages') {
        // Pages router logic
        if (fileName === 'index.tsx' || fileName === 'index.jsx' || fileName === 'index.ts' || fileName === 'index.js') {
          routePath = basePath || '/';
        } else {
          const nameWithoutExt = fileName.replace(/\.(tsx?|jsx?)$/, '');
          routePath = basePath + '/' + nameWithoutExt;
        }
      } else {
        // App router logic - route is determined by directory structure
        routePath = basePath || '/';
      }

      // Normalize route path
      if (routePath !== '/' && routePath.endsWith('/')) {
        routePath = routePath.slice(0, -1);
      }
      if (!routePath.startsWith('/')) {
        routePath = '/' + routePath;
      }

      // Check if route is dynamic and extract parameters
      const isDynamic = routePath.includes('[');
      const parameters: string[] = [];

      if (isDynamic) {
        // Extract parameters from [param] or [...param] patterns
        const paramMatches = routePath.match(/\[(\.\.\.)?([^\]]+)\]/g);
        if (paramMatches) {
          paramMatches.forEach(match => {
            const param = match.replace(/\[(\.\.\.)?([^\]]+)\]/, '$2');
            parameters.push(param);
          });
        }
      }

      return {
        path: routePath,
        isDynamic,
        parameters: parameters.length > 0 ? parameters : undefined,
        filePath
      };
    },

    async generateRoutesJson(projectRoot: string, routesDirectory: string = routesDir): Promise<void> {
      try {
        const fullRoutesDir = path.join(projectRoot, routesDirectory);
        const routes = await this.discoverRoutes(fullRoutesDir);

        const routesData: RoutesData = {
          routes,
          fixtures,
          viewports,
          timestamp: new Date().toISOString()
        };

        const outputPath = path.join(projectRoot, 'routes.json');
        await fs.writeFile(outputPath, JSON.stringify(routesData, null, 2));
      } catch (error) {
        console.warn('Protobooth: Failed to generate routes.json:', error);
      }
    }
  };

  return plugin;
}