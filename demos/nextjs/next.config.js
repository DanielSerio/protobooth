const { withProtobooth } = require('protobooth/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

module.exports = withProtobooth(nextConfig, {
  protobooth: {
    enabled: process.env.NODE_ENV === 'development',
    fixtures: {
      auth: {
        user: { id: 1, name: 'Next.js Demo User', role: 'admin' },
        isAuthenticated: true,
        permissions: ['read', 'write', 'admin']
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
        ],
        '/category/[...path]': [
          { path: ['electronics', 'laptops'], category: 'Electronics > Laptops' },
          { path: ['books', 'programming', 'javascript'], category: 'Books > Programming > JavaScript' }
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