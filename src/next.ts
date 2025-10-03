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
): NextConfig {
  const { protobooth: protoboothConfig = {} } = config;

  // Create the protobooth plugin
  const plugin = createNextPlugin(protoboothConfig);

  // In a real implementation, we would integrate with Next.js build process
  // For now, we'll add the plugin as a webpack plugin if available
  const modifiedConfig: NextConfig = {
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
    }
  };

  return modifiedConfig;
}

export { createNextPlugin } from './integrations/nextjs-plugin';
export type { NextjsPluginOptions } from './integrations/nextjs-plugin';
export { createNextApiHandler } from './integrations/nextjs-api-handler';