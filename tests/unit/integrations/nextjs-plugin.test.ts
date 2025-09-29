import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNextPlugin } from '../../../src/integrations/nextjs-plugin';

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

describe('Next.js Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plugin Creation', () => {
    it('should create a valid Next.js plugin', () => {
      // GREEN: This test should now pass
      const plugin = createNextPlugin();

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('protobooth-nextjs');
      expect(typeof plugin.discoverRoutes).toBe('function');
      expect(typeof plugin.generateRoutesJson).toBe('function');
    });

    it('should accept fixture configuration', () => {
      // GREEN: Test plugin accepts fixtures
      const testFixtures = {
        auth: {
          authenticated: {
            user: { id: '123', name: 'Test User', email: 'test@example.com' },
            token: 'mock-token'
          },
          unauthenticated: null
        }
      };

      const plugin = createNextPlugin({ fixtures: testFixtures });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('protobooth-nextjs');
    });
  });

  describe('Pages Router Route Discovery', () => {
    it('should discover routes from empty pages directory', async () => {
      // GREEN: Test empty directory handling
      const plugin = createNextPlugin();

      // Mock empty directory
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const routes = await plugin.discoverRoutes('/test/pages', 'pages');

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes).toHaveLength(0);
    });

    it('should discover static routes from pages directory', async () => {
      // GREEN: Test static route discovery
      const plugin = createNextPlugin();

      // Mock pages directory with static routes
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: 'index.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: 'about.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      const routes = await plugin.discoverRoutes('/test/pages', 'pages');

      expect(routes).toHaveLength(2);
      expect(routes[0]).toEqual({
        path: '/',
        isDynamic: false,
        filePath: expect.stringContaining('index.tsx')
      });
      expect(routes[1]).toEqual({
        path: '/about',
        isDynamic: false,
        filePath: expect.stringContaining('about.tsx')
      });
    });

    it('should discover dynamic routes with parameters', async () => {
      // GREEN: Test dynamic route discovery
      const plugin = createNextPlugin();

      // Mock pages directory with dynamic routes
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: '[id].tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: '[...slug].tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      const routes = await plugin.discoverRoutes('/test/pages', 'pages');

      expect(routes).toHaveLength(2);
      expect(routes[0]).toEqual({
        path: '/[id]',
        isDynamic: true,
        parameters: ['id'],
        filePath: expect.stringContaining('[id].tsx')
      });
      expect(routes[1]).toEqual({
        path: '/[...slug]',
        isDynamic: true,
        parameters: ['slug'],
        filePath: expect.stringContaining('[...slug].tsx')
      });
    });

    it('should discover nested routes from subdirectories', async () => {
      // GREEN: Test nested route discovery
      const plugin = createNextPlugin();

      // Mock first call to readdir (root pages directory)
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: 'user',
          isFile: () => false,
          isDirectory: () => true
        } as Dirent
      ]);

      // Mock second call to readdir (user subdirectory)
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: 'profile.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      const routes = await plugin.discoverRoutes('/test/pages', 'pages');

      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        path: '/user/profile',
        isDynamic: false,
        filePath: expect.stringContaining('profile.tsx')
      });
    });
  });

  describe('App Router Route Discovery', () => {
    it('should discover routes from app directory with page.tsx files', async () => {
      // GREEN: Test app router page discovery
      const plugin = createNextPlugin();

      // Mock app directory structure
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: 'page.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: 'about',
          isFile: () => false,
          isDirectory: () => true
        } as Dirent
      ]);

      // Mock about subdirectory
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: 'page.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      const routes = await plugin.discoverRoutes('/test/app', 'app');

      expect(routes).toHaveLength(2);
      expect(routes[0]).toEqual({
        path: '/',
        isDynamic: false,
        filePath: expect.stringContaining('page.tsx')
      });
      expect(routes[1]).toEqual({
        path: '/about',
        isDynamic: false,
        filePath: expect.stringContaining('page.tsx')
      });
    });

    it('should discover dynamic routes in app directory', async () => {
      // GREEN: Test app router dynamic routes
      const plugin = createNextPlugin();

      // Mock app directory with dynamic route
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: 'user',
          isFile: () => false,
          isDirectory: () => true
        } as Dirent
      ]);

      // Mock user directory
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: '[id]',
          isFile: () => false,
          isDirectory: () => true
        } as Dirent
      ]);

      // Mock [id] directory
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        {
          name: 'page.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      const routes = await plugin.discoverRoutes('/test/app', 'app');

      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        path: '/user/[id]',
        isDynamic: true,
        parameters: ['id'],
        filePath: expect.stringContaining('page.tsx')
      });
    });
  });

  describe('Route Filtering', () => {
    it('should filter out protobooth routes', async () => {
      // GREEN: Test protobooth route filtering
      const plugin = createNextPlugin();

      // Mock directory with mixed routes
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: 'index.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: 'protobooth',
          isFile: () => false,
          isDirectory: () => true
        } as Dirent
      ]);

      const routes = await plugin.discoverRoutes('/test/pages', 'pages');

      // Should only include non-protobooth routes
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
      expect(routes.some(route => route.path.startsWith('/protobooth'))).toBe(false);
    });

    it('should ignore non-page files', async () => {
      // GREEN: Test file filtering
      const plugin = createNextPlugin();

      // Mock directory with various file types
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: 'index.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: 'styles.css',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: 'component.ts',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent,
        {
          name: '_app.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      const routes = await plugin.discoverRoutes('/test/pages', 'pages');

      // Should only include valid page files
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
    });
  });

  describe('Routes JSON Generation', () => {
    it('should generate routes.json with discovered routes', async () => {
      // GREEN: Test routes.json generation
      const plugin = createNextPlugin({
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
      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: 'index.tsx',
          isFile: () => true,
          isDirectory: () => false
        } as Dirent
      ]);

      await plugin.generateRoutesJson('/test/project', 'pages');

      // Check that writeFile was called with routes.json
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('routes.json'),
        expect.stringContaining('"routes"')
      );
    });
  });
});