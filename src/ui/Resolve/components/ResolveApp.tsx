import React from 'react';
import {
  Layout,
  StatusBadge,
  ConfirmDialog,
  LoadingOverlay,
} from '@/ui/Core/components';
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
import { ResolveSidebar } from './ResolveSidebar';
import { ResolveFooter } from './ResolveFooter/ResolveFooter';

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'default' | 'warning' | 'danger';
  onConfirm: () => void;
}

/**
 * Main component for the resolver app. This will be injected into the router.
 */
export function ResolveApp({
  fileOperations = defaultFileOps,
  screenshotService = defaultScreenshotService,
  fixtureManager = defaultFixtureManager,
  config,
}: ResolveAppProps = {}) {
  const {
    workflowState,
    isLoading: isStateLoading,
    error: stateError,
    lastCaptureResult: persistedCaptureResult,
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
    config,
  });

  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  const [confirmDialog, setConfirmDialog] =
    React.useState<ConfirmationDialogState>({
      isOpen: false,
      title: '',
      message: '',
      variant: 'default',
      onConfirm: () => {},
    });

  // Check validation on mount and state changes
  React.useEffect(() => {
    getValidationErrors().then(setValidationErrors);
  }, [getValidationErrors, workflowState]);

  const {
    handleRequestReview,
    handleDownloadAnnotations,
    handleResetWorkflow,
  } = useResolveHandlers({
    getValidationErrors,
    setValidationErrors,
    updateWorkflowState,
    captureScreenshots,
    downloadAnnotations,
    resetWorkflow,
    config,
  });

  // Wrapper handlers that show confirmation dialogs
  const handleRequestReviewWithConfirm = React.useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: 'Request Review',
      message:
        'This will capture screenshots of all routes with configured fixtures. Continue?',
      variant: 'default',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        handleRequestReview();
      },
    });
  }, [handleRequestReview]);

  const handleRecaptureWithConfirm = React.useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: 'Recapture Screenshots',
      message: 'This will overwrite existing screenshots. Continue?',
      variant: 'warning',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        handleRequestReview();
      },
    });
  }, [handleRequestReview]);

  const handleResetWorkflowWithConfirm = React.useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: 'Start New Review',
      message: 'This will reset the workflow to development state. Continue?',
      variant: 'warning',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        handleResetWorkflow();
      },
    });
  }, [handleResetWorkflow]);

  const handleCancelConfirm = React.useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const renderWorkflowContent = () => {
    if (isStateLoading) {
      return (
        <div className='loading-state'>
          <p>Loading workflow state...</p>
        </div>
      );
    }

    // Use persisted result if available, otherwise use live result from screenshot hook
    const effectiveLastCaptureResult =
      lastCaptureResult || persistedCaptureResult;

    switch (workflowState) {
      case 'in-development':
        return (
          <InDevelopmentView
            validationErrors={validationErrors}
            captureProgress={captureProgress}
          />
        );

      case 'reviews-requested':
        return (
          <ReviewsRequestedView
            captureProgress={captureProgress}
            lastCaptureResult={effectiveLastCaptureResult}
          />
        );

      case 'in-review':
        return <InReviewView />;

      case 'submitted-for-development':
        return (
          <SubmittedForDevelopmentView
            progressStats={progressStats}
            annotations={annotations}
            onMarkAsResolved={markAsResolved}
            onMarkAsInProgress={markAsInProgress}
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
      <ResolveSidebar />
      <ResolveFooter
        workflowState={workflowState}
        isCapturing={isCapturing}
        validationErrors={validationErrors}
        downloadProgress={downloadProgress}
        onRequestReview={handleRequestReviewWithConfirm}
        onRecapture={handleRecaptureWithConfirm}
        onDownloadAnnotations={handleDownloadAnnotations}
        onResetWorkflow={handleResetWorkflowWithConfirm}
      />

      <header className='header'>
        <h1>Protobooth: Resolver</h1>
        <StatusBadge status={workflowState} data-testid='workflow-status' />
      </header>

      <main className='content'>
        {anyError && (
          <ErrorMessage
            title='Error'
            message={anyError}
            className='error-message'
            data-testid='general-error'
          />
        )}

        {renderWorkflowContent()}
      </main>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleCancelConfirm}
      />

      <LoadingOverlay
        isLoading={isCapturing}
        progressText={captureProgress || undefined}
      />
    </Layout>
  );
}
