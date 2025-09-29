// REFACTOR: Improved implementation following SOLID principles
import type { DiscoveredRoute } from '@/types/fixtures';

const APP_ROUTER_DIR = 'src/app/';
const PAGES_ROUTER_DIR = 'src/pages/';
const TSX_EXTENSION = '.tsx';
const PAGE_FILE = 'page.tsx';
// const INDEX_FILE = 'index.tsx'; // Currently unused
const PROTOBOOTH_KEYWORD = 'protobooth';

export class NextjsRouterDiscovery {
  async discoverRoutes(fileStructure: string[]): Promise<DiscoveredRoute[]> {
    return fileStructure
      .filter(filePath => this.isValidRoute(filePath))
      .map(filePath => this.parseRoutePath(filePath));
  }

  parseRoutePath(filePath: string): DiscoveredRoute {
    const routePath = this.convertFilePathToRoutePath(filePath);
    const isDynamic = this.isDynamicRoute(routePath);
    const parameters = isDynamic ? this.extractParameters(routePath) : [];

    return {
      path: routePath,
      isDynamic,
      parameters
    };
  }

  private convertFilePathToRoutePath(filePath: string): string {
    if (this.isAppRouterFile(filePath)) {
      return this.convertAppRouterPath(filePath);
    }

    if (this.isPagesRouterFile(filePath)) {
      return this.convertPagesRouterPath(filePath);
    }

    return '/';
  }

  private convertAppRouterPath(filePath: string): string {
    let routePath = filePath
      .replace(APP_ROUTER_DIR, '')
      .replace(`/${PAGE_FILE}`, '')
      .replace(PAGE_FILE, '');

    return this.normalizeRoutePath(routePath);
  }

  private convertPagesRouterPath(filePath: string): string {
    let routePath = filePath
      .replace(PAGES_ROUTER_DIR, '')
      .replace(TSX_EXTENSION, '')
      .replace('index', '');

    return this.normalizeRoutePath(routePath);
  }

  private normalizeRoutePath(routePath: string): string {
    if (routePath === '' || routePath === 'index') {
      return '/';
    }

    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }

  private isDynamicRoute(routePath: string): boolean {
    return routePath.includes('[');
  }

  private extractParameters(routePath: string): string[] {
    const paramMatches = routePath.match(/\[([^\]]+)\]/g);
    if (!paramMatches) return [];

    return paramMatches.map(match => {
      const param = match.slice(1, -1);
      return param.startsWith('...') ? param.slice(3) : param;
    });
  }

  isValidRoute(filePath: string): boolean {
    return this.isTsxFile(filePath) &&
           this.isNextjsRouterFile(filePath) &&
           !this.isSpecialFile(filePath) &&
           !this.isProtoboothRoute(filePath);
  }

  private isTsxFile(filePath: string): boolean {
    return filePath.endsWith(TSX_EXTENSION);
  }

  private isNextjsRouterFile(filePath: string): boolean {
    return this.isAppRouterFile(filePath) || this.isPagesRouterFile(filePath);
  }

  private isAppRouterFile(filePath: string): boolean {
    return filePath.includes(APP_ROUTER_DIR);
  }

  private isPagesRouterFile(filePath: string): boolean {
    return filePath.includes(PAGES_ROUTER_DIR);
  }

  private isSpecialFile(filePath: string): boolean {
    const specialFiles = ['layout.tsx', '_app.tsx', '_document.tsx', '/api/'];
    return specialFiles.some(special => filePath.includes(special));
  }

  private isProtoboothRoute(filePath: string): boolean {
    return filePath.includes(PROTOBOOTH_KEYWORD);
  }
}