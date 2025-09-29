// RED: Write failing integration tests for route injection process
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { RouteInjector } from '@/integrations/route-injector';
import { ViteRouteInjector } from '@/integrations/vite-route-injector';
import { NextjsRouteInjector } from '@/integrations/nextjs-route-injector';
import type { RouteInjectionConfig, InjectedRoute } from '@/types/ui';

describe('Route Injection Integration', () => {
  let mockFileOps: any;
  let mockViteDevServer: any;
  let mockNextjsDevServer: any;

  const testRoutes: InjectedRoute[] = [
    {
      path: '/protobooth/resolve',
      component: 'ResolveUI',
      environment: 'development'
    },
    {
      path: '/protobooth/annotate',
      component: 'AnnotateUI',
      environment: 'staging'
    }
  ];

  beforeAll(() => {
    mockFileOps = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      fileExists: vi.fn().mockResolvedValue(true),
      ensureDir: vi.fn().mockResolvedValue(undefined)
    };

    // Mock Vite dev server
    mockViteDevServer = {
      middlewares: {
        use: vi.fn()
      },
      config: {
        root: '/mock/vite/project'
      },
      ws: {
        send: vi.fn()
      }
    };

    // Mock Next.js dev server
    mockNextjsDevServer = {
      router: {
        add: vi.fn(),
        get: vi.fn(),
        post: vi.fn()
      },
      config: {
        dir: '/mock/nextjs/project'
      }
    };
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RouteInjector Base Class', () => {
    it('should validate route injection config', async () => {
      const injector = new RouteInjector(mockFileOps);

      const validConfig: RouteInjectionConfig = {
        routes: testRoutes,
        environment: 'development',
        projectPath: '/test/project',
        outputDir: '/test/output'
      };

      const result = await injector.validateConfig(validConfig);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid route paths', async () => {
      const injector = new RouteInjector(mockFileOps);

      const invalidConfig: RouteInjectionConfig = {
        routes: [
          {
            path: '/invalid-route', // Should start with /protobooth/
            component: 'InvalidComponent',
            environment: 'development'
          }
        ],
        environment: 'development',
        projectPath: '/test/project',
        outputDir: '/test/output'
      };

      const result = await injector.validateConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Route path must start with /protobooth/');
    });

    it('should accept routes for different environments in config', async () => {
      const injector = new RouteInjector(mockFileOps);

      const mixedConfig: RouteInjectionConfig = {
        routes: [
          {
            path: '/protobooth/annotate',
            component: 'AnnotateUI',
            environment: 'staging' // Different from config environment
          }
        ],
        environment: 'development',
        projectPath: '/test/project',
        outputDir: '/test/output'
      };

      const result = await injector.validateConfig(mixedConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should generate route components correctly', async () => {
      const injector = new RouteInjector(mockFileOps);

      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]], // Development route only
        environment: 'development',
        projectPath: '/test/project',
        outputDir: '/test/output'
      };

      mockFileOps.writeFile.mockResolvedValue(undefined);

      await injector.generateRouteComponents(config);

      expect(mockFileOps.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('ResolveUI.tsx'),
        expect.stringContaining('protobooth-resolve-ui')
      );
    });
  });

  describe('Vite Route Injection', () => {
    let viteInjector: ViteRouteInjector;

    beforeAll(() => {
      viteInjector = new ViteRouteInjector(mockFileOps);
    });

    it('should inject routes into Vite dev server middleware', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]], // Development route only
        environment: 'development',
        projectPath: '/mock/vite/project',
        outputDir: '/test/output'
      };

      await viteInjector.injectRoutes(mockViteDevServer, config);

      // Should register middleware for protobooth routes
      expect(mockViteDevServer.middlewares.use).toHaveBeenCalledWith(
        '/protobooth',
        expect.any(Function)
      );
    });

    it('should handle Vite route requests correctly', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/vite/project',
        outputDir: '/test/output'
      };

      await viteInjector.injectRoutes(mockViteDevServer, config);

      // Get the middleware function that was registered
      const middlewareCall = mockViteDevServer.middlewares.use.mock.calls.find(
        (call: any[]) => call[0] === '/protobooth'
      );
      expect(middlewareCall).toBeDefined();

      const middleware = middlewareCall[1];

      // Mock express-like request/response
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

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('ResolveUI'));
    });

    it('should generate Vite-compatible route definitions', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/vite/project',
        outputDir: '/test/output'
      };

      mockFileOps.writeFile.mockResolvedValue(undefined);

      await viteInjector.generateViteRoutes(config);

      expect(mockFileOps.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('protobooth-routes.ts'),
        expect.stringContaining('createRouter')
      );
    });

    it('should handle Vite HMR updates for route changes', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/vite/project',
        outputDir: '/test/output'
      };

      await viteInjector.injectRoutes(mockViteDevServer, config);

      // Simulate route file change
      await viteInjector.handleRouteUpdate('/protobooth/resolve', 'ResolveUI');

      expect(mockViteDevServer.ws.send).toHaveBeenCalledWith({
        type: 'full-reload',
        path: '/protobooth/resolve'
      });
    });
  });

  describe('Next.js Route Injection', () => {
    let nextjsInjector: NextjsRouteInjector;

    beforeAll(() => {
      nextjsInjector = new NextjsRouteInjector(mockFileOps);
    });

    it('should inject routes into Next.js dev server', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/nextjs/project',
        outputDir: '/test/output'
      };

      await nextjsInjector.injectRoutes(mockNextjsDevServer, config);

      expect(mockNextjsDevServer.router.get).toHaveBeenCalledWith(
        '/protobooth/resolve',
        expect.any(Function)
      );
    });

    it('should handle Next.js route requests correctly', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/nextjs/project',
        outputDir: '/test/output'
      };

      await nextjsInjector.injectRoutes(mockNextjsDevServer, config);

      // Get the route handler that was registered
      const routeCall = mockNextjsDevServer.router.get.mock.calls.find(
        (call: any[]) => call[0] === '/protobooth/resolve'
      );
      expect(routeCall).toBeDefined();

      const routeHandler = routeCall[1];

      // Mock Next.js request/response
      const mockReq = {
        url: '/protobooth/resolve',
        method: 'GET'
      };
      const mockRes = {
        setHeader: vi.fn(),
        end: vi.fn(),
        writeHead: vi.fn()
      };

      await routeHandler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('ResolveUI'));
    });

    it('should generate Next.js App Router compatible files', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/nextjs/project',
        outputDir: '/test/output'
      };

      mockFileOps.writeFile.mockResolvedValue(undefined);

      await nextjsInjector.generateNextjsRoutes(config);

      // Should generate page.tsx files for App Router
      expect(mockFileOps.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('app\\protobooth\\resolve\\page.tsx'),
        expect.stringContaining('export default function ResolveUI')
      );
    });

    it('should generate Next.js Pages Router compatible files', async () => {
      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/nextjs/project',
        outputDir: '/test/output',
        nextjsRouter: 'pages'
      };

      mockFileOps.writeFile.mockResolvedValue(undefined);

      await nextjsInjector.generateNextjsRoutes(config);

      // Should generate files in pages directory
      expect(mockFileOps.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('pages\\protobooth\\resolve.tsx'),
        expect.stringContaining('export default function ResolveUI')
      );
    });
  });

  describe('Environment-Specific Route Injection', () => {
    it('should inject only development routes in development environment', async () => {
      const viteInjector = new ViteRouteInjector(mockFileOps);

      const config: RouteInjectionConfig = {
        routes: testRoutes, // Both development and staging routes
        environment: 'development',
        projectPath: '/mock/vite/project',
        outputDir: '/test/output'
      };

      await viteInjector.injectRoutes(mockViteDevServer, config);

      // Should only set up middleware for development routes
      const middlewareCall = mockViteDevServer.middlewares.use.mock.calls.find(
        (call: any[]) => call[0] === '/protobooth'
      );
      const middleware = middlewareCall[1];

      // Test development route works
      const devReq = { url: '/protobooth/resolve', method: 'GET' };
      const devRes = { setHeader: vi.fn(), end: vi.fn(), writeHead: vi.fn() };
      const devNext = vi.fn();

      await middleware(devReq, devRes, devNext);
      expect(devRes.end).toHaveBeenCalled();

      // Test staging route is not available
      const stagingReq = { url: '/protobooth/annotate', method: 'GET' };
      const stagingRes = { setHeader: vi.fn(), end: vi.fn(), writeHead: vi.fn() };
      const stagingNext = vi.fn();

      await middleware(stagingReq, stagingRes, stagingNext);
      expect(stagingNext).toHaveBeenCalled(); // Should pass through to next middleware
    });

    it('should inject staging routes when simulating staging environment', async () => {
      const viteInjector = new ViteRouteInjector(mockFileOps);

      const config: RouteInjectionConfig = {
        routes: testRoutes,
        environment: 'staging-simulation', // Special development mode
        projectPath: '/mock/vite/project',
        outputDir: '/test/output'
      };

      await viteInjector.injectRoutes(mockViteDevServer, config);

      const middlewareCall = mockViteDevServer.middlewares.use.mock.calls.find(
        (call: any[]) => call[0] === '/protobooth'
      );
      const middleware = middlewareCall[1];

      // Test staging route works in simulation mode
      const stagingReq = { url: '/protobooth/annotate', method: 'GET' };
      const stagingRes = { setHeader: vi.fn(), end: vi.fn(), writeHead: vi.fn() };
      const stagingNext = vi.fn();

      await middleware(stagingReq, stagingRes, stagingNext);
      expect(stagingRes.end).toHaveBeenCalledWith(expect.stringContaining('AnnotateUI'));
    });
  });

  describe('Route Cleanup', () => {
    it('should clean up injected routes when stopping dev server', async () => {
      const viteInjector = new ViteRouteInjector(mockFileOps);

      const config: RouteInjectionConfig = {
        routes: [testRoutes[0]],
        environment: 'development',
        projectPath: '/mock/vite/project',
        outputDir: '/test/output'
      };

      await viteInjector.injectRoutes(mockViteDevServer, config);
      await viteInjector.cleanup();

      expect(mockFileOps.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.protobooth-cleanup.log'),
        expect.stringContaining('Routes cleaned up')
      );
    });

    it('should remove generated route files during cleanup', async () => {
      const viteInjector = new ViteRouteInjector(mockFileOps);

      mockFileOps.remove = vi.fn().mockResolvedValue(undefined);

      await viteInjector.removeGeneratedFiles('/test/output');

      expect(mockFileOps.remove).toHaveBeenCalledWith(expect.stringContaining('protobooth-routes.ts'));
    });
  });
});