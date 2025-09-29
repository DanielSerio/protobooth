// Note: NextConfig type would be imported from 'next' in actual Next.js projects
export interface NextConfig {
  env?: Record<string, string>;
  images?: {
    domains?: string[];
  };
  experimental?: {
    appDir?: boolean;
  };
  webpack?: (config: any, options: any) => any;
  [key: string]: any;
}
import { createNextPlugin } from './integrations/nextjs-plugin';
import type { NextjsPluginOptions } from './integrations/nextjs-plugin';

export interface ProtoboothNextConfig {
  protobooth?: NextjsPluginOptions;
}

export function withProtobooth(
  nextConfig: NextConfig = {},
  config: ProtoboothNextConfig = {}
): NextConfig {
  const { protobooth: protoboothConfig = {} } = config;

  // Create the protobooth plugin
  const plugin = createNextPlugin(protoboothConfig);

  // Create middleware for custom servers
  const middleware = async (req: any, res: any, next: any) => {
    try {
      const url = req.url || '';

      if (url.startsWith('/protobooth')) {
        const path = url.replace('/protobooth', '');

        if (path === '/resolve' || path.startsWith('/resolve')) {
          return handleResolveRoute(req, res, protoboothConfig);
        } else if (path === '/annotate' || path.startsWith('/annotate')) {
          return handleAnnotateRoute(req, res, protoboothConfig);
        } else if (path.startsWith('/assets/')) {
          return handleStaticAssets(req, res, path);
        }
      }

      next();
    } catch (error) {
      console.warn('Protobooth middleware error:', error);
      next();
    }
  };

  // In a real implementation, we would integrate with Next.js build process
  // For now, we'll add the plugin as a webpack plugin if available
  const modifiedConfig: NextConfig & { protobooth?: { middleware: Function } } = {
    ...nextConfig,
    protobooth: {
      middleware
    },
    webpack: (webpackConfig: any, options: any) => {
      // Call original webpack config if it exists
      if (nextConfig.webpack) {
        webpackConfig = nextConfig.webpack(webpackConfig, options);
      }

      // Add our protobooth functionality
      if (protoboothConfig.enabled !== false && options.dev && !options.isServer) {
        // In development, set up route discovery
        // Schedule route discovery after build
        if (!webpackConfig.plugins) {
          webpackConfig.plugins = [];
        }

        // Add a simple webpack plugin that will trigger route discovery
        webpackConfig.plugins.push({
          apply: (compiler: any) => {
            compiler.hooks.afterCompile.tapAsync('ProtoboothPlugin', async (_compilation: any, callback: any) => {
              try {
                // Default to pages router directory
                const routesDir = 'src/pages';

                await plugin.generateRoutesJson(process.cwd(), routesDir);
              } catch (error) {
                console.warn('Protobooth: Failed to generate routes.json:', error);
              }
              callback();
            });
          }
        });
      }

      return webpackConfig;
    }
  };

  return modifiedConfig;
}

// Route handlers for Next.js
function handleResolveRoute(_req: any, res: any, config: NextjsPluginOptions): void {
  const html = generateUIHtml('resolve', config);
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
}

function handleAnnotateRoute(_req: any, res: any, config: NextjsPluginOptions): void {
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

function generateUIHtml(mode: 'resolve' | 'annotate', config: NextjsPluginOptions): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Protobooth - ${mode === 'resolve' ? 'Development' : 'Annotation'}</title>
  <link rel="stylesheet" href="/protobooth/assets/style.css">
</head>
<body>
  <div id="protobooth-root">
    <h1>Protobooth ${mode === 'resolve' ? 'Development UI' : 'Annotation UI'}</h1>
    <p>Next.js route injection working! Mode: ${mode}</p>
  </div>
  <script>
    window.__PROTOBOOTH_CONFIG__ = ${JSON.stringify(config)};
  </script>
  <script src="/protobooth/assets/app.js"></script>
</body>
</html>`;
}

export { createNextPlugin } from './integrations/nextjs-plugin';
export type { NextjsPluginOptions } from './integrations/nextjs-plugin';