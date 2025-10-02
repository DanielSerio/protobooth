import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { createVitePlugin as protobooth } from 'protobooth/vite';
import path from 'path';

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      // Map @/ imports to protobooth src directory
      '@': path.resolve(__dirname, '..', '..', 'src')
    }
  },
  server: {
    fs: {
      // Allow serving files from protobooth package (monorepo setup)
      allow: [
        path.resolve(__dirname, '..', '..', 'src'),
        path.resolve(__dirname, '..')
      ]
    }
  },
  plugins: [
    react(),
    tanstackRouter(),
    protobooth({
      enabled: command === 'serve',
      fixtures: {
        auth: {
          authenticated: {
            user: { id: '1', name: 'Demo User', email: 'demo@example.com', role: 'admin' },
            token: 'demo-token',
            permissions: ['read', 'write', 'admin']
          },
          unauthenticated: null
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
}) as UserConfig);