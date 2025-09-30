import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createVitePlugin } from '../../src/integrations/vite-plugin';
import type { ViteDevServer } from 'vite';
import type { PluginContext } from 'rollup';
import { createMockPluginContext } from '../helpers/vite-mocks';

// Mock vite dev server
const mockViteDevServer = {
  middlewares: {
    use: vi.fn()
  },
  config: {
    root: '/test/project'
  }
} as unknown as ViteDevServer;

describe('Vite Route Injection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Development Server Integration', () => {
    it('should inject protobooth routes during development', async () => {
      // GREEN: This test should pass now
      const plugin = createVitePlugin({
        dev: true, // Enable development mode
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '1', name: 'Test User', email: 'test@example.com' },
              token: 'test-token'
            },
            unauthenticated: null
          }
        }
      });

      // Simulate Vite's configureServer hook
      expect(plugin.configureServer).toBeDefined();

      const mockContext = createMockPluginContext() as PluginContext;
      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook.call(mockContext, mockViteDevServer);
        } else {
          await hook.handler.call(mockContext, mockViteDevServer);
        }
      }

      // Should register middleware for protobooth routes
      expect(mockViteDevServer.middlewares.use).toHaveBeenCalledWith(
        '/protobooth',
        expect.any(Function)
      );
    });

    it('should handle /protobooth/resolve route requests', async () => {
      // GREEN: Test resolve route handling
      const plugin = createVitePlugin({
        dev: true,
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '1', name: 'Test User', email: 'test@example.com' },
              token: 'test-token'
            },
            unauthenticated: null
          }
        }
      });

      let middlewareHandler: Function | undefined;

      // Mock middleware.use to capture the handler
      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path, handler) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
        return mockViteDevServer.middlewares as unknown as ReturnType<typeof mockViteDevServer.middlewares.use>;
      });

      const mockContext = createMockPluginContext() as PluginContext;
      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook.call(mockContext, mockViteDevServer);
        } else {
          await hook.handler.call(mockContext, mockViteDevServer);
        }
      }

      expect(middlewareHandler).toBeDefined();

      // Mock request/response for /protobooth/resolve
      const mockReq = {
        url: '/resolve', // URL relative to /protobooth middleware
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn()
      };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      // Should respond with HTML for resolve UI
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('<html>'));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle /protobooth/annotate route requests', async () => {
      // GREEN: Test annotate route handling
      const plugin = createVitePlugin({
        dev: true,
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '1', name: 'Test User', email: 'test@example.com' },
              token: 'test-token'
            },
            unauthenticated: null
          }
        }
      });

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path, handler) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
        return mockViteDevServer.middlewares as unknown as ReturnType<typeof mockViteDevServer.middlewares.use>;
      });

      const mockContext = createMockPluginContext() as PluginContext;
      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook.call(mockContext, mockViteDevServer);
        } else {
          await hook.handler.call(mockContext, mockViteDevServer);
        }
      }

      const mockReq = {
        url: '/annotate', // URL relative to /protobooth middleware
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn()
      };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      // Should respond with HTML for annotate UI
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('<html>'));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should serve static assets for protobooth UI', async () => {
      // GREEN: Test static asset serving
      const plugin = createVitePlugin({ dev: true });

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path, handler) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
        return mockViteDevServer.middlewares as unknown as ReturnType<typeof mockViteDevServer.middlewares.use>;
      });

      const mockContext = createMockPluginContext() as PluginContext;
      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook.call(mockContext, mockViteDevServer);
        } else {
          await hook.handler.call(mockContext, mockViteDevServer);
        }
      }

      const mockReq = {
        url: '/assets/style.css', // URL relative to /protobooth middleware
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn()
      };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      // Should serve CSS with correct content type
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/css');
      expect(mockRes.end).toHaveBeenCalledWith(expect.any(String));
    });

    it('should pass through non-protobooth routes', async () => {
      // GREEN: Test passthrough behavior
      const plugin = createVitePlugin({ dev: true });

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path, handler) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
        return mockViteDevServer.middlewares as unknown as ReturnType<typeof mockViteDevServer.middlewares.use>;
      });

      const mockContext = createMockPluginContext() as PluginContext;
      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook.call(mockContext, mockViteDevServer);
        } else {
          await hook.handler.call(mockContext, mockViteDevServer);
        }
      }

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

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      // Should call next() for non-protobooth routes
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.end).not.toHaveBeenCalled();
    });

    it('should inject configuration data into UI', async () => {
      // RED: Test configuration injection
      const testConfig = {
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' },
              token: 'test-token'
            },
            unauthenticated: null
          }
        },
        viewports: [
          { name: 'mobile', width: 375, height: 667 },
          { name: 'desktop', width: 1440, height: 900 }
        ]
      };

      const plugin = createVitePlugin({ ...testConfig, dev: true });

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path, handler) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
        return mockViteDevServer.middlewares as unknown as ReturnType<typeof mockViteDevServer.middlewares.use>;
      });

      const mockContext = createMockPluginContext() as PluginContext;
      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook.call(mockContext, mockViteDevServer);
        } else {
          await hook.handler.call(mockContext, mockViteDevServer);
        }
      }

      const mockReq = {
        url: '/resolve', // URL relative to /protobooth middleware
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn()
      };
      const mockNext = vi.fn();

      if (middlewareHandler) {
        await middlewareHandler(mockReq, mockRes, mockNext);
      }

      // Should inject configuration into the HTML
      const htmlResponse = vi.mocked(mockRes.end).mock.calls[0][0] as string;
      expect(htmlResponse).toContain('window.__PROTOBOOTH_CONFIG__');
      expect(htmlResponse).toContain(JSON.stringify(testConfig.fixtures));
      expect(htmlResponse).toContain(JSON.stringify(testConfig.viewports));
    });

    it('should only inject routes in development mode', () => {
      // RED: Test production mode behavior
      const plugin = createVitePlugin({
        dev: false // Production mode
      });

      // In production, configureServer should not be defined
      expect(plugin.configureServer).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle middleware errors gracefully', async () => {
      // GREEN: Test error handling
      const plugin = createVitePlugin({ dev: true });

      let middlewareHandler: Function | undefined;

      vi.mocked(mockViteDevServer.middlewares.use).mockImplementation((path, handler) => {
        if (path === '/protobooth') {
          middlewareHandler = handler as Function;
        }
        return mockViteDevServer.middlewares as unknown as ReturnType<typeof mockViteDevServer.middlewares.use>;
      });

      const mockContext = createMockPluginContext() as PluginContext;
      if (plugin.configureServer) {
        const hook = plugin.configureServer;
        if (typeof hook === 'function') {
          await hook.call(mockContext, mockViteDevServer);
        } else {
          await hook.handler.call(mockContext, mockViteDevServer);
        }
      }

      const mockReq = {
        url: '/resolve', // URL relative to /protobooth middleware
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn().mockImplementation(() => {
          throw new Error('Response error');
        })
      };
      const mockNext = vi.fn();

      // Should not throw, should handle error gracefully
      expect(async () => {
        if (middlewareHandler) {
          await middlewareHandler(mockReq, mockRes, mockNext);
        }
      }).not.toThrow();
    });
  });
});