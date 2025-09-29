import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withProtobooth } from '../../src/next';
import type { NextConfig } from 'next';

// Mock Next.js types and webpack
const createMockWebpackConfig = () => ({
  plugins: []
});

const mockCompiler = {
  hooks: {
    afterCompile: {
      tapAsync: vi.fn()
    }
  }
};

const mockWebpackOptions = {
  dev: true,
  isServer: false
};

describe('Next.js Route Injection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Webpack Integration', () => {
    it('should add protobooth webpack plugin in development', () => {
      // RED: This test should fail because webpack integration doesn't exist yet
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true,
          fixtures: {
            auth: {
              user: { id: 1, name: 'Test User' },
              isAuthenticated: true
            }
          }
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      expect(modifiedConfig.webpack).toBeDefined();
      expect(typeof modifiedConfig.webpack).toBe('function');

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), mockWebpackOptions);

        // Should add protobooth plugin to webpack
        expect(resultConfig.plugins).toBeDefined();
        expect(resultConfig.plugins.length).toBeGreaterThan(0);

        // Should register afterCompile hook
        const plugin = resultConfig.plugins[0];
        expect(plugin).toBeDefined();
        expect(typeof plugin.apply).toBe('function');

        plugin.apply(mockCompiler);
        expect(mockCompiler.hooks.afterCompile.tapAsync).toHaveBeenCalledWith(
          'ProtoboothPlugin',
          expect.any(Function)
        );
      }
    });

    it('should handle route injection during webpack compilation', async () => {
      // RED: Test route injection during build
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true,
          fixtures: {
            auth: {
              user: { id: 1, name: 'Test User' },
              isAuthenticated: true
            }
          }
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), mockWebpackOptions);
        const plugin = resultConfig.plugins[0];

        let compilationCallback: Function | undefined;

        vi.mocked(mockCompiler.hooks.afterCompile.tapAsync).mockImplementation((name, callback) => {
          compilationCallback = callback;
        });

        plugin.apply(mockCompiler);

        expect(compilationCallback).toBeDefined();

        // Mock compilation and callback
        const mockCompilation = {};
        const mockCallback = vi.fn();

        // Should handle compilation without errors
        if (compilationCallback) {
          await compilationCallback(mockCompilation, mockCallback);
        }

        expect(mockCallback).toHaveBeenCalled();
      }
    });

    it('should not add webpack plugin in production', () => {
      // RED: Test production behavior
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: false // Production mode
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), {
          ...mockWebpackOptions,
          dev: false
        });

        // Should not add protobooth plugin in production
        expect(resultConfig.plugins.length).toBe(0);
      }
    });

    it('should not add webpack plugin on server side', () => {
      // RED: Test server-side behavior
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), {
          ...mockWebpackOptions,
          isServer: true
        });

        // Should not add protobooth plugin for server builds
        expect(resultConfig.plugins.length).toBe(0);
      }
    });

    it('should chain with existing webpack configuration', () => {
      // RED: Test webpack chaining
      const existingWebpack = vi.fn().mockReturnValue({
        ...createMockWebpackConfig(),
        resolve: { alias: { '@': './src' } }
      });

      const nextConfig: NextConfig = {
        webpack: existingWebpack
      };

      const protoboothConfig = {
        protobooth: {
          enabled: true
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), mockWebpackOptions);

        // Should call original webpack function first
        expect(existingWebpack).toHaveBeenCalledWith(expect.objectContaining({ plugins: [] }), mockWebpackOptions);

        // Should preserve existing config and add protobooth plugin
        expect(resultConfig.resolve).toEqual({ alias: { '@': './src' } });
        expect(resultConfig.plugins.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Route Generation', () => {
    it('should detect Pages Router and generate routes', async () => {
      // RED: Test Pages Router detection
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true,
          fixtures: {
            auth: {
              user: { id: 1, name: 'Test User' },
              isAuthenticated: true
            }
          }
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), mockWebpackOptions);
        const plugin = resultConfig.plugins[0];

        let compilationCallback: Function | undefined;

        vi.mocked(mockCompiler.hooks.afterCompile.tapAsync).mockImplementation((name, callback) => {
          compilationCallback = callback;
        });

        plugin.apply(mockCompiler);

        const mockCompilation = {};
        const mockCallback = vi.fn();

        if (compilationCallback) {
          await compilationCallback(mockCompilation, mockCallback);
        }

        // Should attempt to generate routes for Pages Router
        expect(mockCallback).toHaveBeenCalled();
      }
    });

    it('should detect App Router and generate routes', async () => {
      // RED: Test App Router detection
      const nextConfig: NextConfig = {
        experimental: {
          appDir: true
        }
      };

      const protoboothConfig = {
        protobooth: {
          enabled: true,
          fixtures: {
            auth: {
              user: { id: 1, name: 'Test User' },
              isAuthenticated: true
            }
          }
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), mockWebpackOptions);
        const plugin = resultConfig.plugins[0];

        let compilationCallback: Function | undefined;

        vi.mocked(mockCompiler.hooks.afterCompile.tapAsync).mockImplementation((name, callback) => {
          compilationCallback = callback;
        });

        plugin.apply(mockCompiler);

        const mockCompilation = {};
        const mockCallback = vi.fn();

        if (compilationCallback) {
          await compilationCallback(mockCompilation, mockCallback);
        }

        // Should attempt to generate routes for App Router
        expect(mockCallback).toHaveBeenCalled();
      }
    });

    it('should handle route generation errors gracefully', async () => {
      // RED: Test error handling
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      if (modifiedConfig.webpack) {
        const resultConfig = modifiedConfig.webpack(createMockWebpackConfig(), mockWebpackOptions);
        const plugin = resultConfig.plugins[0];

        let compilationCallback: Function | undefined;

        vi.mocked(mockCompiler.hooks.afterCompile.tapAsync).mockImplementation((name, callback) => {
          compilationCallback = callback;
        });

        plugin.apply(mockCompiler);

        const mockCompilation = {};
        const mockCallback = vi.fn();

        // Should handle errors without throwing
        if (compilationCallback) {
          await expect(compilationCallback(mockCompilation, mockCallback)).resolves.not.toThrow();
        }

        expect(mockCallback).toHaveBeenCalled();
      }
    });
  });

  describe('Custom Server Integration', () => {
    it('should provide middleware for custom Next.js servers', () => {
      // RED: Test custom server middleware
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true,
          fixtures: {
            auth: {
              user: { id: 1, name: 'Test User' },
              isAuthenticated: true
            }
          }
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);

      // Should provide middleware export for custom servers
      expect(modifiedConfig.protobooth).toBeDefined();
      expect(modifiedConfig.protobooth.middleware).toBeDefined();
      expect(typeof modifiedConfig.protobooth.middleware).toBe('function');
    });

    it('should handle protobooth routes in custom server middleware', async () => {
      // RED: Test custom server route handling
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true,
          fixtures: {
            auth: {
              user: { id: 1, name: 'Test User' },
              isAuthenticated: true
            }
          }
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);
      const middleware = modifiedConfig.protobooth.middleware;

      const mockReq = {
        url: '/protobooth/resolve',
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn()
      };
      const mockNext = vi.fn();

      await middleware(mockReq, mockRes, mockNext);

      // Should handle protobooth routes
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('<html>'));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass through non-protobooth routes in custom server', async () => {
      // RED: Test passthrough behavior
      const nextConfig: NextConfig = {};
      const protoboothConfig = {
        protobooth: {
          enabled: true
        }
      };

      const modifiedConfig = withProtobooth(nextConfig, protoboothConfig);
      const middleware = modifiedConfig.protobooth.middleware;

      const mockReq = {
        url: '/api/users',
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn()
      };
      const mockNext = vi.fn();

      await middleware(mockReq, mockRes, mockNext);

      // Should call next() for non-protobooth routes
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.end).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Merging', () => {
    it('should merge protobooth config with Next.js config', () => {
      // RED: Test configuration merging
      const existingConfig: NextConfig = {
        env: {
          CUSTOM_KEY: 'value'
        },
        images: {
          domains: ['example.com']
        }
      };

      const protoboothConfig = {
        protobooth: {
          enabled: true,
          fixtures: {
            auth: {
              user: { id: 1, name: 'Test User' },
              isAuthenticated: true
            }
          }
        }
      };

      const modifiedConfig = withProtobooth(existingConfig, protoboothConfig);

      // Should preserve existing Next.js config
      expect(modifiedConfig.env).toEqual({ CUSTOM_KEY: 'value' });
      expect(modifiedConfig.images).toEqual({ domains: ['example.com'] });

      // Should add protobooth-specific configuration
      expect(modifiedConfig.webpack).toBeDefined();
      expect(modifiedConfig.protobooth).toBeDefined();
    });
  });
});