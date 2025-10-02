import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResolveApp } from './components/ResolveApp';
import type { ProtoboothConfig } from '@/types/config';

// Global config injected by Next.js/Vite plugin
declare global {
  interface Window {
    __PROTOBOOTH_CONFIG__: ProtoboothConfig;
  }
}

/**
 * Client-side file operations using HTTP API
 */
const createClientFileOperations = () => ({
  readFile: async (filename: string): Promise<string> => {
    const response = await fetch(`/protobooth/api/files/${encodeURIComponent(filename)}`);
    if (!response.ok) {
      throw new Error(`File not found: ${filename}`);
    }
    return response.text();
  },
  writeFile: async (filename: string, content: string): Promise<void> => {
    const response = await fetch(`/protobooth/api/files/${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!response.ok) {
      throw new Error(`Failed to write file: ${filename}`);
    }
  },
  fileExists: async (filename: string): Promise<boolean> => {
    const response = await fetch(`/protobooth/api/files/${encodeURIComponent(filename)}`, {
      method: 'HEAD'
    });
    return response.ok;
  }
});

/**
 * Client-side screenshot service using HTTP API
 */
const createClientScreenshotService = () => ({
  captureRoutes: async (options: {
    appUrl: string;
    projectPath: string;
    routerType: 'vite' | 'nextjs';
    authState: 'authenticated' | 'unauthenticated';
  }) => {
    const response = await fetch('/protobooth/api/screenshots/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Screenshot capture failed: ${error}`);
    }

    return response.json();
  }
});

/**
 * Client-side fixture manager
 */
const createClientFixtureManager = (config: ProtoboothConfig) => ({
  getAuthFixture: (state: 'authenticated' | 'unauthenticated') => {
    return config.fixtures?.auth?.[state] ?? null;
  },
  getGlobalState: () => {
    return config.fixtures?.globalState;
  }
});

/**
 * Entry point for Resolve UI (client-side only).
 * Services communicate with server-side APIs.
 */
function initializeResolveApp() {
  const config = window.__PROTOBOOTH_CONFIG__ || {};

  // Create client-side service adapters
  const fileOperations = createClientFileOperations();
  const screenshotService = createClientScreenshotService();
  const fixtureManager = createClientFixtureManager(config);

  // Render the app
  const root = document.getElementById('protobooth-root');
  if (!root) {
    throw new Error('Root element #protobooth-root not found');
  }

  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <ResolveApp
        fileOperations={fileOperations}
        screenshotService={screenshotService}
        fixtureManager={fixtureManager}
        config={config}
      />
    </React.StrictMode>
  );
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeResolveApp);
} else {
  initializeResolveApp();
}