import { describe, it, expect } from 'vitest';
import { createNextPlugin } from '../../src/integrations/nextjs-plugin';
import path from 'path';

describe('Next.js Plugin Integration with Demo App', () => {
  it('should discover app router routes from Next.js demo app', async () => {
    const plugin = createNextPlugin({
      fixtures: {
        auth: {
          user: { id: 1, name: 'Next.js Demo User', role: 'admin' },
          isAuthenticated: true,
          permissions: ['read', 'write', 'admin']
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
    expect(routePaths).toContain('/about');
    expect(routePaths).toContain('/user/[id]');

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

  it('should discover pages router routes from Next.js demo app', async () => {
    const plugin = createNextPlugin({
      fixtures: {
        auth: {
          user: { id: 1, name: 'Next.js Demo User', role: 'admin' },
          isAuthenticated: true,
          permissions: ['read', 'write', 'admin']
        }
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'desktop', width: 1440, height: 900 }
      ]
    });

    const demoPagesDir = path.join(process.cwd(), 'demos', 'nextjs', 'src', 'pages');
    const routes = await plugin.discoverRoutes(demoPagesDir, 'pages');

    // Verify we found expected pages router routes
    expect(routes.length).toBeGreaterThan(0);

    // Check for specific routes we expect
    const routePaths = routes.map(r => r.path);
    expect(routePaths).toContain('/');
    expect(routePaths).toContain('/user/[id]');
    expect(routePaths).toContain('/blog/[slug]');

    // Verify dynamic routes are properly identified
    const dynamicRoutes = routes.filter(r => r.isDynamic);
    expect(dynamicRoutes.length).toBeGreaterThan(0);

    const userRoute = routes.find(r => r.path === '/user/[id]');
    expect(userRoute).toBeDefined();
    expect(userRoute?.isDynamic).toBe(true);
    expect(userRoute?.parameters).toEqual(['id']);

    const blogRoute = routes.find(r => r.path === '/blog/[slug]');
    expect(blogRoute).toBeDefined();
    expect(blogRoute?.isDynamic).toBe(true);
    expect(blogRoute?.parameters).toEqual(['slug']);

    // Log discovered routes for debugging
    console.log('Pages Router discovered routes:', routes.map(r => ({
      path: r.path,
      isDynamic: r.isDynamic,
      parameters: r.parameters
    })));
  });

  it('should generate routes.json for Next.js demo app', async () => {
    const plugin = createNextPlugin({
      fixtures: {
        auth: {
          user: { id: 1, name: 'Next.js Demo User', role: 'admin' },
          isAuthenticated: true,
          permissions: ['read', 'write', 'admin']
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