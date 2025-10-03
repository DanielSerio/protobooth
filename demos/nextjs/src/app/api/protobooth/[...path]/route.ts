import { createNextApiHandler } from 'protobooth/next';
import { NextRequest } from 'next/server';

// Protobooth configuration matching next.config.js
const protoboothConfig = {
  fixtures: {
    auth: {
      authenticated: {
        user: {
          id: '1',
          name: 'Next.js Demo User',
          email: 'demo@example.com',
          role: 'admin'
        },
        token: 'demo-auth-token-123',
        permissions: ['read', 'write', 'admin']
      },
      unauthenticated: null
    },
    dynamicRoutes: {
      '/user/[id]': [
        { id: '1', name: 'Alice Johnson', role: 'user' },
        { id: '2', name: 'Bob Smith', role: 'admin' },
        { id: '3', name: 'Carol Davis', role: 'moderator' }
      ],
      '/blog/[slug]': [
        { slug: 'getting-started', title: 'Getting Started with Next.js', author: 'John Doe' },
        { slug: 'advanced-routing', title: 'Advanced Routing Patterns', author: 'Jane Smith' }
      ]
    },
    globalState: {
      theme: 'dark',
      language: 'en',
      featureFlags: {
        newLayout: true,
        experimentalFeatures: true
      }
    }
  },
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ]
};

// Create the API handler with config
const apiHandler = createNextApiHandler(protoboothConfig);

// Export HTTP method handlers
export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return apiHandler(req, context) as Promise<Response>;
}

export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return apiHandler(req, context) as Promise<Response>;
}

export async function HEAD(req: NextRequest, context: { params: { path: string[] } }) {
  return apiHandler(req, context) as Promise<Response>;
}
