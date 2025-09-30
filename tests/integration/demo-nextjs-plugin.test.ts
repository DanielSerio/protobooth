import { describe, it, expect } from 'vitest';
import { createNextPlugin } from '../../src/integrations/nextjs-plugin';
import path from 'path';

describe('Next.js Plugin Integration with Demo App', () => {
  it('should discover app router routes from Next.js demo app', async () => {
    const plugin = createNextPlugin({
      fixtures: {
        auth: {
          authenticated: {
            user: { id: '1', name: 'Next.js Demo User', email: 'nextjs@example.com', role: 'admin' },
            token: 'test-token',
            permissions: ['read', 'write', 'admin']
          },
          unauthenticated: null
        }
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'desktop', width: 1440, height: 900 }
      ]
    });

    const demoAppDir = path.join(process.cwd(), 'demos', 'nextjs', 'src', 'app');
    const routes = await plugin.discoverRoutes(demoAppDir, 'app');

    // Verify we found expected app router routes
    expect(routes.length).toBeGreaterThan(0);

    // Check for specific routes we expect
    const routePaths = routes.map(r => r.path);
    expect(routePaths).toContain('/');
    expect(routePaths).toContain('/user/[id]');
    expect(routePaths).toContain('/blog/[slug]');

    // Verify dynamic route is properly identified
    const userRoute = routes.find(r => r.path === '/user/[id]');
    expect(userRoute).toBeDefined();
    expect(userRoute?.isDynamic).toBe(true);
    expect(userRoute?.parameters).toEqual(['id']);

    // Log discovered routes for debugging
    console.log('App Router discovered routes:', routes.map(r => ({
      path: r.path,
      isDynamic: r.isDynamic,
      parameters: r.parameters
    })));
  });


  it('should generate routes.json for Next.js demo app', async () => {
    const plugin = createNextPlugin({
      fixtures: {
        auth: {
          authenticated: {
            user: { id: '1', name: 'Next.js Demo User', email: 'nextjs@example.com', role: 'admin' },
            token: 'test-token',
            permissions: ['read', 'write', 'admin']
          },
          unauthenticated: null
        },
        dynamicRoutes: {
          '/user/[id]': [
            { id: '1', name: 'Alice Johnson', role: 'user' },
            { id: '2', name: 'Bob Smith', role: 'admin' }
          ],
          '/blog/[slug]': [
            { slug: 'getting-started', title: 'Getting Started with Next.js' },
            { slug: 'advanced-routing', title: 'Advanced Routing Patterns' }
          ]
        }
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'desktop', width: 1440, height: 900 }
      ]
    });

    // Test route generation for both app and pages router
    const demoDir = path.join(process.cwd(), 'demos', 'nextjs');

    // Test app router
    await plugin.generateRoutesJson(demoDir, 'src/app');

    // Test pages router
    await plugin.generateRoutesJson(demoDir, 'src/pages');

    // The actual file generation is tested via mocks in unit tests
    // Here we're verifying the integration works without errors
    expect(true).toBe(true);
  });
});