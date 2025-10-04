import { useState, useEffect, useCallback } from 'react';
import { VERSION, isCompatibleVersion } from '@/version';

export type WorkflowState = 'in-development' | 'reviews-requested' | 'in-review' | 'submitted-for-development';

export interface WorkflowStateData {
  version: string;
  state: WorkflowState;
  timestamp: string;
  lastCaptureResult?: {
    screenshotCount: number;
    outputPath: string;
  };
}

interface UseWorkflowStateOptions {
  fileOperations: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    fileExists: (path: string) => Promise<boolean>;
  };
}

export function useWorkflowState(options: UseWorkflowStateOptions) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('in-development');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastCaptureResult, setLastCaptureResult] = useState<{ screenshotCount: number; outputPath: string } | null>(null);

  const stateFilePath = 'workflow-state.json';

  const loadWorkflowState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const exists = await options.fileOperations.fileExists(stateFilePath);
      if (!exists) {
        setWorkflowState('in-development');
        setLastUpdated(new Date().toISOString());
        return;
      }

      const stateContent = await options.fileOperations.readFile(stateFilePath);
      const stateData: WorkflowStateData = JSON.parse(stateContent);

      // Check version compatibility
      if (stateData.version && !isCompatibleVersion(stateData.version)) {
        console.warn(
          `Version mismatch: workflow state was created with v${stateData.version}, ` +
          `but you're using v${VERSION}. This may cause compatibility issues.`
        );
      }

      setWorkflowState(stateData.state);
      setLastUpdated(stateData.timestamp);
      setLastCaptureResult(stateData.lastCaptureResult || null);
    } catch (err) {
      console.error('Failed to load workflow state:', err);
      setError('Failed to load workflow state');
      setWorkflowState('in-development');
    } finally {
      setIsLoading(false);
    }
  }, [options.fileOperations, stateFilePath]);

  const updateWorkflowState = useCallback(async (newState: WorkflowState, additionalData?: Partial<WorkflowStateData>) => {
    try {
      setError(null);
      const timestamp = new Date().toISOString();

      const stateData: WorkflowStateData = {
        version: VERSION,
        state: newState,
        timestamp,
        ...additionalData
      };

      await options.fileOperations.writeFile(stateFilePath, JSON.stringify(stateData, null, 2));

      setWorkflowState(newState);
      setLastUpdated(timestamp);
      setLastCaptureResult(stateData.lastCaptureResult || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to save workflow state:', err);
      setError(`Failed to save workflow state: ${errorMessage}`);
      throw err;
    }
  }, [options.fileOperations, stateFilePath]);

  const resetWorkflow = useCallback(async () => {
    await updateWorkflowState('in-development');
  }, [updateWorkflowState]);

  // Load state on mount
  useEffect(() => {
    loadWorkflowState();
  }, [loadWorkflowState]);

  return {
    workflowState,
    isLoading,
    error,
    lastUpdated,
    lastCaptureResult,
    updateWorkflowState,
    resetWorkflow,
    reload: loadWorkflowState
  };
}
