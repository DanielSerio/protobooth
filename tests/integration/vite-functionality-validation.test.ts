import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createVitePlugin } from '../../src/integrations/vite-plugin';
import fs from 'fs/promises';
import path from 'path';

// Mock vite dev server for testing
const mockViteDevServer = {
  middlewares: {
    use: vi.fn()
  },
  config: {
    root: process.cwd()
  }
} as any;

describe('Vite Route Injection - Functionality Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Plugin Configuration Validation', () => {
    it('should create plugin with complete configuration', () => {
      const testConfig = {
        dev: true,
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '1', name: 'Test User', email: 'test@example.com' },
              token: 'test-token',
              permissions: ['read', 'write']
            },
            unauthenticated: null
          },
          dynamicRoutes: {
            '/user/$id': [
              { id: '123', name: 'John Doe' },
              { id: '456', name: 'Jane Smith' }
            ]
          },
          globalState: {
            theme: 'light',
            language: 'en',
            featureFlags: { newFeature: true }
          }
        },
        viewports: [
          { name: 'mobile', width: 375, height: 667 },
          { name: 'desktop', width: 1440, height: 900 }
        ],
        routesDir: 'tests/fixtures/routes'
      };

      const plugin = createVitePlugin(testConfig);

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('protobooth');
      expect(plugin.configureServer).toBeDefined();
      expect(plugin.discoverRoutes).toBeDefined();
    });

    it('should handle default configuration', () => {
      const plugin = createVitePlugin();

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('protobooth');
      // Should not have configureServer in production mode (dev: false by default)
      expect(plugin.configureServer).toBeUndefined();
    });
  });

  describe('Route Discovery Validation', () => {
    it('should discover routes from test fixtures', async () => {
      const plugin = createVitePlugin({
        dev: true,
        routesDir: 'tests/fixtures/routes'
      });

      const routes = await plugin.discoverRoutes(path.join(process.cwd(), 'tests/fixtures/routes'));

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);

      // Should find our test routes
      const routePaths = routes.map(r => r.path);
      expect(routePaths).toContain('/');
      expect(routePaths).toContain('/about');
      expect(routePaths).toContain('/user/$id');
      expect(routePaths).toContain('/product/$slug/details');

      // Check dynamic route detection
      const userRoute = routes.find(r => r.path === '/user/$id');
      expect(userRoute?.isDynamic).toBe(true);
      expect(userRoute?.parameters).toEqual(['id']);

      const productRoute = routes.find(r => r.path === '/product/$slug/details');
      expect(productRoute?.isDynamic).toBe(true);
      expect(productRoute?.parameters).toEqual(['slug']);

      // Check static route detection
      const aboutRoute = routes.find(r => r.path === '/about');
      expect(aboutRoute?.isDynamic).toBe(false);
      expect(aboutRoute?.parameters).toBeUndefined();
    });

    it('should handle non-existent routes directory gracefully', async () => {
      const plugin = createVitePlugin({
        dev: true,
        routesDir: 'non-existent-directory'
      });

      const routes = await plugin.discoverRoutes(path.join(process.cwd(), 'non-existent-directory'));

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes).toHaveLength(0);
    });
  });

  describe('HTML Generation Validation', () => {
    it('should generate valid HTML for resolve UI with config injection', async () => {
      const testConfig = {
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '1', name: 'Test User', email: 'test@example.com' },
              token: 'test-token'
            },
            unauthenticated: null
          }
        },
        viewports: [
          { name: 'mobile', width: 375, height: 667 }
        ]
      };

      const plugin = createVitePlugin({ dev: true, ...testConfig });

      let capturedHTML = '';
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn((html: string) => {
          capturedHTML = html;
        }),
        writeHead: vi.fn()
      };

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path: string, handler: Function) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
      });

      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook(mockViteDevServer);
        } else {
          await hook.handler(mockViteDevServer);
        }
      }

      const mockReq = { url: '/resolve', method: 'GET' };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      // Validate HTML structure
      expect(capturedHTML).toContain('<!DOCTYPE html>');
      expect(capturedHTML).toContain('<html>');
      expect(capturedHTML).toContain('<head>');
      expect(capturedHTML).toContain('<title>Protobooth - Development</title>');
      expect(capturedHTML).toContain('<body>');
      expect(capturedHTML).toContain('Protobooth Development UI');
      expect(capturedHTML).toContain('Route injection working! Mode: resolve');

      // Validate config injection
      expect(capturedHTML).toContain('window.__PROTOBOOTH_CONFIG__');
      expect(capturedHTML).toContain(JSON.stringify(testConfig.fixtures));
      expect(capturedHTML).toContain(JSON.stringify(testConfig.viewports));

      // Validate asset links
      expect(capturedHTML).toContain('href="/protobooth/assets/style.css"');
      expect(capturedHTML).toContain('src="/protobooth/assets/app.js"');
    });

    it('should generate valid HTML for annotate UI with config injection', async () => {
      const testConfig = {
        fixtures: {
          dynamicRoutes: {
            '/user/$id': [
              { id: '123', name: 'John Doe' }
            ]
          }
        },
        viewports: [
          { name: 'desktop', width: 1440, height: 900 }
        ]
      };

      const plugin = createVitePlugin({ dev: true, ...testConfig });

      let capturedHTML = '';
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn((html: string) => {
          capturedHTML = html;
        }),
        writeHead: vi.fn()
      };

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path: string, handler: Function) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
      });

      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook(mockViteDevServer);
        } else {
          await hook.handler(mockViteDevServer);
        }
      }

      const mockReq = { url: '/annotate', method: 'GET' };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      // Validate HTML structure
      expect(capturedHTML).toContain('<title>Protobooth - Annotation</title>');
      expect(capturedHTML).toContain('Protobooth Annotation UI');
      expect(capturedHTML).toContain('Route injection working! Mode: annotate');

      // Validate config injection
      expect(capturedHTML).toContain('window.__PROTOBOOTH_CONFIG__');
      expect(capturedHTML).toContain(JSON.stringify(testConfig.fixtures));
      expect(capturedHTML).toContain(JSON.stringify(testConfig.viewports));
    });
  });

  describe('Static Asset Handling Validation', () => {
    it('should serve CSS assets correctly', async () => {
      const plugin = createVitePlugin({ dev: true });

      let capturedResponse = '';
      let capturedContentType = '';
      const mockRes = {
        setHeader: vi.fn((header: string, value: string) => {
          if (header === 'Content-Type') {
            capturedContentType = value;
          }
        }),
        end: vi.fn((content: string) => {
          capturedResponse = content;
        }),
        writeHead: vi.fn()
      };

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path: string, handler: Function) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
      });

      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook(mockViteDevServer);
        } else {
          await hook.handler(mockViteDevServer);
        }
      }

      const mockReq = { url: '/assets/style.css', method: 'GET' };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      expect(capturedContentType).toBe('text/css');
      expect(capturedResponse).toContain('/* Protobooth styles placeholder */');
    });

    it('should serve JavaScript assets correctly', async () => {
      const plugin = createVitePlugin({ dev: true });

      let capturedResponse = '';
      let capturedContentType = '';
      const mockRes = {
        setHeader: vi.fn((header: string, value: string) => {
          if (header === 'Content-Type') {
            capturedContentType = value;
          }
        }),
        end: vi.fn((content: string) => {
          capturedResponse = content;
        }),
        writeHead: vi.fn()
      };

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path: string, handler: Function) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
      });

      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook(mockViteDevServer);
        } else {
          await hook.handler(mockViteDevServer);
        }
      }

      const mockReq = { url: '/assets/app.js', method: 'GET' };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      expect(capturedContentType).toBe('application/javascript');
      expect(capturedResponse).toContain('// Protobooth script placeholder');
    });

    it('should return 404 for unknown assets', async () => {
      const plugin = createVitePlugin({ dev: true });

      let responseStatus = 0;
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn((status: number) => {
          responseStatus = status;
        })
      };

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path: string, handler: Function) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
      });

      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook(mockViteDevServer);
        } else {
          await hook.handler(mockViteDevServer);
        }
      }

      const mockReq = { url: '/assets/unknown.txt', method: 'GET' };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      expect(responseStatus).toBe(404);
    });
  });

  describe('Routes.json Generation Validation', () => {
    it('should generate routes.json with correct structure', async () => {
      const testConfig = {
        dev: true,
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '1', name: 'Test User', email: 'test@example.com' },
              token: 'test-token'
            },
            unauthenticated: null
          }
        },
        viewports: [
          { name: 'mobile', width: 375, height: 667 }
        ],
        routesDir: 'tests/fixtures/routes'
      };

      // Mock the config for buildStart
      const mockConfig = {
        root: process.cwd()
      };

      const plugin = createVitePlugin(testConfig);

      // Mock configResolved to set up the vite config
      if (plugin.configResolved) {
        const hook = plugin.configResolved;
        if (typeof hook === 'function') {
          hook(mockConfig as any);
        } else {
          hook.handler(mockConfig as any);
        }
      }

      // Mock fs.writeFile to capture the routes.json content
      let capturedContent = '';
      const originalWriteFile = fs.writeFile;
      vi.mocked(fs).writeFile = vi.fn(async (_filePath: string, content: string) => {
        capturedContent = content;
        return Promise.resolve();
      }) as any;

      // Trigger buildStart
      if (plugin.buildStart) {
        const hook = plugin.buildStart;
        if (typeof hook === 'function') {
          await hook.call({} as any, {} as any);
        } else {
          await hook.handler.call({} as any, {} as any);
        }
      }

      // Restore original function
      fs.writeFile = originalWriteFile;

      expect(capturedContent).toBeTruthy();

      const routesData = JSON.parse(capturedContent);
      expect(routesData).toBeDefined();
      expect(routesData.routes).toBeDefined();
      expect(routesData.fixtures).toBeDefined();
      expect(routesData.viewports).toBeDefined();
      expect(routesData.timestamp).toBeDefined();

      // Validate fixtures are preserved
      expect(routesData.fixtures.auth.authenticated.user.name).toBe('Test User');
      expect(routesData.viewports).toHaveLength(1);
      expect(routesData.viewports[0].name).toBe('mobile');

      // Validate timestamp format
      expect(() => new Date(routesData.timestamp)).not.toThrow();
    });
  });

  describe('Error Handling Validation', () => {
    it('should handle route discovery errors gracefully', async () => {
      const plugin = createVitePlugin({
        dev: true,
        routesDir: 'invalid/path'
      });

      // Should not throw even with invalid path
      const routes = await plugin.discoverRoutes('/invalid/path/that/does/not/exist');

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes).toHaveLength(0);
    });

    it('should handle middleware errors gracefully', async () => {
      const plugin = createVitePlugin({ dev: true });

      // Mock a middleware that throws
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn(() => {
          throw new Error('Mock error');
        })
      };

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path: string, handler: Function) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
      });

      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook(mockViteDevServer);
        } else {
          await hook.handler(mockViteDevServer);
        }
      }

      const mockReq = { url: '/resolve', method: 'GET' };
      const mockNext = vi.fn();

      // Should not throw error (error is caught and handled gracefully)
      await expect((async () => {
        if (middlewareHandler) {
          await middlewareHandler(mockReq, mockRes, mockNext);
        }
      })()).resolves.not.toThrow();
    });
  });
});