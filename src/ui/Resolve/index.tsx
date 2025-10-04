import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResolveApp } from './components/ResolveApp';
import {
  createBrowserFileOperations,
  createBrowserScreenshotService,
  createBrowserFixtureManager,
} from '../browser-api-adapter';
import type { ProtoboothConfig } from '@/types/config';

// Global config injected by Next.js/Vite plugin
declare global {
  interface Window {
    __PROTOBOOTH_CONFIG__: ProtoboothConfig;
  }
}

/**
 * Entry point for Resolve UI (client-side only).
 * Services communicate with server-side APIs.
 */
function initializeResolveApp() {
  const config = window.__PROTOBOOTH_CONFIG__ || {};

  // API base path - Vite serves at /protobooth/api, Next.js at /api (not implemented yet)
  const apiBasePath = '/protobooth';

  // Create client-side service adapters using browser API adapter
  const fileOperations = createBrowserFileOperations(apiBasePath);
  const screenshotService = createBrowserScreenshotService(apiBasePath);
  const fixtureManager = createBrowserFixtureManager(config);

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