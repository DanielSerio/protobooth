import { describe, it, expect } from 'vitest';
import { createVitePlugin } from '@/integrations/vite-plugin';
import { createNextPlugin } from '@/integrations/nextjs-plugin';
import path from 'path';
import type { FixtureConfig } from '@/types/fixtures';

describe('Route Discovery + Fixture Application Integration', () => {
  const fixturesConfig: FixtureConfig = {
    auth: {
      authenticated: {
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' },
        token: 'test-token-123',
        permissions: ['read', 'write', 'admin']
      },
      unauthenticated: null
    },
    dynamicRoutes: {
      '/user/$userId': [
        { userId: '123', name: 'Alice' },
        { userId: '456', name: 'Bob' }
      ],
      '/product/$slug': [
        { slug: 'laptop', title: 'Gaming Laptop' },
        { slug: 'phone', title: 'Smartphone' }
      ]
    },
    globalState: {
      theme: 'dark',
      language: 'en',
      featureFlags: {
        newFeature: true
      }
    }
  };

  describe('Vite (TanStack Router) - Route Discovery', () => {
    it('should discover all routes from TanStack Router demo', async () => {
      const plugin = createVitePlugin({
        fixtures: fixturesConfig,
        viewports: [{ name: 'desktop', width: 1440, height: 900 }]
      });

      const demoRoutesDir = path.join(process.cwd(), 'demos', 'tanstack-router', 'src', 'routes');
      const routes = await plugin.discoverRoutes(demoRoutesDir);

      // Verify we found routes
      expect(routes.length).toBeGreaterThan(0);

      // Check for expected static routes
      const routePaths = routes.map(r => r.path);
      expect(routePaths).toContain('/');
      expect(routePaths).toContain('/about');
      expect(routePaths).toContain('/products');
      expect(routePaths).toContain('/dashboard');
    });

    it('should identify dynamic routes correctly', async () => {
      const plugin = createVitePlugin({
        fixtures: fixturesConfig,
        viewports: [{ name: 'desktop', width: 1440, height: 900 }]
      });

      const demoRoutesDir = path.join(process.cwd(), 'demos', 'tanstack-router', 'src', 'routes');
      const routes = await plugin.discoverRoutes(demoRoutesDir);

      // Find dynamic routes
      const dynamicRoutes = routes.filter(r => r.isDynamic);
      expect(dynamicRoutes.length).toBeGreaterThan(0);

      // Verify user route
      const userRoute = routes.find(r => r.path === '/user/$userId');
      expect(userRoute).toBeDefined();
      expect(userRoute?.isDynamic).toBe(true);
      expect(userRoute?.parameters).toContain('userId');

      // Verify product route
      const productRoute = routes.find(r => r.path === '/product/$slug');
      expect(productRoute).toBeDefined();
      expect(productRoute?.isDynamic).toBe(true);
      expect(productRoute?.parameters).toContain('slug');
    });

    it('should exclude protobooth routes', async () => {
      const plugin = createVitePlugin({
        fixtures: fixturesConfig,
        viewports: [{ name: 'desktop', width: 1440, height: 900 }]
      });

      const demoRoutesDir = path.join(process.cwd(), 'demos', 'tanstack-router', 'src', 'routes');
      const routes = await plugin.discoverRoutes(demoRoutesDir);

      // Verify no protobooth routes
      const protoboothRoutes = routes.filter(r => r.path.startsWith('/protobooth'));
      expect(protoboothRoutes).toHaveLength(0);
    });
  });

  describe('Next.js (App Router) - Route Discovery', () => {
    it('should discover all routes from Next.js demo', async () => {
      const plugin = createNextPlugin({
        fixtures: fixturesConfig,
        viewports: [{ name: 'desktop', width: 1440, height: 900 }],
        routerType: 'app'
      });

      const demoAppDir = path.join(process.cwd(), 'demos', 'nextjs', 'src', 'app');
      const routes = await plugin.discoverRoutes(demoAppDir, 'app');

      // Verify we found routes
      expect(routes.length).toBeGreaterThan(0);

      // Check for expected static routes
      const routePaths = routes.map(r => r.path);
      expect(routePaths).toContain('/');
    });

    it('should identify dynamic routes correctly', async () => {
      const plugin = createNextPlugin({
        fixtures: fixturesConfig,
        viewports: [{ name: 'desktop', width: 1440, height: 900 }],
        routerType: 'app'
      });

      const demoAppDir = path.join(process.cwd(), 'demos', 'nextjs', 'src', 'app');
      const routes = await plugin.discoverRoutes(demoAppDir, 'app');

      // Find dynamic routes
      const dynamicRoutes = routes.filter(r => r.isDynamic);
      expect(dynamicRoutes.length).toBeGreaterThan(0);

      // Verify user route exists
      const userRoute = routes.find(r => r.path.includes('[id]'));
      expect(userRoute).toBeDefined();
      expect(userRoute?.isDynamic).toBe(true);
    });

    it('should exclude protobooth routes', async () => {
      const plugin = createNextPlugin({
        fixtures: fixturesConfig,
        viewports: [{ name: 'desktop', width: 1440, height: 900 }],
        routerType: 'app'
      });

      const demoAppDir = path.join(process.cwd(), 'demos', 'nextjs', 'src', 'app');
      const routes = await plugin.discoverRoutes(demoAppDir, 'app');

      // Verify no protobooth routes
      const protoboothRoutes = routes.filter(r => r.path.includes('protobooth'));
      expect(protoboothRoutes).toHaveLength(0);
    });
  });

});
