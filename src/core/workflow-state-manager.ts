import type { FileOperations } from '@/types/file-operations';
import type { Annotation } from '@/types/annotations';

export type WorkflowState =
  | 'in-development'
  | 'reviews-requested'
  | 'in-review'
  | 'submitted-for-development';

export interface WorkflowStateData {
  state: WorkflowState;
  timestamp: string;
  lastCaptureResult?: {
    screenshotCount: number;
    outputPath: string;
  };
}

/**
 * Manages workflow state persistence using FileStorage
 */
export class WorkflowStateManager {
  private static readonly WORKFLOW_FILE = 'workflow-state.json';
  private static readonly ANNOTATIONS_FILE = 'annotations.json';

  constructor(private fileOps: FileOperations) {}

  /**
   * Get current workflow state
   */
  async getWorkflowState(): Promise<WorkflowStateData> {
    try {
      const content = await this.fileOps.readFile(WorkflowStateManager.WORKFLOW_FILE);
      return JSON.parse(content);
    } catch {
      // Return default state if file doesn't exist
      return {
        state: 'in-development',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update workflow state
   */
  async setWorkflowState(state: WorkflowState, captureResult?: { screenshotCount: number; outputPath: string }): Promise<void> {
    const data: WorkflowStateData = {
      state,
      timestamp: new Date().toISOString(),
      lastCaptureResult: captureResult
    };
    await this.fileOps.writeFile(
      WorkflowStateManager.WORKFLOW_FILE,
      JSON.stringify(data, null, 2)
    );
  }

  /**
   * Get all annotations
   */
  async getAnnotations(): Promise<Annotation[]> {
    try {
      const content = await this.fileOps.readFile(WorkflowStateManager.ANNOTATIONS_FILE);
      return JSON.parse(content);
    } catch {
      // Return empty array if file doesn't exist
      return [];
    }
  }

  /**
   * Save annotations
   */
  async saveAnnotations(annotations: Annotation[]): Promise<void> {
    await this.fileOps.writeFile(
      WorkflowStateManager.ANNOTATIONS_FILE,
      JSON.stringify(annotations, null, 2)
    );
  }

  /**
   * Reset workflow to initial state
   */
  async resetWorkflow(): Promise<void> {
    await this.setWorkflowState('in-development');
    await this.saveAnnotations([]);
  }
}
