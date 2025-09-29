// GREEN: Minimal implementation to make tests pass
import type { Plugin, ResolvedConfig } from 'vite';
import type { FixtureConfig } from '@/types/fixtures';
import type { ViewportConfig } from '@/types/screenshot';
import path from 'path';
import fs from 'fs/promises';

export interface VitePluginOptions {
  fixtures?: FixtureConfig;
  viewports?: ViewportConfig[];
  dev?: boolean;
  enabled?: boolean;
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
    enabled,
    routesDir = 'src/routes'
  } = options;

  // Use enabled if provided, otherwise fall back to dev
  const isEnabled = enabled ?? dev;
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

  // Route handlers
  function handleResolveRoute(_req: any, res: any, config: { fixtures: FixtureConfig; viewports: ViewportConfig[] }): void {
    const html = generateUIHtml('resolve', config);
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  }

  function handleAnnotateRoute(_req: any, res: any, config: { fixtures: FixtureConfig; viewports: ViewportConfig[] }): void {
    const html = generateUIHtml('annotate', config);
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  }

  function handleStaticAssets(_req: any, res: any, url: string): void {
    if (url.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.end('/* Protobooth styles placeholder */');
    } else if (url.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.end('// Protobooth script placeholder');
    } else {
      res.writeHead(404);
      res.end();
    }
  }

  function generateUIHtml(mode: 'resolve' | 'annotate', config: { fixtures: FixtureConfig; viewports: ViewportConfig[] }): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Protobooth - ${mode === 'resolve' ? 'Development' : 'Annotation'}</title>
  <link rel="stylesheet" href="/protobooth/assets/style.css">
</head>
<body>
  <div id="protobooth-root">
    <h1>Protobooth ${mode === 'resolve' ? 'Development UI' : 'Annotation UI'}</h1>
    <p>Route injection working! Mode: ${mode}</p>
  </div>
  <script>
    window.__PROTOBOOTH_CONFIG__ = ${JSON.stringify(config)};
  </script>
  <script src="/protobooth/assets/app.js"></script>
</body>
</html>`;
  }

  // Helper functions for route discovery
  async function discoverRoutesRecursive(dir: string, basePath: string, routes: DiscoveredRoute[]): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recurse into subdirectories
          const subPath = basePath + '/' + entry.name;
          await discoverRoutesRecursive(fullPath, subPath, routes);
        } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
          // Parse route files
          const content = await fs.readFile(fullPath, 'utf-8');

          if (content.includes('createFileRoute')) {
            const route = parseRouteFromFile(content, fullPath, basePath, entry.name);
            if (route) {
              routes.push(route);
            }
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read - skip silently
    }
  }

  function parseRouteFromFile(content: string, filePath: string, _basePath: string, _fileName: string): DiscoveredRoute | null {
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

  const plugin: Plugin & { discoverRoutes: (routesDir: string) => Promise<DiscoveredRoute[]> } = {
    name: 'protobooth',

    configResolved(config) {
      viteConfig = config;
    },

    configureServer: isEnabled ? (server) => {
      server.middlewares.use('/protobooth', async (req, res, next) => {
        try {
          const url = req.url || '';

          if (url === '/resolve' || url.startsWith('/resolve')) {
            return handleResolveRoute(req, res, { fixtures, viewports });
          } else if (url === '/annotate' || url.startsWith('/annotate')) {
            return handleAnnotateRoute(req, res, { fixtures, viewports });
          } else if (url.startsWith('/assets/')) {
            return handleStaticAssets(req, res, url);
          } else {
            next();
          }
        } catch (error) {
          console.warn('Protobooth middleware error:', error);
          next();
        }
      });
    } : undefined,

    async buildStart() {
      await generateRoutesJson();
    },

    handleHotUpdate: isEnabled ? async (ctx) => {
      // Regenerate routes on file changes in development
      if (ctx.file.includes('/routes/')) {
        await generateRoutesJson();
      }
    } : undefined,

    async discoverRoutes(routesDir: string): Promise<DiscoveredRoute[]> {
      const routes: DiscoveredRoute[] = [];

      try {
        await discoverRoutesRecursive(routesDir, '', routes);
      } catch (error) {
        console.warn('Protobooth: Route discovery failed:', error);
      }

      // Filter out protobooth routes
      return routes.filter(route => !route.path.startsWith('/protobooth'));
    }
  };

  return plugin;
}