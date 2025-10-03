import { createWorkflowHandler } from '@/api/workflow-handler';
import type { ProtoboothConfig } from '@/types/config';
import type { CaptureRequest } from '@/types/screenshot';
import type { Annotation } from '@/types/annotations';
import type { WorkflowState } from '@/core/workflow-state-manager';

// Generic types to avoid version conflicts with Next.js
interface GenericRequest {
  method?: string;
  json: () => Promise<unknown>;
}

/**
 * Create API route handlers for Next.js App Router
 */
export function createNextApiHandler(config: ProtoboothConfig, projectRoot: string = process.cwd()) {
  const workflowHandler = createWorkflowHandler(projectRoot, config);
  const fileStorage = workflowHandler.getFileStorage();

  return async function handleApiRequest(req: GenericRequest, context: { params: { path: string[] } }): Promise<unknown> {
    // Import NextResponse dynamically to use the app's version
    const { NextResponse } = await import('next/server');
    const pathSegments = context.params.path || [];
    const path = '/' + pathSegments.join('/');
    const method = req.method;

    try {
      // Handle file operations
      if (pathSegments[0] === 'files' && pathSegments.length > 1) {
        const filename = decodeURIComponent(pathSegments.slice(1).join('/'));

        if (method === 'GET') {
          try {
            const content = await fileStorage.readFile(filename);
            return NextResponse.json(JSON.parse(content));
          } catch (error) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
          }
        }

        if (method === 'HEAD') {
          const exists = await fileStorage.fileExists(filename);
          return new NextResponse(null, { status: exists ? 200 : 404 });
        }

        if (method === 'POST') {
          const body = await req.json() as { content: string };
          await fileStorage.writeFile(filename, body.content);
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
      }

      // Handle screenshot capture
      if (path === '/screenshots/capture' && method === 'POST') {
        console.log('[Protobooth] Starting screenshot capture...');
        const captureRequest = await req.json() as CaptureRequest;
        console.log('[Protobooth] Capture request:', captureRequest);
        const result = await workflowHandler.captureScreenshots(captureRequest);
        console.log('[Protobooth] Screenshot capture complete:', result.screenshots.length, 'screenshots');
        return NextResponse.json(result);
      }

      // Handle workflow state
      if (path === '/workflow/state') {
        if (method === 'GET') {
          const state = await workflowHandler.getWorkflowState();
          return NextResponse.json(state);
        }

        if (method === 'POST') {
          const body = await req.json() as { state: WorkflowState };
          await workflowHandler.setWorkflowState(body.state);
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
      }

      // Handle annotations
      if (path === '/annotations') {
        if (method === 'GET') {
          const annotations = await workflowHandler.getAnnotations();
          return NextResponse.json(annotations);
        }

        if (method === 'POST') {
          const annotations = await req.json() as Annotation[];
          await workflowHandler.saveAnnotations(annotations);
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
      }

      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      console.error('[Protobooth] API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  };
}
