import { createWorkflowHandler } from '@/api/workflow-handler';
import type { ProtoboothConfig } from '@/types/config';
import type { ResolvedConfig } from 'vite';

interface ViteRequest {
  url?: string;
  method?: string;
  on(event: string, callback: (chunk: unknown) => void): void;
}

interface ViteResponse {
  setHeader(name: string, value: string): void;
  writeHead(statusCode: number): void;
  end(data?: string): void;
}

/**
 * Handle API requests for Vite dev server
 */
export function createViteApiHandler(config: ProtoboothConfig, viteConfig: ResolvedConfig) {
  const projectRoot = viteConfig?.root || process.cwd();
  const workflowHandler = createWorkflowHandler(projectRoot, config);

  return async function handleApiRequest(req: ViteRequest, res: ViteResponse, url: string): Promise<boolean> {
    // Handle file operations
    if (url.startsWith('/api/files/')) {
      const filename = decodeURIComponent(url.replace('/api/files/', ''));
      const fileStorage = workflowHandler.getFileStorage();

      if (req.method === 'GET') {
        try {
          const content = await fileStorage.readFile(filename);
          res.setHeader('Content-Type', 'application/json');
          res.end(content);
        } catch (error) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'File not found' }));
        }
      } else if (req.method === 'HEAD') {
        const exists = await fileStorage.fileExists(filename);
        res.writeHead(exists ? 200 : 404);
        res.end();
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { content } = JSON.parse(body);
            await fileStorage.writeFile(filename, content);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to write file' }));
          }
        });
      } else {
        res.writeHead(405);
        res.end();
      }
      return true;
    }

    // Handle screenshot capture
    if (url === '/api/screenshots/capture' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          console.log('[Protobooth] Starting screenshot capture...');
          const captureRequest = JSON.parse(body);
          console.log('[Protobooth] Capture request:', captureRequest);
          const result = await workflowHandler.captureScreenshots(captureRequest);
          console.log('[Protobooth] Screenshot capture complete:', result.screenshots.length, 'screenshots');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (error) {
          console.error('[Protobooth] Screenshot capture failed:', error);
          res.writeHead(500);
          const errorMessage = error instanceof Error ? error.message : 'Screenshot capture failed';
          res.end(JSON.stringify({ error: errorMessage }));
        }
      });
      return true;
    }

    // Handle workflow state
    if (url === '/api/workflow/state') {
      if (req.method === 'GET') {
        try {
          const state = await workflowHandler.getWorkflowState();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(state));
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to get workflow state' }));
        }
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { state } = JSON.parse(body);
            await workflowHandler.setWorkflowState(state);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to set workflow state' }));
          }
        });
      } else {
        res.writeHead(405);
        res.end();
      }
      return true;
    }

    // Handle annotations
    if (url === '/api/annotations') {
      if (req.method === 'GET') {
        try {
          const annotations = await workflowHandler.getAnnotations();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(annotations));
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to get annotations' }));
        }
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const annotations = JSON.parse(body);
            await workflowHandler.saveAnnotations(annotations);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save annotations' }));
          }
        });
      } else {
        res.writeHead(405);
        res.end();
      }
      return true;
    }

    return false;
  };
}
