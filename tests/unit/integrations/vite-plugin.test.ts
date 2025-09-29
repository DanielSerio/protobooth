import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createVitePlugin } from '../../../src/integrations/vite-plugin';
import type { FixtureConfig } from '../../../src/types/fixtures';

// Mock fs/promises before any imports that might use it
vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn()
  },
  readdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn()
}));

import fs from 'fs/promises';
import type { Dirent } from 'fs';

describe('Vite Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plugin Creation', () => {
    it('should create a valid Vite plugin', () => {
      // RED: First test - just check basic plugin structure
      const plugin = createVitePlugin();

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('protobooth');
      expect(typeof plugin.configResolved).toBe('function');
      expect(typeof plugin.buildStart).toBe('function');
      expect(typeof plugin.discoverRoutes).toBe('function');
    });

    it('should accept fixture configuration', () => {
      const testFixtures: FixtureConfig = {
        auth: {
          authenticated: {
            user: { id: '123', name: 'Test User', email: 'test@example.com' },
            token: 'mock-token'
          },
          unauthenticated: null
        }
      };

      const plugin = createVitePlugin({ fixtures: testFixtures });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('protobooth');
    });
  });

  describe('Route Discovery', () => {
    it('should discover routes from empty directory', async () => {
      const plugin = createVitePlugin();

      // Mock empty directory
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const routes = await plugin.discoverRoutes('/test/routes');

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes).toHaveLength(0);
    });

    it('should discover static routes from @tanstack/react-router files', async () => {
      const plugin = createVitePlugin();

      // Mock directory with a route file
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: 'index.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      // Mock file content with @tanstack/react-router route
      vi.mocked(fs.readFile).mockResolvedValue(`
        import { createFileRoute } from '@tanstack/react-router'

        export const Route = createFileRoute('/')({
          component: HomeComponent,
        })
      `);

      const routes = await plugin.discoverRoutes('/test/routes');

      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        path: '/',
        isDynamic: false,
        filePath: expect.stringContaining('index.tsx')
      });
    });

    it('should discover dynamic routes with parameters', async () => {
      // RED: Test dynamic route parsing
      const plugin = createVitePlugin();

      // Mock directory with a dynamic route file
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: 'user.$userId.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      // Mock file content with dynamic route
      vi.mocked(fs.readFile).mockResolvedValue(`
        import { createFileRoute } from '@tanstack/react-router'

        export const Route = createFileRoute('/user/$userId')({
          component: UserComponent,
        })
      `);

      const routes = await plugin.discoverRoutes('/test/routes');

      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        path: '/user/$userId',
        isDynamic: true,
        parameters: ['userId'],
        filePath: expect.stringContaining('user.$userId.tsx')
      });
    });

    it('should filter out protobooth routes', async () => {
      // RED: Test filtering protobooth routes - this should pass
      const plugin = createVitePlugin();

      // Mock directory with both regular and protobooth routes
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: 'index.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: 'protobooth.resolve.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      // Mock file content for both routes
      vi.mocked(fs.readFile).mockImplementation((path: string) => {
        if (path.includes('index.tsx')) {
          return Promise.resolve(`
            import { createFileRoute } from '@tanstack/react-router'
            export const Route = createFileRoute('/')({
              component: HomeComponent,
            })
          `);
        } else if (path.includes('protobooth.resolve.tsx')) {
          return Promise.resolve(`
            import { createFileRoute } from '@tanstack/react-router'
            export const Route = createFileRoute('/protobooth/resolve')({
              component: ResolveComponent,
            })
          `);
        }
        return Promise.resolve('');
      });

      const routes = await plugin.discoverRoutes('/test/routes');

      // Should only include non-protobooth routes
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
      expect(routes.some(route => route.path.startsWith('/protobooth'))).toBe(false);
    });
  });

  describe('Build Integration', () => {
    it('should generate routes.json during build', async () => {
      // RED: Test build integration - this might fail due to this context issues
      const plugin = createVitePlugin({
        fixtures: {
          auth: {
            authenticated: {
              user: { id: '123', name: 'Test User', email: 'test@example.com' },
              token: 'mock-token'
            },
            unauthenticated: null
          }
        }
      });

      // Mock route discovery
      vi.mocked(fs.readdir).mockResolvedValue([]);

      // Simulate Vite build process with proper this context
      if (typeof plugin.configResolved === 'function') {
        plugin.configResolved({ root: '/test/project' });
      }

      if (typeof plugin.buildStart === 'function') {
        await plugin.buildStart.call(plugin, {});
      }

      // Check that writeFile was called with routes.json
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('routes.json'),
        expect.stringContaining('"routes"')
      );
    });
  });
});