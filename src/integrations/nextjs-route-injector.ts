import path from 'path';
import { RouteInjector } from './route-injector';
import type {
  RouteInjectionConfig,
  NextjsDevServerWithRouter,
  NextApiRequest,
  NextApiResponse,
  InjectedRoute
} from '@/types/ui';

export class NextjsRouteInjector extends RouteInjector {
  async injectRoutes(server: NextjsDevServerWithRouter, config: RouteInjectionConfig): Promise<void> {
    // Register routes with Next.js router
    for (const route of config.routes) {
      if (!this.shouldIncludeRoute(route, config.environment)) {
        continue;
      }

      const handler = this.createRouteHandler(route);
      server.router.get(route.path, handler);
    }

    // Generate Next.js route files
    await this.generateNextjsRoutes(config);
  }

  private createRouteHandler(route: InjectedRoute) {
    return async (_req: NextApiRequest, res: NextApiResponse) => {
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

  async generateNextjsRoutes(config: RouteInjectionConfig): Promise<void> {
    const routerType = config.nextjsRouter || 'app';

    for (const route of config.routes) {
      if (!this.shouldIncludeRoute(route, config.environment)) {
        continue;
      }

      if (routerType === 'app') {
        await this.generateAppRouterFile(route, config);
      } else {
        await this.generatePagesRouterFile(route, config);
      }
    }
  }

  private async generateAppRouterFile(route: InjectedRoute, config: RouteInjectionConfig): Promise<void> {
    const routePath = route.path.replace('/protobooth/', '');
    const filePath = path.join(config.outputDir, 'app', 'protobooth', routePath, 'page.tsx');

    const content = `export default function ${route.component}() {
  return (
    <div className="protobooth-${routePath}-ui">
      <h1>${route.component}</h1>
      <p>Protobooth ${route.environment} interface</p>
    </div>
  );
}`;

    await this.fileOps.ensureDir(path.dirname(filePath));
    await this.fileOps.writeFile(filePath, content);
  }

  private async generatePagesRouterFile(route: InjectedRoute, config: RouteInjectionConfig): Promise<void> {
    const routePath = route.path.replace('/protobooth/', '');
    const filePath = path.join(config.outputDir, 'pages', 'protobooth', `${routePath}.tsx`);

    const content = `export default function ${route.component}() {
  return (
    <div className="protobooth-${routePath}-ui">
      <h1>${route.component}</h1>
      <p>Protobooth ${route.environment} interface</p>
    </div>
  );
}`;

    await this.fileOps.ensureDir(path.dirname(filePath));
    await this.fileOps.writeFile(filePath, content);
  }
}