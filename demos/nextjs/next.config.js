const { withProtobooth } = require('protobooth/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js config options
  reactStrictMode: true,

  // Allow importing from outside the Next.js project directory
  experimental: {
    externalDir: true,
  },
};

module.exports = withProtobooth(nextConfig, {
  protobooth: {
    enabled: process.env.NODE_ENV === 'development',
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
  }
});