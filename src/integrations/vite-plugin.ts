// GREEN: Minimal implementation to make tests pass
import type { Plugin, ResolvedConfig } from 'vite';
import type { FixtureConfig, ViewportConfig } from '@/types/fixtures';
import path from 'path';
import fs from 'fs/promises';

export interface VitePluginOptions {
  fixtures?: FixtureConfig;
  viewports?: ViewportConfig[];
  dev?: boolean;
  routesDir?: string;
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

export function createVitePlugin(options: VitePluginOptions = {}): Plugin & {
  discoverRoutes: (routesDir: string) => Promise<DiscoveredRoute[]>;
} {
  const {
    fixtures = {},
    viewports = [],
    dev = false,
    routesDir = 'src/routes'
  } = options;
  let viteConfig: ResolvedConfig;

  // Helper function to generate routes.json
  async function generateRoutesJson(): Promise<void> {
    try {
      const projectRoot = viteConfig?.root || process.cwd();
      const fullRoutesDir = path.join(projectRoot, routesDir);
      const routes = await plugin.discoverRoutes(fullRoutesDir);

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

  const plugin: Plugin & { discoverRoutes: (routesDir: string) => Promise<DiscoveredRoute[]> } = {
    name: 'protobooth',

    configResolved(config) {
      viteConfig = config;
    },

    async buildStart() {
      await generateRoutesJson();
    },

    handleHotUpdate: dev ? async (ctx) => {
      // Regenerate routes on file changes in development
      if (ctx.file.includes('/routes/')) {
        await generateRoutesJson();
      }
    } : undefined,

    async discoverRoutes(routesDir: string): Promise<DiscoveredRoute[]> {
      const routes: DiscoveredRoute[] = [];

      try {
        await this.discoverRoutesRecursive(routesDir, '', routes);
      } catch (error) {
        console.warn('Protobooth: Route discovery failed:', error);
      }

      // Filter out protobooth routes
      return routes.filter(route => !route.path.startsWith('/protobooth'));
    },

    async discoverRoutesRecursive(dir: string, basePath: string, routes: DiscoveredRoute[]): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Recurse into subdirectories
            const subPath = basePath + '/' + entry.name;
            await this.discoverRoutesRecursive(fullPath, subPath, routes);
          } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
            // Parse route files
            const content = await fs.readFile(fullPath, 'utf-8');

            if (content.includes('createFileRoute')) {
              const route = this.parseRouteFromFile(content, fullPath, basePath, entry.name);
              if (route) {
                routes.push(route);
              }
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read - skip silently
      }
    },

    parseRouteFromFile(content: string, filePath: string, basePath: string, fileName: string): DiscoveredRoute | null {
      // Extract route path from createFileRoute call
      const routeMatch = content.match(/createFileRoute\(['"`]([^'"`]+)['"`]\)/);
      if (!routeMatch) return null;

      const routePath = routeMatch[1];

      // Check if route is dynamic (contains $ parameters)
      const isDynamic = routePath.includes('$');
      const parameters = isDynamic
        ? routePath.match(/\$(\w+)/g)?.map(param => param.substring(1)) || []
        : [];

      return {
        path: routePath,
        isDynamic,
        parameters: parameters.length > 0 ? parameters : undefined,
        filePath
      };
    }
  };

  return plugin;
}