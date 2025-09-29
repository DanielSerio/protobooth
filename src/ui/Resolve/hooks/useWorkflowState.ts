import { useState, useEffect, useCallback } from 'react';

export type WorkflowState = 'in-development' | 'reviews-requested' | 'in-review' | 'submitted-for-development';

export interface WorkflowStateData {
  state: WorkflowState;
  timestamp: string;
  lastScreenshotPath?: string;
  sessionId?: string;
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

  const stateFilePath = 'protobooth-workflow-state.json';

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

      setWorkflowState(stateData.state);
      setLastUpdated(stateData.timestamp);
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
        state: newState,
        timestamp,
        ...additionalData
      };

      await options.fileOperations.writeFile(stateFilePath, JSON.stringify(stateData, null, 2));

      setWorkflowState(newState);
      setLastUpdated(timestamp);
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
    updateWorkflowState,
    resetWorkflow,
    reload: loadWorkflowState
  };
}