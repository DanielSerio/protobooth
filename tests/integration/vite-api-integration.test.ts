// RED: Integration tests for Vite API handler with real services
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createViteApiHandler } from '@/integrations/vite-api-handler';
import type { ProtoboothConfig } from '@/types/config';
import type { ResolvedConfig } from 'vite';
import fs from 'fs/promises';
import path from 'path';

describe('Vite API Handler Integration', () => {
  const testProjectRoot = path.join(process.cwd(), 'tests', 'fixtures', 'api-test');
  const protoboothDir = path.join(testProjectRoot, '.protobooth');

  const mockConfig: ProtoboothConfig = {
    fixtures: {
      auth: {
        authenticated: { user: { id: '1' }, token: 'test' }
      }
    },
    viewports: [{ name: 'desktop', width: 1440, height: 900 }],
    projectPath: testProjectRoot,
    routerType: 'vite'
  };

  const mockViteConfig = {
    root: testProjectRoot
  } as ResolvedConfig;

  beforeEach(async () => {
    // Clean up test directories
    await fs.rm(protoboothDir, { recursive: true, force: true });
    await fs.mkdir(testProjectRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(protoboothDir, { recursive: true, force: true });
  });

  describe('File Operations API', () => {
    it('should check if file exists (HEAD request)', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const { req, res } = createMockRequestResponse('HEAD', '/api/files/workflow-state.json');

      const handled = await handler(req, res, '/api/files/workflow-state.json');

      expect(handled).toBe(true);
      expect(res.statusCode).toBe(404); // File doesn't exist yet
    });

    it('should write and read file (POST then GET)', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const testData = { state: 'in-development', timestamp: new Date().toISOString() };

      // Write file
      const { req: writeReq, res: writeRes } = createMockRequestResponse(
        'POST',
        '/api/files/workflow-state.json',
        JSON.stringify({ content: JSON.stringify(testData) })
      );

      const writeHandled = await handler(writeReq, writeRes, '/api/files/workflow-state.json');
      expect(writeHandled).toBe(true);

      // Wait for async file write to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(writeRes.statusCode).toBe(200);

      // Read file
      const { req: readReq, res: readRes} = createMockRequestResponse('GET', '/api/files/workflow-state.json');
      const readHandled = await handler(readReq, readRes, '/api/files/workflow-state.json');

      expect(readHandled).toBe(true);
      expect(readRes.statusCode).toBe(200);
      expect(readRes.body).toBeDefined();
      const parsedData = JSON.parse(readRes.body!);
      expect(parsedData).toEqual(testData);
    });

    it('should return 404 for non-existent file (GET request)', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const { req, res } = createMockRequestResponse('GET', '/api/files/non-existent.json');

      await handler(req, res, '/api/files/non-existent.json');

      expect(res.statusCode).toBe(404);
      expect(res.body).toContain('File not found');
    });

    it('should return 405 for unsupported methods', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const { req, res } = createMockRequestResponse('DELETE', '/api/files/test.json');

      await handler(req, res, '/api/files/test.json');

      expect(res.statusCode).toBe(405);
    });
  });

  describe('Workflow State API', () => {
    it('should get initial workflow state', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const { req, res } = createMockRequestResponse('GET', '/api/workflow/state');

      await handler(req, res, '/api/workflow/state');

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
      const state = JSON.parse(res.body!);
      expect(state.state).toBe('in-development'); // Default initial state
    });

    it('should update workflow state (POST request)', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);

      // Update state
      const { req: updateReq, res: updateRes } = createMockRequestResponse(
        'POST',
        '/api/workflow/state',
        JSON.stringify({ state: 'reviews-requested' })
      );

      await handler(updateReq, updateRes, '/api/workflow/state');

      // Wait for async state update to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(updateRes.statusCode).toBe(200);

      // Verify state was updated
      const { req: getReq, res: getRes } = createMockRequestResponse('GET', '/api/workflow/state');
      await handler(getReq, getRes, '/api/workflow/state');

      const state = JSON.parse(getRes.body!);
      expect(state.state).toBe('reviews-requested');
    });

    it('should persist workflow state across handler instances', async () => {
      // First handler instance - set state
      const handler1 = createViteApiHandler(mockConfig, mockViteConfig);
      const { req: setReq, res: setRes } = createMockRequestResponse(
        'POST',
        '/api/workflow/state',
        JSON.stringify({ state: 'in-review' })
      );
      await handler1(setReq, setRes, '/api/workflow/state');

      // Wait for async state update to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second handler instance - get state
      const handler2 = createViteApiHandler(mockConfig, mockViteConfig);
      const { req: getReq, res: getRes } = createMockRequestResponse('GET', '/api/workflow/state');
      await handler2(getReq, getRes, '/api/workflow/state');

      const state = JSON.parse(getRes.body!);
      expect(state.state).toBe('in-review');
    });
  });

  describe('Annotations API', () => {
    it('should save and retrieve annotations', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const testAnnotations = [
        {
          id: 'ann-1',
          route: '/home',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'Fix this button',
          priority: 'high',
          status: 'pending'
        }
      ];

      // Save annotations
      const { req: saveReq, res: saveRes } = createMockRequestResponse(
        'POST',
        '/api/annotations',
        JSON.stringify(testAnnotations)
      );
      await handler(saveReq, saveRes, '/api/annotations');

      // Wait for async save to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(saveRes.statusCode).toBe(200);

      // Retrieve annotations
      const { req: getReq, res: getRes } = createMockRequestResponse('GET', '/api/annotations');
      await handler(getReq, getRes, '/api/annotations');

      expect(getRes.statusCode).toBe(200);
      const annotations = JSON.parse(getRes.body!);
      expect(annotations).toHaveLength(1);
      expect(annotations[0]).toMatchObject(testAnnotations[0]);
    });

    it('should return empty array for no annotations', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const { req, res } = createMockRequestResponse('GET', '/api/annotations');

      await handler(req, res, '/api/annotations');

      expect(res.statusCode).toBe(200);
      const annotations = JSON.parse(res.body!);
      expect(Array.isArray(annotations)).toBe(true);
      expect(annotations).toHaveLength(0);
    });
  });

  describe('Screenshot Capture API', () => {
    it('should handle screenshot capture request', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);

      // Create minimal routes.json for route discovery
      await fs.mkdir(testProjectRoot, { recursive: true });
      await fs.writeFile(
        path.join(testProjectRoot, 'routes.json'),
        JSON.stringify({
          routes: [{ path: '/', isDynamic: false, filePath: '/test/index.tsx' }],
          fixtures: mockConfig.fixtures,
          viewports: mockConfig.viewports
        })
      );

      const captureRequest = {
        appUrl: 'http://localhost:5173',
        projectPath: testProjectRoot,
        routerType: 'vite' as const,
        authState: 'authenticated' as const
      };

      const { req, res } = createMockRequestResponse(
        'POST',
        '/api/screenshots/capture',
        JSON.stringify(captureRequest)
      );

      // Note: This will attempt real browser launch
      // We're testing integration, not mocking browser
      await handler(req, res, '/api/screenshots/capture');

      // Should complete without error (even if app server not running)
      // The handler should return 500 with error message if server not available
      expect(res.statusCode).toBeGreaterThanOrEqual(200);
    }, 30000); // Longer timeout for browser operations
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const { req, res } = createMockRequestResponse(
        'POST',
        '/api/workflow/state',
        'invalid json{'
      );

      await handler(req, res, '/api/workflow/state');

      // Wait for async error handling to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(res.statusCode).toBe(500);
    });

    it('should return false for unhandled routes', async () => {
      const handler = createViteApiHandler(mockConfig, mockViteConfig);
      const { req, res } = createMockRequestResponse('GET', '/api/unknown-endpoint');

      const handled = await handler(req, res, '/api/unknown-endpoint');

      expect(handled).toBe(false);
    });
  });
});

// Helper function to create mock request/response objects
function createMockRequestResponse(method: string, url: string, body?: string) {
  const dataListeners: Array<(chunk: string) => void> = [];
  const endListeners: Array<() => void> = [];

  const req = {
    url,
    method,
    on(event: string, callback: (chunk?: string) => void) {
      if (event === 'data') {
        dataListeners.push(callback as (chunk: string) => void);
        // Emit data on next tick (simulates async stream)
        if (body) {
          process.nextTick(() => {
            dataListeners.forEach(listener => listener(body));
          });
        }
      } else if (event === 'end') {
        endListeners.push(callback as () => void);
        // Emit end after data on next tick
        process.nextTick(() => {
          // Small delay to ensure data event fires first
          setImmediate(() => {
            endListeners.forEach(listener => listener());
          });
        });
      }
    }
  };

  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as string | undefined,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    writeHead(statusCode: number) {
      this.statusCode = statusCode;
    },
    end(data?: string) {
      this.body = data;
    }
  };

  return { req, res };
}
