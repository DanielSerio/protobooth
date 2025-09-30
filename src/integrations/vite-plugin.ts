// GREEN: Minimal implementation to make tests pass
import type { Plugin, ResolvedConfig } from 'vite';
import type { FixtureConfig } from '@/types/fixtures';
import type { ViewportConfig } from '@/types/screenshot';
import path from 'path';
import { fileURLToPath } from 'url';
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

  // Handler response interface
  interface ViteHandlerResponse {
    setHeader(name: string, value: string): void;
    writeHead(statusCode: number): void;
    end(data?: string): void;
  }

  // Route handlers
  function handleResolveRoute(_req: unknown, res: ViteHandlerResponse, config: { fixtures: FixtureConfig; viewports: ViewportConfig[] }): void {
    const html = generateUIHtml('resolve', config);
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  }

  function handleAnnotateRoute(_req: unknown, res: ViteHandlerResponse, config: { fixtures: FixtureConfig; viewports: ViewportConfig[] }): void {
    const html = generateUIHtml('annotate', config);
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  }

  async function handleStaticAssets(_req: unknown, res: ViteHandlerResponse, url: string): Promise<void> {
    if (url.endsWith('.css')) {
      // Serve the built CSS bundle
      try {
        // When this file is compiled, it will be in dist/vite.js or dist/vite.mjs
        // The UI bundle is in dist/ui/
        // Use Node's fileURLToPath to properly handle file:// URLs on all platforms
        const currentFile = fileURLToPath(import.meta.url);
        const distDir = path.dirname(currentFile);
        const cssPath = path.join(distDir, 'ui', 'protobooth.css');
        const css = await fs.readFile(cssPath, 'utf-8');
        res.setHeader('Content-Type', 'text/css');
        res.end(css);
      } catch (error) {
        res.setHeader('Content-Type', 'text/css');
        res.end('/* Failed to load protobooth styles */');
      }
    } else if (url === '/assets/resolve.js' || url === '/assets/annotate.js') {
      // Serve pre-built UI bundle
      const mode = url === '/assets/resolve.js' ? 'resolve' : 'annotate';

      try {
        // When this file is compiled, it will be in dist/vite.js or dist/vite.mjs
        // The UI bundle is in dist/ui/
        // Use Node's fileURLToPath to properly handle file:// URLs on all platforms
        const currentFile = fileURLToPath(import.meta.url);
        const distDir = path.dirname(currentFile);
        const bundlePath = path.join(distDir, 'ui', `${mode}.js`);
        console.log('[Protobooth] Loading UI bundle from:', bundlePath);
        const bundle = await fs.readFile(bundlePath, 'utf-8');
        res.setHeader('Content-Type', 'application/javascript');
        res.end(bundle);
      } catch (error) {
        console.error('[Protobooth] Failed to load UI bundle:', error);
        res.writeHead(500);
        res.end(`console.error('Failed to load Protobooth UI bundle: ${error}');`);
      }
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
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="protobooth-root"></div>
  <script>
    window.__PROTOBOOTH_CONFIG__ = ${JSON.stringify(config)};
  </script>
  <script src="/protobooth/assets/${mode}.js"></script>
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
          } else if (url.startsWith('/api/files/')) {
            // Handle file API requests
            const filename = decodeURIComponent(url.replace('/api/files/', ''));
            const projectRoot = viteConfig?.root || process.cwd();
            const filePath = path.join(projectRoot, filename);

            if (req.method === 'GET') {
              try {
                const content = await fs.readFile(filePath, 'utf-8');
                res.setHeader('Content-Type', 'text/plain');
                res.end(content);
              } catch (error) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'File not found' }));
              }
            } else if (req.method === 'HEAD') {
              try {
                await fs.access(filePath);
                res.writeHead(200);
                res.end();
              } catch (error) {
                res.writeHead(404);
                res.end();
              }
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const { content } = JSON.parse(body);
                  await fs.writeFile(filePath, content, 'utf-8');
                  res.writeHead(200);
                  res.end(JSON.stringify({ success: true }));
                } catch (error) {
                  res.writeHead(500);
                  res.end(JSON.stringify({ error: 'Failed to write file' }));
                }
              });
            } else {
              res.writeHead(405);
              res.end();
            }
            return;
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