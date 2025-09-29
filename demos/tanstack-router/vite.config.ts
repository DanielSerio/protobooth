import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { createVitePlugin as protobooth } from 'protobooth/vite';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    protobooth({
      enabled: process.env.NODE_ENV === 'development',
      fixtures: {
        auth: {
          user: { id: 1, name: 'Demo User', role: 'admin' },
          isAuthenticated: true,
          permissions: ['read', 'write', 'admin']
        },
        dynamicRoutes: {
          '/user/$userId': [
            { userId: '123', name: 'John Doe', role: 'user' },
            { userId: '456', name: 'Jane Smith', role: 'admin' },
            { userId: '789', name: 'Bob Wilson', role: 'moderator' }
          ],
          '/product/$slug': [
            { slug: 'laptop', name: 'Gaming Laptop', price: 1299 },
            { slug: 'mouse', name: 'Wireless Mouse', price: 79 }
          ]
        },
        globalState: {
          theme: 'light',
          language: 'en',
          featureFlags: {
            newDashboard: true,
            betaFeatures: false
          }
        }
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1440, height: 900 }
      ]
    })
  ]
});