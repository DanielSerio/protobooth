import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNextPlugin } from '../../../src/integrations/nextjs-plugin';

// Mock fs/promises before any imports that might use it
vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn<[], Promise<Dirent<string>[]>>(),
    readFile: vi.fn(),
    writeFile: vi.fn()
  },
  readdir: vi.fn<[], Promise<Dirent<string>[]>>(),
  readFile: vi.fn(),
  writeFile: vi.fn()
}));

import fs from 'fs/promises';
import type { Dirent } from 'fs';

// Helper to create properly typed Dirent mocks
function createMockDirent(name: string, isFile: boolean): Dirent<string> {
  return {
    name,
    isFile: () => isFile,
    isDirectory: () => !isFile,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    path: '',
    parentPath: ''
  };
}

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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValue([]);

      const routes = await plugin.discoverRoutes('/test/pages', 'pages');

      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes).toHaveLength(0);
    });

    it('should discover static routes from pages directory', async () => {
      // GREEN: Test static route discovery
      const plugin = createNextPlugin();

      // Mock pages directory with static routes
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValue([
        createMockDirent('index.tsx', true),
        createMockDirent('about.tsx', true)
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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValue([
          createMockDirent('[id].tsx', true),
          createMockDirent('[...slug].tsx', true)
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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValueOnce([
          createMockDirent('user', false)
        ]);

      // Mock second call to readdir (user subdirectory)
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValueOnce([
          createMockDirent('profile.tsx', true)
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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValueOnce([
          createMockDirent('page.tsx', true),
          createMockDirent('about', false)
        ]);

      // Mock about subdirectory
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValueOnce([
          createMockDirent('page.tsx', true)
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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValueOnce([
          createMockDirent('user', false)
        ]);

      // Mock user directory
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValueOnce([
          createMockDirent('[id]', false)
        ]);

      // Mock [id] directory
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValueOnce([
          createMockDirent('page.tsx', true)
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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValue([
          createMockDirent('index.tsx', true),
          createMockDirent('protobooth', false)
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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValue([
          createMockDirent('index.tsx', true),
          createMockDirent('styles.css', true),
          createMockDirent('component.ts', true),
          createMockDirent('_app.tsx', true)
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
      (fs.readdir as unknown as ReturnType<typeof vi.fn<[], Promise<Dirent<string>[]>>>).mockResolvedValue([
          createMockDirent('index.tsx', true)
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