// RED: Write failing tests for fixture management system
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FixtureManager } from '@/core/fixture-manager';
import type { FixtureConfig } from '@/types/fixtures';

describe('FixtureManager', () => {
  let fixtureManager: FixtureManager;
  let mockFileOperations: any;

  beforeEach(() => {
    mockFileOperations = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      fileExists: vi.fn()
    };
    fixtureManager = new FixtureManager(mockFileOperations);
  });

  describe('loadFixtures', () => {
    it('should load fixture config from file', async () => {
      const mockConfig: FixtureConfig = {
        auth: {
          authenticated: {
            user: { id: '123', name: 'John Doe', email: 'john@example.com' },
            token: 'mock-jwt-token'
          },
          unauthenticated: null
        },
        dynamicRoutes: {
          '/user/[userId]': [
            { userId: '123' },
            { userId: '456' },
            { userId: '789' }
          ],
          '/product/[slug]': [
            { slug: 'laptop' },
            { slug: 'phone' }
          ]
        }
      };

      mockFileOperations.fileExists.mockResolvedValue(true);
      mockFileOperations.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const result = await fixtureManager.loadFixtures('protobooth.config.json');

      expect(mockFileOperations.readFile).toHaveBeenCalledWith('protobooth.config.json');
      expect(result).toEqual(mockConfig);
    });

    it('should return default config when file does not exist', async () => {
      mockFileOperations.fileExists.mockResolvedValue(false);

      const result = await fixtureManager.loadFixtures('nonexistent.json');

      expect(result).toEqual({
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {}
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      mockFileOperations.fileExists.mockResolvedValue(true);
      mockFileOperations.readFile.mockResolvedValue('invalid json');

      await expect(fixtureManager.loadFixtures('invalid.json'))
        .rejects.toThrow('Failed to parse fixture config');
    });
  });

  describe('getAuthFixture', () => {
    it('should return authenticated fixture when requested', async () => {
      const mockConfig: FixtureConfig = {
        auth: {
          authenticated: {
            user: { id: '123', name: 'John Doe', email: 'john@example.com' },
            token: 'mock-jwt-token'
          },
          unauthenticated: null
        },
        dynamicRoutes: {}
      };

      await fixtureManager.setFixtures(mockConfig);
      const authFixture = fixtureManager.getAuthFixture('authenticated');

      expect(authFixture).toEqual({
        user: { id: '123', name: 'John Doe', email: 'john@example.com' },
        token: 'mock-jwt-token'
      });
    });

    it('should return null for unauthenticated state', async () => {
      const mockConfig: FixtureConfig = {
        auth: {
          authenticated: {
            user: { id: '123', name: 'John Doe', email: 'john@example.com' },
            token: 'mock-jwt-token'
          },
          unauthenticated: null
        },
        dynamicRoutes: {}
      };

      await fixtureManager.setFixtures(mockConfig);
      const authFixture = fixtureManager.getAuthFixture('unauthenticated');

      expect(authFixture).toBeNull();
    });

    it('should throw error for invalid auth state', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {}
      };

      await fixtureManager.setFixtures(mockConfig);

      expect(() => fixtureManager.getAuthFixture('invalid' as any))
        .toThrow('Invalid auth state: invalid');
    });
  });

  describe('getDynamicRouteFixtures', () => {
    it('should return fixtures for dynamic route', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {
          '/user/[userId]': [
            { userId: '123' },
            { userId: '456' },
            { userId: '789' }
          ]
        }
      };

      await fixtureManager.setFixtures(mockConfig);
      const fixtures = fixtureManager.getDynamicRouteFixtures('/user/[userId]');

      expect(fixtures).toEqual([
        { userId: '123' },
        { userId: '456' },
        { userId: '789' }
      ]);
    });

    it('should return empty array for non-existent route', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {}
      };

      await fixtureManager.setFixtures(mockConfig);
      const fixtures = fixtureManager.getDynamicRouteFixtures('/nonexistent/[id]');

      expect(fixtures).toEqual([]);
    });

    it('should return empty array when no fixtures loaded', () => {
      const fixtures = fixtureManager.getDynamicRouteFixtures('/user/[id]');
      expect(fixtures).toEqual([]);
    });
  });

  describe('generateRouteInstances', () => {
    it('should generate multiple route instances for dynamic routes', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {
          '/user/[userId]': [
            { userId: '123' },
            { userId: '456' }
          ],
          '/product/[slug]': [
            { slug: 'laptop' }
          ]
        }
      };

      await fixtureManager.setFixtures(mockConfig);
      const instances = fixtureManager.generateRouteInstances('/user/[userId]');

      expect(instances).toEqual([
        '/user/123',
        '/user/456'
      ]);
    });

    it('should handle catch-all routes correctly', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {
          '/blog/[...path]': [
            { path: 'tech/react' },
            { path: 'design/ui-patterns' }
          ]
        }
      };

      await fixtureManager.setFixtures(mockConfig);
      const instances = fixtureManager.generateRouteInstances('/blog/[...path]');

      expect(instances).toEqual([
        '/blog/tech/react',
        '/blog/design/ui-patterns'
      ]);
    });

    it('should return original route for static routes', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {}
      };

      await fixtureManager.setFixtures(mockConfig);
      const instances = fixtureManager.generateRouteInstances('/about');

      expect(instances).toEqual(['/about']);
    });

    it('should return empty array when no fixtures exist for dynamic route', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {}
      };

      await fixtureManager.setFixtures(mockConfig);
      const instances = fixtureManager.generateRouteInstances('/user/[id]');

      expect(instances).toEqual([]);
    });
  });

  describe('validateFixtureConfig', () => {
    it('should validate correct fixture config', () => {
      const validConfig: FixtureConfig = {
        auth: {
          authenticated: {
            user: { id: '123', name: 'John Doe', email: 'john@example.com' },
            token: 'mock-jwt-token'
          },
          unauthenticated: null
        },
        dynamicRoutes: {
          '/user/[userId]': [{ userId: '123' }]
        }
      };

      const result = fixtureManager.validateFixtureConfig(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid fixture config', () => {
      const invalidConfig = {
        auth: 'invalid',
        dynamicRoutes: 'also invalid'
      };

      const result = fixtureManager.validateFixtureConfig(invalidConfig as any);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject config with missing required fields', () => {
      const incompleteConfig = {
        auth: { authenticated: null, unauthenticated: null }
      };

      const result = fixtureManager.validateFixtureConfig(incompleteConfig as any);
      expect(result.success).toBe(false);
    });
  });

  describe('saveFixtures', () => {
    it('should save fixture config to file', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: { '/user/[id]': [{ id: '123' }] }
      };

      mockFileOperations.writeFile.mockResolvedValue(undefined);

      await fixtureManager.saveFixtures('output.json', mockConfig);

      expect(mockFileOperations.writeFile).toHaveBeenCalledWith(
        'output.json',
        JSON.stringify(mockConfig, null, 2)
      );
    });

    it('should handle file write errors', async () => {
      const mockConfig: FixtureConfig = {
        auth: { authenticated: null, unauthenticated: null },
        dynamicRoutes: {}
      };

      mockFileOperations.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(fixtureManager.saveFixtures('readonly.json', mockConfig))
        .rejects.toThrow('Failed to save fixture config');
    });
  });
});