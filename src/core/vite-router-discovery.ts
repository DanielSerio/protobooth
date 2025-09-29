// REFACTOR: Improved implementation following SOLID principles
import type { DiscoveredRoute } from '@/types/fixtures';

const ROUTES_DIR = 'src/routes/';
const TSX_EXTENSION = '.tsx';
const ROOT_FILE = '__root.tsx';
const PROTOBOOTH_KEYWORD = 'protobooth';
const INDEX_FILE = 'index';

export class ViteRouterDiscovery {
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
    let routePath = filePath
      .replace(ROUTES_DIR, '')
      .replace(TSX_EXTENSION, '')
      .replace(`/${INDEX_FILE}`, '');

    // Handle root route
    if (routePath === INDEX_FILE || routePath === '') {
      return '/';
    }

    return `/${routePath}`;
  }

  private isDynamicRoute(routePath: string): boolean {
    return routePath.includes('$') || routePath.includes('[');
  }

  private extractParameters(routePath: string): string[] {
    const paramMatches = routePath.match(/\$([a-zA-Z]+)|\[([^\]]+)\]/g);
    if (!paramMatches) return [];

    return paramMatches.map(match => {
      if (match.startsWith('$')) {
        return match.slice(1);
      }

      const param = match.slice(1, -1);
      return param.startsWith('...') ? param.slice(3) : param;
    });
  }

  isValidRoute(filePath: string): boolean {
    return this.isTsxFile(filePath) &&
           this.isInRoutesDirectory(filePath) &&
           !this.isRootFile(filePath) &&
           !this.isProtoboothRoute(filePath);
  }

  private isTsxFile(filePath: string): boolean {
    return filePath.endsWith(TSX_EXTENSION);
  }

  private isInRoutesDirectory(filePath: string): boolean {
    return filePath.includes(ROUTES_DIR);
  }

  private isRootFile(filePath: string): boolean {
    return filePath.includes(ROOT_FILE);
  }

  private isProtoboothRoute(filePath: string): boolean {
    return filePath.includes(PROTOBOOTH_KEYWORD);
  }
}