import type { NextConfig } from 'next';
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
    webpack: (webpackConfig, options) => {
      // Call original webpack config if it exists
      if (nextConfig.webpack) {
        webpackConfig = nextConfig.webpack(webpackConfig, options);
      }

      // Add our protobooth functionality
      if (protoboothConfig.enabled !== false) {
        // In development, set up route discovery
        if (options.dev && !options.isServer) {
          // Schedule route discovery after build
          if (!webpackConfig.plugins) {
            webpackConfig.plugins = [];
          }

          // Add a simple webpack plugin that will trigger route discovery
          webpackConfig.plugins.push({
            apply: (compiler: any) => {
              compiler.hooks.afterCompile.tapAsync('ProtoboothPlugin', async (compilation: any, callback: any) => {
                try {
                  // Determine router type and directory based on Next.js structure
                  const hasAppDir = nextConfig.experimental?.appDir;
                  const routerType = hasAppDir ? 'app' : 'pages';
                  const routesDir = hasAppDir ? 'src/app' : 'src/pages';

                  await plugin.generateRoutesJson(process.cwd(), routesDir);
                } catch (error) {
                  console.warn('Protobooth: Failed to generate routes.json:', error);
                }
                callback();
              });
            }
          });
        }
      }

      return webpackConfig;
    }
  };

  return modifiedConfig;
}

export { createNextPlugin } from './integrations/nextjs-plugin';
export type { NextjsPluginOptions } from './integrations/nextjs-plugin';