import { WorkflowStateManager } from '@/core/workflow-state-manager';
import { FileStorage } from '@/core/file-storage';
import { handleScreenshotCapture } from './screenshot-handler';
import type { ProtoboothConfig } from '@/types/config';
import type { CaptureRequest } from '@/types/screenshot';

/**
 * Create workflow API handler with file operations
 */
export function createWorkflowHandler(projectRoot: string, config: ProtoboothConfig) {
  const fileStorage = new FileStorage(projectRoot);
  const stateManager = new WorkflowStateManager(fileStorage);

  return {
    /**
     * Get current workflow state
     */
    async getWorkflowState() {
      return await stateManager.getWorkflowState();
    },

    /**
     * Update workflow state
     */
    async setWorkflowState(state: 'in-development' | 'reviews-requested' | 'in-review' | 'submitted-for-development') {
      await stateManager.setWorkflowState(state);
    },

    /**
     * Get annotations
     */
    async getAnnotations() {
      return await stateManager.getAnnotations();
    },

    /**
     * Save annotations
     */
    async saveAnnotations(annotations: unknown[]) {
      await stateManager.saveAnnotations(annotations as never[]);
    },

    /**
     * Capture screenshots and update state
     */
    async captureScreenshots(request: CaptureRequest) {
      // Use server's project root if client didn't provide one
      const captureRequest = {
        ...request,
        projectPath: request.projectPath || projectRoot
      };

      console.log('[Protobooth] Using project root:', projectRoot);
      console.log('[Protobooth] Final capture request:', captureRequest);

      // Capture screenshots
      const result = await handleScreenshotCapture(captureRequest, config, projectRoot);

      // Update workflow state
      await stateManager.setWorkflowState('reviews-requested', {
        screenshotCount: result.screenshots.length,
        outputPath: result.outputDirectory || '.protobooth/screenshots'
      });

      return result;
    },

    /**
     * Reset workflow
     */
    async resetWorkflow() {
      await stateManager.resetWorkflow();
    },

    /**
     * Get file storage for direct file operations
     */
    getFileStorage() {
      return fileStorage;
    }
  };
}
