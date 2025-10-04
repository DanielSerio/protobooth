import type { FixtureConfig, AuthFixture, DynamicRouteFixture } from '@/types/fixtures';
import type { FileOperations } from '@/types/file-operations';
import { z } from 'zod';

// Validation interface (Single Responsibility Principle)
export interface ConfigValidator {
  validate(config: unknown): { success: boolean; error?: string };
}

// Route instance generator interface (Single Responsibility Principle)
export interface RouteInstanceGenerator {
  generate(routePattern: string, fixtures: DynamicRouteFixture[]): string[];
}

// Zod-based config validator implementation
export class ZodConfigValidator implements ConfigValidator {
  private readonly schema: z.ZodSchema;

  constructor() {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string()
    }).passthrough();

    const AuthFixtureSchema = z.object({
      user: UserSchema,
      token: z.string(),
      permissions: z.array(z.string()).optional()
    }).passthrough();

    const DynamicRouteFixtureSchema = z.record(z.union([z.string(), z.number(), z.boolean()]));

    this.schema = z.object({
      auth: z.object({
        authenticated: AuthFixtureSchema.nullable(),
        unauthenticated: z.null()
      }),
      dynamicRoutes: z.record(z.array(DynamicRouteFixtureSchema)),
      globalState: z.object({
        theme: z.string().optional(),
        language: z.string().optional(),
        featureFlags: z.record(z.boolean()).optional()
      }).passthrough().optional()
    });
  }

  validate(config: unknown): { success: boolean; error?: string } {
    try {
      this.schema.parse(config);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        };
      }
      return { success: false, error: 'Unknown validation error' };
    }
  }
}

// Default route instance generator implementation
export class DefaultRouteInstanceGenerator implements RouteInstanceGenerator {
  generate(routePattern: string, fixtures: DynamicRouteFixture[]): string[] {
    if (fixtures.length === 0) {
      // Check if this is actually a dynamic route (Next.js [param] or TanStack $param)
      if ((routePattern.includes('[') && routePattern.includes(']')) || routePattern.includes('$')) {
        return [];
      }
      // Static route
      return [routePattern];
    }

    return fixtures.map(fixture => {
      let instance = routePattern;

      // Handle Next.js catch-all routes [...param]
      const catchAllMatch = instance.match(/\[\.\.\.(\w+)\]/);
      if (catchAllMatch) {
        const paramName = catchAllMatch[1];
        const value = fixture[paramName];
        instance = instance.replace(`[...${paramName}]`, String(value));
        return instance;
      }

      // Handle Next.js regular dynamic routes [param]
      const nextJsParamMatches = instance.match(/\[(\w+)\]/g);
      if (nextJsParamMatches) {
        nextJsParamMatches.forEach(match => {
          const paramName = match.slice(1, -1); // Remove [ and ]
          const value = fixture[paramName];
          if (value !== undefined) {
            instance = instance.replace(match, String(value));
          }
        });
      }

      // Handle TanStack Router dynamic routes $param
      const tanstackParamMatches = instance.match(/\$(\w+)/g);
      if (tanstackParamMatches) {
        tanstackParamMatches.forEach(match => {
          const paramName = match.slice(1); // Remove $
          const value = fixture[paramName];
          if (value !== undefined) {
            instance = instance.replace(match, String(value));
          }
        });
      }

      return instance;
    });
  }
}

export class FixtureManager {
  private config: FixtureConfig | null = null;
  private readonly fileOps: FileOperations;
  private readonly validator: ConfigValidator;
  private readonly routeGenerator: RouteInstanceGenerator;

  constructor(
    fileOperations: FileOperations,
    validator: ConfigValidator = new ZodConfigValidator(),
    routeGenerator: RouteInstanceGenerator = new DefaultRouteInstanceGenerator()
  ) {
    this.fileOps = fileOperations;
    this.validator = validator;
    this.routeGenerator = routeGenerator;
  }

  async loadFixtures(configPath: string): Promise<FixtureConfig> {
    try {
      if (!(await this.fileOps.fileExists(configPath))) {
        return this.getDefaultConfig();
      }

      const content = await this.fileOps.readFile(configPath);
      const config = JSON.parse(content);

      const validation = this.validateFixtureConfig(config);
      if (!validation.success) {
        throw new Error(`Invalid fixture config: ${validation.error}`);
      }

      this.config = config;
      return config;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse fixture config');
      }
      throw error;
    }
  }

  async setFixtures(config: FixtureConfig): Promise<void> {
    this.config = config;
    console.log('[FixtureManager] Fixtures set:', {
      hasDynamicRoutes: !!config.dynamicRoutes,
      dynamicRouteKeys: Object.keys(config.dynamicRoutes || {})
    });
  }

  getAuthFixture(state: 'authenticated' | 'unauthenticated'): AuthFixture | null {
    if (!this.config) {
      return null;
    }

    if (state !== 'authenticated' && state !== 'unauthenticated') {
      throw new Error(`Invalid auth state: ${state}`);
    }

    return this.config.auth?.[state] ?? null;
  }

  getDynamicRouteFixtures(routePattern: string): DynamicRouteFixture[] {
    if (!this.config) {
      return [];
    }

    return this.config.dynamicRoutes?.[routePattern] || [];
  }

  getGlobalState(): Record<string, string | Record<string, boolean> | undefined> | undefined {
    return this.config?.globalState;
  }

  generateRouteInstances(routePattern: string): string[] {
    const fixtures = this.getDynamicRouteFixtures(routePattern);
    console.log('[FixtureManager] Generating route instances:', {
      routePattern,
      fixturesFound: fixtures.length,
      fixtures: fixtures
    });
    const instances = this.routeGenerator.generate(routePattern, fixtures);
    console.log('[FixtureManager] Generated instances:', instances);
    return instances;
  }

  validateFixtureConfig(config: unknown): { success: boolean; error?: string } {
    return this.validator.validate(config);
  }

  async saveFixtures(path: string, config: FixtureConfig): Promise<void> {
    try {
      const content = JSON.stringify(config, null, 2);
      await this.fileOps.writeFile(path, content);
    } catch (error) {
      throw new Error('Failed to save fixture config');
    }
  }

  private getDefaultConfig(): FixtureConfig {
    return {
      auth: {
        authenticated: null,
        unauthenticated: null
      },
      dynamicRoutes: {}
    };
  }
}