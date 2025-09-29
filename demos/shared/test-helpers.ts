// Test utilities for validating protobooth functionality

export interface TestRoute {
  path: string;
  expectedTitle: string;
  requiresAuth?: boolean;
  isDynamic?: boolean;
  parameters?: Record<string, string>;
}

export const tanstackRouterTestRoutes: TestRoute[] = [
  { path: '/', expectedTitle: 'Welcome to Protobooth Demo' },
  { path: '/about', expectedTitle: 'About This Demo' },
  { path: '/products', expectedTitle: 'Products' },
  { path: '/user/123', expectedTitle: 'User Profile', isDynamic: true, parameters: { userId: '123' } },
  { path: '/user/456', expectedTitle: 'User Profile', isDynamic: true, parameters: { userId: '456' } },
  { path: '/user/789', expectedTitle: 'User Profile', isDynamic: true, parameters: { userId: '789' } },
  { path: '/product/laptop', expectedTitle: 'Gaming Laptop', isDynamic: true, parameters: { slug: 'laptop' } },
  { path: '/product/mouse', expectedTitle: 'Wireless Mouse', isDynamic: true, parameters: { slug: 'mouse' } },
  { path: '/dashboard', expectedTitle: 'Dashboard', requiresAuth: true }
];

export const nextjsAppRouterTestRoutes: TestRoute[] = [
  { path: '/', expectedTitle: 'Next.js App Router Demo' },
  { path: '/about', expectedTitle: 'About This Next.js Demo' },
  { path: '/user/1', expectedTitle: 'User Profile (App Router)', isDynamic: true, parameters: { id: '1' } },
  { path: '/user/2', expectedTitle: 'User Profile (App Router)', isDynamic: true, parameters: { id: '2' } },
  { path: '/user/3', expectedTitle: 'User Profile (App Router)', isDynamic: true, parameters: { id: '3' } }
];

export const nextjsPagesRouterTestRoutes: TestRoute[] = [
  { path: '/pages-demo', expectedTitle: 'Next.js Pages Router Demo' },
  { path: '/blog/getting-started', expectedTitle: 'Getting Started with Next.js', isDynamic: true, parameters: { slug: 'getting-started' } },
  { path: '/blog/advanced-routing', expectedTitle: 'Advanced Routing Patterns', isDynamic: true, parameters: { slug: 'advanced-routing' } },
  { path: '/user/1', expectedTitle: 'User Profile (Pages Router)', isDynamic: true, parameters: { id: '1' } },
  { path: '/user/2', expectedTitle: 'User Profile (Pages Router)', isDynamic: true, parameters: { id: '2' } },
  { path: '/user/3', expectedTitle: 'User Profile (Pages Router)', isDynamic: true, parameters: { id: '3' } }
];

export function validateScreenshotNaming(route: string, parameters?: Record<string, string>): string {
  // Implement the naming convention: /user/123.png, /product/laptop.png
  if (parameters && Object.keys(parameters).length > 0) {
    let finalRoute = route;
    for (const [key, value] of Object.entries(parameters)) {
      finalRoute = finalRoute.replace(`[${key}]`, value).replace(`$${key}`, value);
    }
    return `${finalRoute}.png`;
  }
  return `${route}.png`;
}

export function generateFixtureTestData() {
  return {
    auth: mockAuthState,
    dynamicRoutes: {
      '/user/[id]': Object.values(mockUsers).slice(0, 3),
      '/product/[slug]': Object.values(mockProducts).slice(0, 2),
      '/blog/[slug]': Object.values(mockBlogPosts)
    },
    globalState: mockGlobalState
  };
}

// Import mock data
import { mockUsers, mockProducts, mockBlogPosts, mockAuthState, mockGlobalState } from './mock-data';