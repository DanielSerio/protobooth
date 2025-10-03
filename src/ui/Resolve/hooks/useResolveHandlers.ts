import React from 'react';
import type { CaptureOptions } from '../components/ResolveApp.props';
import type { ProtoboothConfig } from '@/types/config';

interface CaptureResult {
  success: boolean;
  screenshotCount: number;
  outputPath: string;
  deploymentInstructions?: string[];
}

interface UseResolveHandlersParams {
  getValidationErrors: () => Promise<string[]>;
  setValidationErrors: (errors: string[]) => void;
  updateWorkflowState: (
    state:
      | 'in-development'
      | 'reviews-requested'
      | 'in-review'
      | 'submitted-for-development'
  ) => Promise<void>;
  captureScreenshots: (options: CaptureOptions) => Promise<CaptureResult>;
  downloadAnnotations: (stagingUrl?: string) => Promise<string | null>;
  resetWorkflow: () => Promise<void>;
  config?: ProtoboothConfig;
}

/**
 * Custom hook that provides event handlers for the ResolveApp component
 */
export function useResolveHandlers({
  getValidationErrors,
  setValidationErrors,
  updateWorkflowState,
  captureScreenshots,
  downloadAnnotations,
  resetWorkflow,
  config,
}: UseResolveHandlersParams) {
  const handleRequestReview = React.useCallback(async () => {
    try {
      const errors = await getValidationErrors();
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      await updateWorkflowState('reviews-requested');

      try {
        await captureScreenshots({
          appUrl: window.location.origin,
          projectPath: config?.projectPath || process.cwd(),
          routerType: config?.routerType || 'vite',
          authState: 'authenticated',
        });

        // Note: Don't automatically transition to 'in-review'
        // The user should manually proceed after seeing deployment instructions
      } catch (captureError) {
        // Screenshot capture failed, but error state is already set in the hook
        // Don't update workflow state if capture failed
        console.error('Failed to capture screenshots:', captureError);
      }
    } catch (error) {
      console.error('Failed to request review:', error);
    }
  }, [getValidationErrors, setValidationErrors, updateWorkflowState, captureScreenshots, config]);

  const handleDownloadAnnotations = React.useCallback(async () => {
    try {
      await downloadAnnotations();
      await updateWorkflowState('submitted-for-development');
    } catch (error) {
      console.error('Failed to download annotations:', error);
    }
  }, [downloadAnnotations, updateWorkflowState]);

  const handleResetWorkflow = React.useCallback(async () => {
    try {
      await resetWorkflow();
    } catch (error) {
      console.error('Failed to reset workflow:', error);
    }
  }, [resetWorkflow]);

  return {
    handleRequestReview,
    handleDownloadAnnotations,
    handleResetWorkflow,
  };
}
