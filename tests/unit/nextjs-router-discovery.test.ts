// RED: Write failing tests for Next.js router discovery
import { describe, it, expect, beforeEach } from 'vitest';
import { NextjsRouterDiscovery } from '@/core/nextjs-router-discovery';
// import type { DiscoveredRoute } from '@/types/fixtures'; // Currently unused

describe('NextjsRouterDiscovery', () => {
  let discovery: NextjsRouterDiscovery;

  beforeEach(() => {
    discovery = new NextjsRouterDiscovery();
  });

  describe('discoverRoutes', () => {
    it('should discover App Router static routes', async () => {
      const mockFileStructure = [
        'src/app/page.tsx',
        'src/app/about/page.tsx',
        'src/app/products/page.tsx',
        'src/app/dashboard/page.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(4);
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

    it('should discover App Router dynamic routes', async () => {
      const mockFileStructure = [
        'src/app/user/[userId]/page.tsx',
        'src/app/product/[slug]/page.tsx',
        'src/app/blog/[...path]/page.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(3);
      expect(routes).toContainEqual({
        path: '/user/[userId]',
        isDynamic: true,
        parameters: ['userId']
      });
      expect(routes).toContainEqual({
        path: '/product/[slug]',
        isDynamic: true,
        parameters: ['slug']
      });
      expect(routes).toContainEqual({
        path: '/blog/[...path]',
        isDynamic: true,
        parameters: ['path']
      });
    });

    it('should discover Pages Router static routes', async () => {
      const mockFileStructure = [
        'src/pages/index.tsx',
        'src/pages/about.tsx',
        'src/pages/contact.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(3);
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
        path: '/contact',
        isDynamic: false,
        parameters: []
      });
    });

    it('should discover Pages Router dynamic routes', async () => {
      const mockFileStructure = [
        'src/pages/user/[id].tsx',
        'src/pages/post/[...slug].tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(2);
      expect(routes).toContainEqual({
        path: '/user/[id]',
        isDynamic: true,
        parameters: ['id']
      });
      expect(routes).toContainEqual({
        path: '/post/[...slug]',
        isDynamic: true,
        parameters: ['slug']
      });
    });

    it('should handle nested App Router routes', async () => {
      const mockFileStructure = [
        'src/app/admin/page.tsx',
        'src/app/admin/users/page.tsx',
        'src/app/admin/settings/page.tsx'
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
        'src/app/page.tsx',
        'src/app/protobooth/page.tsx',
        'src/app/protobooth/annotations/page.tsx',
        'src/pages/index.tsx',
        'src/pages/protobooth/index.tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(2);
      expect(routes).toContainEqual({
        path: '/',
        isDynamic: false,
        parameters: []
      });
      expect(routes.find(r => r.path.includes('protobooth'))).toBeUndefined();
    });

    it('should handle mixed App Router and Pages Router files', async () => {
      const mockFileStructure = [
        'src/app/page.tsx',
        'src/app/about/page.tsx',
        'src/pages/contact.tsx',
        'src/pages/blog/[slug].tsx'
      ];

      const routes = await discovery.discoverRoutes(mockFileStructure);

      expect(routes).toHaveLength(4);
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
        path: '/contact',
        isDynamic: false,
        parameters: []
      });
      expect(routes).toContainEqual({
        path: '/blog/[slug]',
        isDynamic: true,
        parameters: ['slug']
      });
    });
  });

  describe('parseRoutePath', () => {
    it('should convert App Router file paths to route paths', () => {
      const testCases = [
        { input: 'src/app/page.tsx', expected: '/' },
        { input: 'src/app/about/page.tsx', expected: '/about' },
        { input: 'src/app/user/[id]/page.tsx', expected: '/user/[id]' },
        { input: 'src/app/blog/[...path]/page.tsx', expected: '/blog/[...path]' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = discovery.parseRoutePath(input);
        expect(result.path).toBe(expected);
      });
    });

    it('should convert Pages Router file paths to route paths', () => {
      const testCases = [
        { input: 'src/pages/index.tsx', expected: '/' },
        { input: 'src/pages/about.tsx', expected: '/about' },
        { input: 'src/pages/user/[id].tsx', expected: '/user/[id]' },
        { input: 'src/pages/blog/[...slug].tsx', expected: '/blog/[...slug]' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = discovery.parseRoutePath(input);
        expect(result.path).toBe(expected);
      });
    });

    it('should identify dynamic routes correctly', () => {
      const dynamicPaths = [
        'src/app/user/[id]/page.tsx',
        'src/app/blog/[...path]/page.tsx',
        'src/pages/post/[slug].tsx',
        'src/pages/docs/[...path].tsx'
      ];

      dynamicPaths.forEach(path => {
        const result = discovery.parseRoutePath(path);
        expect(result.isDynamic).toBe(true);
      });
    });

    it('should extract parameters from dynamic routes', () => {
      const testCases = [
        {
          input: 'src/app/user/[userId]/page.tsx',
          expectedParams: ['userId']
        },
        {
          input: 'src/pages/post/[slug].tsx',
          expectedParams: ['slug']
        },
        {
          input: 'src/app/blog/[...path]/page.tsx',
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
    it('should accept valid App Router files', () => {
      const validFiles = [
        'src/app/page.tsx',
        'src/app/about/page.tsx',
        'src/app/user/[id]/page.tsx'
      ];

      validFiles.forEach(file => {
        expect(discovery.isValidRoute(file)).toBe(true);
      });
    });

    it('should accept valid Pages Router files', () => {
      const validFiles = [
        'src/pages/index.tsx',
        'src/pages/about.tsx',
        'src/pages/user/[id].tsx'
      ];

      validFiles.forEach(file => {
        expect(discovery.isValidRoute(file)).toBe(true);
      });
    });

    it('should reject non-route files', () => {
      const invalidFiles = [
        'src/components/Header.tsx',
        'src/app/layout.tsx',
        'src/pages/_app.tsx',
        'src/pages/_document.tsx',
        'src/app/globals.css',
        'src/pages/api/users.ts'
      ];

      invalidFiles.forEach(file => {
        expect(discovery.isValidRoute(file)).toBe(false);
      });
    });

    it('should reject protobooth routes', () => {
      const protoboothFiles = [
        'src/app/protobooth/page.tsx',
        'src/app/protobooth/annotations/page.tsx',
        'src/pages/protobooth/index.tsx'
      ];

      protoboothFiles.forEach(file => {
        expect(discovery.isValidRoute(file)).toBe(false);
      });
    });
  });
});