// GREEN: Browser-side API adapters for connecting UI to HTTP endpoints
// Implements service interfaces using fetch API
import type { FileOperations, ScreenshotService, FixtureManager, CaptureOptions } from './Resolve/components/ResolveApp.props';
import type { CaptureResult } from '@/types/screenshot';
import type { ProtoboothConfig } from '@/types/config';

/**
 * Creates browser-side FileOperations implementation
 * Calls /api/files/* endpoints
 */
export function createBrowserFileOperations(baseUrl: string = ''): FileOperations {
  return {
    async readFile(filename: string): Promise<string> {
      const response = await fetch(`${baseUrl}/api/files/${encodeURIComponent(filename)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File not found: ${filename}`);
        }
        throw new Error(`Failed to read file: ${response.statusText}`);
      }

      return response.text();
    },

    async writeFile(filename: string, content: string): Promise<void> {
      const response = await fetch(`${baseUrl}/api/files/${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Failed to write file: ${response.statusText}`);
      }
    },

    async fileExists(filename: string): Promise<boolean> {
      const response = await fetch(`${baseUrl}/api/files/${encodeURIComponent(filename)}`, {
        method: 'HEAD',
      });

      return response.ok;
    },
  };
}

/**
 * Creates browser-side ScreenshotService implementation
 * Calls /api/screenshots/capture endpoint
 */
export function createBrowserScreenshotService(baseUrl: string = ''): ScreenshotService {
  return {
    async captureRoutes(options: CaptureOptions): Promise<CaptureResult> {
      const response = await fetch(`${baseUrl}/api/screenshots/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || 'Screenshot capture failed');
      }

      return response.json();
    },
  };
}

/**
 * Creates browser-side FixtureManager implementation
 * Reads from window.__PROTOBOOTH_CONFIG__ injected by HTML template
 */
export function createBrowserFixtureManager(config?: ProtoboothConfig): FixtureManager {
  // Try to get config from window if not provided
  const windowConfig = typeof window !== 'undefined'
    ? (window as Window & { __PROTOBOOTH_CONFIG__?: ProtoboothConfig }).__PROTOBOOTH_CONFIG__
    : undefined;

  const effectiveConfig = config || windowConfig;

  return {
    getAuthFixture(state: 'authenticated' | 'unauthenticated'): unknown {
      // Type guard: ensure effectiveConfig is an object with fixtures
      if (!effectiveConfig || typeof effectiveConfig !== 'object' || !('fixtures' in effectiveConfig)) {
        return null;
      }

      if (!effectiveConfig.fixtures?.auth) {
        return null;
      }

      return effectiveConfig.fixtures.auth[state];
    },

    getGlobalState(): Record<string, string | Record<string, boolean> | undefined> | undefined {
      // Type guard: ensure effectiveConfig is an object with fixtures
      if (!effectiveConfig || typeof effectiveConfig !== 'object' || !('fixtures' in effectiveConfig)) {
        return undefined;
      }

      return effectiveConfig.fixtures?.globalState as Record<string, string | Record<string, boolean> | undefined> | undefined;
    },
  };
}

/**
 * Helper functions for workflow state management via API
 */
export interface WorkflowStateManager {
  getWorkflowState(): Promise<{ state: string; timestamp: string }>;
  setWorkflowState(state: string): Promise<void>;
  getAnnotations(): Promise<unknown[]>;
  saveAnnotations(annotations: unknown[]): Promise<void>;
}

/**
 * Creates browser-side workflow state manager
 * Calls /api/workflow/state and /api/annotations endpoints
 */
export function createBrowserWorkflowManager(baseUrl: string = ''): WorkflowStateManager {
  return {
    async getWorkflowState(): Promise<{ state: string; timestamp: string }> {
      const response = await fetch(`${baseUrl}/api/workflow/state`);

      if (!response.ok) {
        throw new Error(`Failed to get workflow state: ${response.statusText}`);
      }

      return response.json();
    },

    async setWorkflowState(state: string): Promise<void> {
      const response = await fetch(`${baseUrl}/api/workflow/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set workflow state: ${response.statusText}`);
      }
    },

    async getAnnotations(): Promise<unknown[]> {
      const response = await fetch(`${baseUrl}/api/annotations`);

      if (!response.ok) {
        throw new Error(`Failed to get annotations: ${response.statusText}`);
      }

      return response.json();
    },

    async saveAnnotations(annotations: unknown[]): Promise<void> {
      const response = await fetch(`${baseUrl}/api/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotations),
      });

      if (!response.ok) {
        throw new Error(`Failed to save annotations: ${response.statusText}`);
      }
    },
  };
}
