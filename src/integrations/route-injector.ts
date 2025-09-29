import path from 'path';
import type {
  RouteInjectionConfig,
  RouteValidationResult,
  InjectedRoute,
  DevServerIntegration,
  ViteDevServer,
  NextjsDevServerWithRouter
} from '@/types/ui';

export interface FileOperations {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  ensureDir(path: string): Promise<void>;
  remove(path: string): Promise<void>;
}

export class RouteInjector implements DevServerIntegration {
  protected fileOps: FileOperations;

  constructor(fileOperations: FileOperations) {
    this.fileOps = fileOperations;
  }

  async validateConfig(config: RouteInjectionConfig): Promise<RouteValidationResult> {
    const errors: string[] = [];

    // Validate routes
    for (const route of config.routes) {
      // Check route path starts with /protobooth/
      if (!route.path.startsWith('/protobooth/')) {
        errors.push('Route path must start with /protobooth/');
      }
    }

    // Note: Environment compatibility is handled during injection, not validation
    // This allows configs to contain routes for multiple environments

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async generateRouteComponents(config: RouteInjectionConfig): Promise<void> {
    await this.fileOps.ensureDir(config.outputDir);

    for (const route of config.routes) {
      // Only generate components for routes matching current environment
      if (!this.shouldIncludeRoute(route, config.environment)) {
        continue;
      }

      const componentContent = this.generateComponentContent(route);
      const componentPath = path.join(config.outputDir, `${route.component}.tsx`);

      await this.fileOps.writeFile(componentPath, componentContent);
    }
  }

  protected shouldIncludeRoute(route: InjectedRoute, environment: string): boolean {
    if (environment === 'staging-simulation') {
      return true; // Include all routes in staging simulation
    }
    return route.environment === environment;
  }

  protected generateComponentContent(route: InjectedRoute): string {
    const componentName = route.component;
    const cssClass = `protobooth-${route.path.split('/').pop()}-ui`;

    return `import React from 'react';
import './${componentName}.scss';

export default function ${componentName}() {
  return (
    <div className="${cssClass}">
      <h1>${componentName}</h1>
      <p>Protobooth ${route.environment} interface</p>
    </div>
  );
}`;
  }

  // Base implementation - should be overridden by subclasses
  async injectRoutes(_server: ViteDevServer | NextjsDevServerWithRouter, _config: RouteInjectionConfig): Promise<void> {
    throw new Error('injectRoutes must be implemented by subclass');
  }

  async cleanup(): Promise<void> {
    // Base cleanup implementation
    const logContent = `Routes cleaned up at ${new Date().toISOString()}`;
    await this.fileOps.writeFile('.protobooth-cleanup.log', logContent);
  }

  async removeGeneratedFiles(outputDir: string): Promise<void> {
    // Remove generated route files
    const filesToRemove = [
      'protobooth-routes.ts',
      'ResolveUI.tsx',
      'AnnotateUI.tsx'
    ];

    for (const file of filesToRemove) {
      const filePath = path.join(outputDir, file);
      try {
        await this.fileOps.remove(filePath);
      } catch (error) {
        // Ignore file not found errors
      }
    }
  }
}