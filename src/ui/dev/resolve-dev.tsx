import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResolveApp } from '../Resolve/components/ResolveApp';
import type { ProtoboothConfig } from '@/types/config';
import '../../ui/styles/resolve-ui/index.scss';

// Mock config for development
const mockConfig: ProtoboothConfig = {
  fixtures: {
    auth: {
      authenticated: {
        user: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        token: 'mock-jwt-token',
        permissions: ['read', 'write']
      },
      unauthenticated: null
    },
    globalState: {
      theme: 'light',
      language: 'en'
    }
  },
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1440, height: 900 }
  ]
};

// Mock file operations for development
const mockFileOps = {
  readFile: async (filename: string): Promise<string> => {
    console.log('[Dev] Reading file:', filename);
    if (filename.includes('workflow-state')) {
      return JSON.stringify({ state: 'in-development', timestamp: new Date().toISOString() });
    }
    if (filename.includes('annotations')) {
      return JSON.stringify([]);
    }
    return '{}';
  },
  writeFile: async (filename: string, content: string): Promise<void> => {
    console.log('[Dev] Writing file:', filename, content);
  },
  fileExists: async (filename: string): Promise<boolean> => {
    console.log('[Dev] Checking file exists:', filename);
    return false;
  }
};

// Mock screenshot service for development
const mockScreenshotService = {
  captureRoutes: async (options: any) => {
    console.log('[Dev] Capturing screenshots with options:', options);
    return {
      screenshots: [
        { route: '/', viewport: 'desktop', filePath: '/temp/home-desktop.png', dimensions: { width: 1920, height: 1080 }, timestamp: new Date() },
        { route: '/', viewport: 'mobile', filePath: '/temp/home-mobile.png', dimensions: { width: 375, height: 667 }, timestamp: new Date() }
      ],
      injectedFixtures: {
        auth: mockConfig.fixtures?.auth?.authenticated ?? null,
        globalState: mockConfig.fixtures?.globalState
      },
      fixtureInjectionLog: ['Injected auth fixture'],
      totalRoutes: 1,
      totalScreenshots: 2
    };
  }
};

// Mock fixture manager for development
const mockFixtureManager = {
  getAuthFixture: (state: 'authenticated' | 'unauthenticated') => {
    return mockConfig.fixtures?.auth?.[state] ?? null;
  },
  getGlobalState: () => {
    return mockConfig.fixtures?.globalState;
  }
};

// Initialize the app
const root = document.getElementById('protobooth-root');
if (!root) {
  throw new Error('Root element #protobooth-root not found');
}

const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(
  <React.StrictMode>
    <ResolveApp
      fileOperations={mockFileOps}
      screenshotService={mockScreenshotService}
      fixtureManager={mockFixtureManager}
    />
  </React.StrictMode>
);
