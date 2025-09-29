// RED: Write failing tests for Vite router discovery
import { describe, it, expect, beforeEach } from 'vitest';
import { ViteRouterDiscovery } from '@/core/vite-router-discovery';
// import type { DiscoveredRoute } from '@/types/fixtures'; // Currently unused

describe('ViteRouterDiscovery', () => {
  let discovery: ViteRouterDiscovery;

  beforeEach(() => {
    discovery = new ViteRouterDiscovery();
  });

  describe('discoverRoutes', () => {
    it('should discover static routes from file structure', async () => {
      // Test with our TanStack Router demo structure
      const mockFileStructure = [
        'src/routes/__root.tsx',
        'src/routes/index.tsx',
        'src/routes/about.tsx',
        'src/routes/products.tsx',
        'src/routes/dashboard.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(4); // excluding __root
      expect(routes).toContainEqual({
        path: '/',
        isDynamic: false,
        parameters: []
      });
      expect(routes).toContainEqual({
        path: '/about',
        isDynamic: false,
        parameters: []
      });
      expect(routes).toContainEqual({
        path: '/products',
        isDynamic: false,
        parameters: []
      });
      expect(routes).toContainEqual({
        path: '/dashboard',
        isDynamic: false,
        parameters: []
      });
    });

    it('should discover dynamic routes with parameters', async () => {
      const mockFileStructure = [
        'src/routes/user/$userId.tsx',
        'src/routes/product/$slug.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(2);
      expect(routes).toContainEqual({
        path: '/user/$userId',
        isDynamic: true,
        parameters: ['userId']
      });
      expect(routes).toContainEqual({
        path: '/product/$slug',
        isDynamic: true,
        parameters: ['slug']
      });
    });

    it('should handle nested routes correctly', async () => {
      const mockFileStructure = [
        'src/routes/admin/index.tsx',
        'src/routes/admin/users.tsx',
        'src/routes/admin/settings.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(3);
      expect(routes).toContainEqual({
        path: '/admin',
        isDynamic: false,
        parameters: []
      });
      expect(routes).toContainEqual({
        path: '/admin/users',
        isDynamic: false,
        parameters: []
      });
      expect(routes).toContainEqual({
        path: '/admin/settings',
        isDynamic: false,
        parameters: []
      });
    });

    it('should exclude protobooth routes automatically', async () => {
      const mockFileStructure = [
        'src/routes/index.tsx',
        'src/routes/protobooth/index.tsx',
        'src/routes/protobooth/annotations.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(1);
      expect(routes).toContainEqual({
        path: '/',
        isDynamic: false,
        parameters: []
      });
      // Should not contain any /protobooth routes
      expect(routes.find(r => r.path.includes('protobooth'))).toBeUndefined();
    });

    it('should handle catch-all routes', async () => {
      const mockFileStructure = [
        'src/routes/blog/[...path].tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(1);
      expect(routes).toContainEqual({
        path: '/blog/[...path]',
        isDynamic: true,
        parameters: ['path']
      });
    });
  });

  describe('parseRoutePath', () => {
    it('should convert file path to route path correctly', () => {
      const testCases = [
        { input: 'src/routes/index.tsx', expected: '/' },
        { input: 'src/routes/about.tsx', expected: '/about' },
        { input: 'src/routes/user/$userId.tsx', expected: '/user/$userId' },
        { input: 'src/routes/admin/settings.tsx', expected: '/admin/settings' },
        { input: 'src/routes/blog/[...path].tsx', expected: '/blog/[...path]' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = discovery.parseRoutePath(input);
        expect(result.path).toBe(expected);
      });
    });

    it('should identify dynamic routes correctly', () => {
      const dynamicPaths = [
        'src/routes/user/$userId.tsx',
        'src/routes/blog/[...path].tsx'
      ];

      dynamicPaths.forEach(path => {
        const result = discovery.parseRoutePath(path);
        expect(result.isDynamic).toBe(true);
      });
    });

    it('should extract parameters from dynamic routes', () => {
      const testCases = [
        {
          input: 'src/routes/user/$userId.tsx',
          expectedParams: ['userId']
        },
        {
          input: 'src/routes/product/$slug.tsx',
          expectedParams: ['slug']
        },
        {
          input: 'src/routes/blog/[...path].tsx',
          expectedParams: ['path']
        }
      ];

      testCases.forEach(({ input, expectedParams }) => {
        const result = discovery.parseRoutePath(input);
        expect(result.parameters).toEqual(expectedParams);
      });
    });
  });

  describe('isValidRoute', () => {
    it('should accept valid route files', () => {
      const validFiles = [
        'src/routes/index.tsx',
        'src/routes/about.tsx',
        'src/routes/user/$userId.tsx'
      ];

      validFiles.forEach(file => {
        expect(discovery.isValidRoute(file)).toBe(true);
      });
    });

    it('should reject non-route files', () => {
      const invalidFiles = [
        'src/routes/__root.tsx', // root files excluded
        'src/components/Header.tsx', // not in routes
        'src/routes/utils.ts', // not tsx
        'src/routes/.DS_Store' // system files
      ];

      invalidFiles.forEach(file => {
        expect(discovery.isValidRoute(file)).toBe(false);
      });
    });

    it('should reject protobooth routes', () => {
      const protoboothFiles = [
        'src/routes/protobooth/index.tsx',
        'src/routes/protobooth/annotations.tsx'
      ];

      protoboothFiles.forEach(file => {
        expect(discovery.isValidRoute(file)).toBe(false);
      });
    });
  });
});