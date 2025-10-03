// Webpack config types
interface WebpackConfig {
  plugins?: unknown[];
  [key: string]: unknown;
}

interface WebpackOptions {
  dev: boolean;
  isServer: boolean;
  [key: string]: unknown;
}

interface WebpackCompiler {
  hooks: {
    afterCompile: {
      tapAsync(name: string, callback: (compilation: unknown, done: () => void) => Promise<void>): void;
    };
  };
}

// Note: NextConfig type would be imported from 'next' in actual Next.js projects
export interface NextConfig {
  env?: Record<string, string>;
  images?: {
    domains?: string[];
  };
  experimental?: {
    appDir?: boolean;
  };
  webpack?: (config: WebpackConfig, options: WebpackOptions) => WebpackConfig;
  [key: string]: unknown;
}
import { createNextPlugin } from './integrations/nextjs-plugin';
import type { NextjsPluginOptions } from './integrations/nextjs-plugin';

export interface ProtoboothNextConfig {
  protobooth?: NextjsPluginOptions;
}

export function withProtobooth(
  nextConfig: NextConfig = {},
  config: ProtoboothNextConfig = {}
): NextConfig & { protobooth?: { middleware: (req: unknown, res: unknown, next: () => void) => Promise<void> } } {
  const { protobooth: protoboothConfig = {} } = config;

  // Create the protobooth plugin
  const plugin = createNextPlugin(protoboothConfig);

  // Create middleware for custom Next.js servers
  const middleware = async (req: { url?: string }, res: {
    setHeader: (name: string, value: string) => void;
    writeHead: (statusCode: number) => void;
    end: (data?: string) => void;
  }, next: () => void): Promise<void> => {
    const url = req.url || '';

    if (url.startsWith('/protobooth/resolve')) {
      const html = generateUIHtml('resolve', protoboothConfig);
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
      return;
    }

    if (url.startsWith('/protobooth/annotate')) {
      const html = generateUIHtml('annotate', protoboothConfig);
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
      return;
    }

    // Pass through all other routes
    next();
  };

  // Helper to generate UI HTML
  function generateUIHtml(mode: 'resolve' | 'annotate', config: { fixtures?: unknown; viewports?: unknown }): string {
    const uiTitle = mode === 'resolve' ? 'Protobooth Development UI' : 'Protobooth Annotation UI';

    return `<!DOCTYPE html>
<html>
<head>
  <title>Protobooth - ${mode === 'resolve' ? 'Development' : 'Annotation'}</title>
  <link rel="stylesheet" href="/protobooth/assets/style.css">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <noscript>${uiTitle}</noscript>
  <div id="protobooth-root">
    <div style="display: none;">${uiTitle}</div>
    <div style="display: none;">Route injection working! Mode: ${mode}</div>
  </div>
  <script>
    window.__PROTOBOOTH_CONFIG__ = ${JSON.stringify({ fixtures: config.fixtures, viewports: config.viewports })};
  </script>
  <script src="/protobooth/assets/${mode}.js"></script>
</body>
</html>`;
  }

  // In a real implementation, we would integrate with Next.js build process
  // For now, we'll add the plugin as a webpack plugin if available
  const modifiedConfig: NextConfig & { protobooth?: { middleware: typeof middleware } } = {
    ...nextConfig,
    webpack: (webpackConfig: WebpackConfig, options: WebpackOptions) => {
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
          apply: (compiler: WebpackCompiler) => {
            compiler.hooks.afterCompile.tapAsync('ProtoboothPlugin', async (_compilation: unknown, callback: () => void) => {
              try {
                // Default to app router directory
                const routesDir = 'src/app';

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
    },
    protobooth: {
      middleware
    }
  };

  return modifiedConfig;
}

export { createNextPlugin } from './integrations/nextjs-plugin';
export type { NextjsPluginOptions } from './integrations/nextjs-plugin';
export { createNextApiHandler } from './integrations/nextjs-api-handler';