import React from 'react';
import { Layout, StatusBadge, Sidebar, ToolbarStack } from '@/ui/Core/components';
import {
  useWorkflowState,
  useAnnotations,
  useScreenshotCapture,
  useResolveHandlers,
} from '../hooks';
import { ErrorMessage } from './ErrorMessage';
import { InDevelopmentView } from './InDevelopmentView';
import { ReviewsRequestedView } from './ReviewsRequestedView';
import { InReviewView } from './InReviewView';
import { SubmittedForDevelopmentView } from './SubmittedForDevelopmentView';
import {
  defaultFileOps,
  defaultScreenshotService,
  defaultFixtureManager,
} from './defaultServices';
import type { ResolveAppProps } from './ResolveApp.props';
import '../../styles/resolve-ui/index.scss';

/**
 * Main component for the resolver app. This will be injected into the router.
 */
export function ResolveApp({
  fileOperations = defaultFileOps,
  screenshotService = defaultScreenshotService,
  fixtureManager = defaultFixtureManager,
}: ResolveAppProps = {}) {
  const {
    workflowState,
    isLoading: isStateLoading,
    error: stateError,
    updateWorkflowState,
    resetWorkflow,
  } = useWorkflowState({ fileOperations });

  const {
    annotations,
    error: annotationsError,
    progressStats,
    markAsResolved,
    markAsInProgress,
    downloadAnnotations,
    downloadProgress,
  } = useAnnotations({ fileOperations });

  const {
    isCapturing,
    captureProgress,
    error: captureError,
    lastCaptureResult,
    captureScreenshots,
    getValidationErrors,
  } = useScreenshotCapture({
    fixtureManager,
    screenshotService,
    fileOperations,
  });

  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  // Check validation on mount and state changes
  React.useEffect(() => {
    getValidationErrors().then(setValidationErrors);
  }, [getValidationErrors, workflowState]);

  const { handleRequestReview, handleDownloadAnnotations, handleResetWorkflow } =
    useResolveHandlers({
      getValidationErrors,
      setValidationErrors,
      updateWorkflowState,
      captureScreenshots,
      downloadAnnotations,
      resetWorkflow,
    });

  const renderWorkflowContent = () => {
    if (isStateLoading) {
      return (
        <div className='loading-state'>
          <p>Loading workflow state...</p>
        </div>
      );
    }

    switch (workflowState) {
      case 'in-development':
        return (
          <InDevelopmentView
            validationErrors={validationErrors}
            isCapturing={isCapturing}
            captureProgress={captureProgress}
            onRequestReview={handleRequestReview}
          />
        );

      case 'reviews-requested':
        return (
          <ReviewsRequestedView
            captureProgress={captureProgress}
            lastCaptureResult={lastCaptureResult}
          />
        );

      case 'in-review':
        return (
          <InReviewView
            downloadProgress={downloadProgress}
            onDownloadAnnotations={handleDownloadAnnotations}
            onResetWorkflow={handleResetWorkflow}
          />
        );

      case 'submitted-for-development':
        return (
          <SubmittedForDevelopmentView
            progressStats={progressStats}
            annotations={annotations}
            onMarkAsResolved={markAsResolved}
            onMarkAsInProgress={markAsInProgress}
            onResetWorkflow={handleResetWorkflow}
          />
        );

      default:
        return (
          <div className='workflow-state'>
            <h2>Unknown State</h2>
            <p>Workflow is in an unknown state.</p>
          </div>
        );
    }
  };

  const anyError = stateError || annotationsError || captureError;

  return (
    <Layout
      id='protobooth-resolve'
      className='resolve-app'
      data-testid='resolve-app'>
      <Sidebar>
        <h1>Sidebar</h1>
      </Sidebar>
      <ToolbarStack>
        <ToolbarStack.Toolbar id='toolMenu'>
          <h1>Tools</h1>
        </ToolbarStack.Toolbar>
        <ToolbarStack.Toolbar id='navMenu'>
          <h1>Navigation</h1>
        </ToolbarStack.Toolbar>
      </ToolbarStack>
      <div className='header'>
        <h1>protobooth Development Interface</h1>
        <StatusBadge status={workflowState} data-testid='workflow-status' />
      </div>

      <div className='content'>
        {anyError && (
          <ErrorMessage
            title='Error'
            message={anyError}
            className='error-message'
            data-testid='general-error'
          />
        )}

        {renderWorkflowContent()}
      </div>
    </Layout>
  );
}
