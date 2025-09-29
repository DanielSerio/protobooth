import path from 'path';
import { RouteInjector } from './route-injector';
import type { Connect } from 'vite';
import type {
  RouteInjectionConfig,
  ViteDevServer,
  InjectedRoute
} from '@/types/ui';

export class ViteRouteInjector extends RouteInjector {
  private currentServer: ViteDevServer | null = null;

  async injectRoutes(server: ViteDevServer, config: RouteInjectionConfig): Promise<void> {
    this.currentServer = server;

    // Create middleware for protobooth routes
    const protoboothMiddleware = this.createProtoboothMiddleware(config);

    // Register middleware with Vite dev server
    server.middlewares.use('/protobooth', protoboothMiddleware);

    // Generate route files for Vite
    await this.generateViteRoutes(config);
  }

  private createProtoboothMiddleware(config: RouteInjectionConfig): Connect.NextHandleFunction {
    return async (req, res, next) => {
      const route = config.routes.find(r => r.path === req.url);

      if (!route) {
        return next(); // Pass through to next middleware
      }

      // Check if route should be available in current environment
      if (!this.shouldIncludeRoute(route, config.environment)) {
        return next();
      }

      // Serve the component HTML
      const html = this.generateRouteHTML(route);

      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    };
  }

  private generateRouteHTML(route: InjectedRoute): string {
    const cssClass = `protobooth-${route.path.split('/').pop()}-ui`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protobooth - ${route.component}</title>
  <style>
    .${cssClass} {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="${cssClass}">
    <h1>${route.component}</h1>
    <p>Protobooth ${route.environment} interface</p>
  </div>
</body>
</html>`;
  }

  async generateViteRoutes(config: RouteInjectionConfig): Promise<void> {
    const routesContent = this.generateViteRoutesContent(config);
    const routesPath = path.join(config.outputDir, 'protobooth-routes.ts');

    await this.fileOps.writeFile(routesPath, routesContent);
  }

  private generateViteRoutesContent(config: RouteInjectionConfig): string {
    const routes = config.routes.filter(route =>
      this.shouldIncludeRoute(route, config.environment)
    );

    const routeImports = routes.map(route =>
      `import ${route.component} from './${route.component}';`
    ).join('\n');

    const routeDefinitions = routes.map(route =>
      `  { path: '${route.path}', component: ${route.component} }`
    ).join(',\n');

    return `import { createRouter, createWebHistory } from 'vue-router';
${routeImports}

const routes = [
${routeDefinitions}
];

export const protoboothRouter = createRouter({
  history: createWebHistory(),
  routes
});`;
  }

  async handleRouteUpdate(routePath: string, _component: string): Promise<void> {
    if (this.currentServer && this.currentServer.ws) {
      this.currentServer.ws.send({
        type: 'full-reload',
        path: routePath
      });
    }
  }
}