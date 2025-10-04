// RED: Test for TanStack Router $param syntax support in route instance generator
import { describe, it, expect } from 'vitest';
import { DefaultRouteInstanceGenerator } from '@/core/fixture-manager';
import type { DynamicRouteFixture } from '@/types/fixtures';

describe('DefaultRouteInstanceGenerator - TanStack Router Support', () => {
  const generator = new DefaultRouteInstanceGenerator();

  describe('TanStack Router $param syntax', () => {
    it('should expand single parameter routes with $ syntax', () => {
      const fixtures: DynamicRouteFixture[] = [
        { slug: 'laptop' },
        { slug: 'mouse' }
      ];

      const result = generator.generate('/product/$slug', fixtures);

      expect(result).toEqual([
        '/product/laptop',
        '/product/mouse'
      ]);
    });

    it('should expand routes with multiple $ parameters', () => {
      const fixtures: DynamicRouteFixture[] = [
        { category: 'electronics', slug: 'laptop' },
        { category: 'accessories', slug: 'mouse' }
      ];

      const result = generator.generate('/shop/$category/$slug', fixtures);

      expect(result).toEqual([
        '/shop/electronics/laptop',
        '/shop/accessories/mouse'
      ]);
    });

    it('should handle numeric parameter values with $ syntax', () => {
      const fixtures: DynamicRouteFixture[] = [
        { userId: '123' },
        { userId: '456' },
        { userId: '789' }
      ];

      const result = generator.generate('/user/$userId', fixtures);

      expect(result).toEqual([
        '/user/123',
        '/user/456',
        '/user/789'
      ]);
    });

    it('should return empty array for dynamic route with no fixtures', () => {
      const fixtures: DynamicRouteFixture[] = [];

      const result = generator.generate('/product/$slug', fixtures);

      expect(result).toEqual([]);
    });

    it('should handle mixed Next.js and TanStack syntax in same codebase', () => {
      // Next.js [param] syntax
      const nextJsFixtures: DynamicRouteFixture[] = [
        { id: 'abc' }
      ];
      const nextJsResult = generator.generate('/posts/[id]', nextJsFixtures);
      expect(nextJsResult).toEqual(['/posts/abc']);

      // TanStack Router $param syntax
      const tanstackFixtures: DynamicRouteFixture[] = [
        { slug: 'xyz' }
      ];
      const tanstackResult = generator.generate('/articles/$slug', tanstackFixtures);
      expect(tanstackResult).toEqual(['/articles/xyz']);
    });
  });

  describe('Screenshot count validation', () => {
    it('should generate correct number of instances for TanStack routes', () => {
      // Test case matching actual demo app routes.json
      const productFixtures: DynamicRouteFixture[] = [
        { slug: 'laptop' },
        { slug: 'mouse' }
      ];

      const userFixtures: DynamicRouteFixture[] = [
        { userId: '123' },
        { userId: '456' },
        { userId: '789' }
      ];

      const productInstances = generator.generate('/product/$slug', productFixtures);
      const userInstances = generator.generate('/user/$userId', userFixtures);

      // Should have 2 product instances + 3 user instances = 5 dynamic route instances
      expect(productInstances.length).toBe(2);
      expect(userInstances.length).toBe(3);

      // Total: 4 static routes + 5 dynamic instances = 9 route instances
      // Multiplied by 3 viewports = 27 screenshots
      const totalDynamicInstances = productInstances.length + userInstances.length;
      const staticRoutes = 4; // /, /about, /dashboard, /products
      const totalRouteInstances = staticRoutes + totalDynamicInstances;
      const viewportCount = 3; // mobile, tablet, desktop
      const expectedScreenshots = totalRouteInstances * viewportCount;

      expect(expectedScreenshots).toBe(27);
    });
  });

  describe('Filename uniqueness for TanStack routes', () => {
    it('should generate unique route paths that produce unique filenames', () => {
      const fixtures: DynamicRouteFixture[] = [
        { slug: 'laptop' },
        { slug: 'mouse' }
      ];

      const instances = generator.generate('/product/$slug', fixtures);

      // Each instance should be unique
      expect(instances).toEqual([
        '/product/laptop',
        '/product/mouse'
      ]);

      // Simulating filename generation (like screenshot-capture-service.ts:244)
      const filenames = instances.map(instance => {
        const routePath = instance.slice(1); // Remove leading /
        return `${routePath.replace(/\//g, '_')}_desktop.png`;
      });

      expect(filenames).toEqual([
        'product_laptop_desktop.png',
        'product_mouse_desktop.png'
      ]);

      // Verify no duplicates
      const uniqueFilenames = new Set(filenames);
      expect(uniqueFilenames.size).toBe(filenames.length);
    });
  });
});
