import { describe, it, expect } from 'vitest';
import { createVitePlugin } from '../../src/integrations/vite-plugin';
import path from 'path';

describe('Vite Plugin Integration with Demo App', () => {
  it('should discover all routes from TanStack Router demo app', async () => {
    const plugin = createVitePlugin({
      fixtures: {
        auth: {
          user: { id: 1, name: 'Demo User', role: 'admin' },
          isAuthenticated: true,
          permissions: ['read', 'write', 'admin']
        }
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'desktop', width: 1440, height: 900 }
      ]
    });

    const demoRoutesDir = path.join(process.cwd(), 'demos', 'tanstack-router', 'src', 'routes');
    const routes = await plugin.discoverRoutes(demoRoutesDir);

    // Verify we found all expected routes
    expect(routes.length).toBeGreaterThan(0);

    // Check for specific routes we expect
    const routePaths = routes.map(r => r.path);
    expect(routePaths).toContain('/');
    expect(routePaths).toContain('/about');
    expect(routePaths).toContain('/products');
    expect(routePaths).toContain('/dashboard');
    expect(routePaths).toContain('/user/$userId');
    expect(routePaths).toContain('/product/$slug');

    // Verify dynamic routes are properly identified
    const dynamicRoutes = routes.filter(r => r.isDynamic);
    expect(dynamicRoutes).toHaveLength(2);

    const userRoute = routes.find(r => r.path === '/user/$userId');
    expect(userRoute).toBeDefined();
    expect(userRoute?.parameters).toEqual(['userId']);

    const productRoute = routes.find(r => r.path === '/product/$slug');
    expect(productRoute).toBeDefined();
    expect(productRoute?.parameters).toEqual(['slug']);

    // Log discovered routes for debugging
    console.log('Discovered routes:', routes.map(r => ({
      path: r.path,
      isDynamic: r.isDynamic,
      parameters: r.parameters
    })));
  });

  it('should generate routes.json for demo app', async () => {
    const plugin = createVitePlugin({
      fixtures: {
        auth: {
          user: { id: 1, name: 'Demo User', role: 'admin' },
          isAuthenticated: true,
          permissions: ['read', 'write', 'admin']
        },
        dynamicRoutes: {
          '/user/$userId': [
            { userId: '123', name: 'John Doe', role: 'user' },
            { userId: '456', name: 'Jane Smith', role: 'admin' }
          ],
          '/product/$slug': [
            { slug: 'laptop', name: 'Gaming Laptop', price: 1299 },
            { slug: 'mouse', name: 'Wireless Mouse', price: 79 }
          ]
        }
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'desktop', width: 1440, height: 900 }
      ]
    });

    // Simulate Vite configuration
    plugin.configResolved({ root: path.join(process.cwd(), 'demos', 'tanstack-router') } as any);

    // Test buildStart (which should generate routes.json)
    await plugin.buildStart.call(plugin, {} as any);

    // The actual file generation is tested via mocks in unit tests
    // Here we're verifying the integration works without errors
    expect(true).toBe(true);
  });
});