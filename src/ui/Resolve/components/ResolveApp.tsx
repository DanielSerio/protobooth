import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { Layout, Button, StatusBadge, ProgressBar } from '@/ui/Core/components';
import { useWorkflowState, useAnnotations, useScreenshotCapture } from '../hooks';
import { AnnotationList } from './AnnotationList';
import { DeploymentInstructions } from './DeploymentInstructions';
import { ErrorMessage } from './ErrorMessage';
import '../../styles/resolve-ui/index.scss';

interface FileOperations {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  fileExists: (path: string) => Promise<boolean>;
}

interface ScreenshotService {
  captureRoutes: (options: any) => Promise<any>;
}

interface ResolveAppProps {
  fileOperations?: FileOperations;
  screenshotService?: ScreenshotService;
  fixtureManager?: any;
}

// Default implementations for production use
const defaultFileOps: FileOperations = {
  readFile: async (path: string) => {
    if (path.includes('workflow-state.json')) {
      return JSON.stringify({ state: 'in-development', timestamp: new Date().toISOString() });
    }
    if (path.includes('annotations.json')) {
      return JSON.stringify([]);
    }
    return '{}';
  },
  writeFile: async (_path: string, _content: string) => {
    // Production implementation would write to filesystem
  },
  fileExists: async (path: string) => {
    return path.includes('protobooth.config.json');
  }
};

const defaultScreenshotService: ScreenshotService = {
  captureRoutes: async () => ({
    screenshots: [
      { route: '/', viewport: 'desktop', filePath: '/temp/home-desktop.png' },
      { route: '/', viewport: 'mobile', filePath: '/temp/home-mobile.png' }
    ],
    injectedFixtures: { auth: { user: { id: '123' } } },
    outputDirectory: '/temp/screenshots'
  })
};

/**
 * Main component for the resolver app. This will be injected into the router.
 */
export function ResolveApp({
  fileOperations = defaultFileOps,
  screenshotService = defaultScreenshotService,
  fixtureManager = {}
}: ResolveAppProps = {}) {
  const {
    workflowState,
    isLoading: isStateLoading,
    error: stateError,
    updateWorkflowState,
    resetWorkflow
  } = useWorkflowState({ fileOperations });

  const {
    annotations,
    isLoading: isAnnotationsLoading,
    error: annotationsError,
    progressStats,
    markAsResolved,
    markAsInProgress,
    downloadAnnotations,
    downloadProgress
  } = useAnnotations({ fileOperations });

  const {
    isCapturing,
    captureProgress,
    error: captureError,
    lastCaptureResult,
    captureScreenshots,
    getValidationErrors
  } = useScreenshotCapture({
    fixtureManager,
    screenshotService,
    fileOperations
  });

  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  // Check validation on mount and state changes
  React.useEffect(() => {
    getValidationErrors().then(setValidationErrors);
  }, [getValidationErrors, workflowState]);

  const handleRequestReview = async () => {
    try {
      const errors = await getValidationErrors();
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      await updateWorkflowState('reviews-requested');

      try {
        await captureScreenshots({
          appUrl: 'http://localhost:5173',
          projectPath: '/demo/project',
          routerType: 'vite',
          authState: 'authenticated'
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
  };

  const handleDownloadAnnotations = async () => {
    try {
      await downloadAnnotations();
      await updateWorkflowState('submitted-for-development');
    } catch (error) {
      console.error('Failed to download annotations:', error);
    }
  };

  const handleResetWorkflow = async () => {
    try {
      await resetWorkflow();
    } catch (error) {
      console.error('Failed to reset workflow:', error);
    }
  };

  const renderWorkflowContent = () => {
    if (isStateLoading) {
      return (
        <div className="protobooth-resolve__loading">
          <p>Loading workflow state...</p>
        </div>
      );
    }

    switch (workflowState) {
      case 'in-development':
        return (
          <div className="protobooth-resolve__development" data-testid="workflow-in-development">
            <h2>In Development</h2>
            <p>Ready to request client review of your prototype.</p>

            {validationErrors.length > 0 && (
              <ErrorMessage
                title="Configuration Required"
                message="Please configure fixtures before requesting review"
                details={validationErrors}
                data-testid="configuration-error"
              />
            )}

            <div className="protobooth-resolve__actions">
              <Button
                onClick={handleRequestReview}
                disabled={isCapturing || validationErrors.length > 0}
                className="protobooth-resolve__primary-button"
                data-testid="request-review-button"
              >
                {isCapturing ? 'Capturing Screenshots...' : 'Request Review'}
              </Button>
            </div>

            {captureProgress && (
              <div className="protobooth-resolve__progress" data-testid="capture-progress">
                <p>{captureProgress}</p>
              </div>
            )}
          </div>
        );

      case 'reviews-requested':
        return (
          <div className="protobooth-resolve__requested" data-testid="workflow-reviews-requested">
            <h2>Reviews Requested</h2>
            <p>Screenshots are being captured...</p>

            {captureProgress && (
              <div className="protobooth-resolve__progress" data-testid="capture-progress">
                <p>{captureProgress}</p>
              </div>
            )}

            {lastCaptureResult && (
              <DeploymentInstructions
                screenshotCount={lastCaptureResult.screenshotCount}
                outputPath={lastCaptureResult.outputPath}
                instructions={lastCaptureResult.deploymentInstructions || []}
                data-testid="deployment-instructions"
              />
            )}
          </div>
        );

      case 'in-review':
        return (
          <div className="protobooth-resolve__review" data-testid="workflow-in-review">
            <h2>In Review</h2>
            <p>Waiting for client feedback on staging server.</p>

            <div className="protobooth-resolve__actions">
              <Button
                onClick={handleDownloadAnnotations}
                disabled={downloadProgress !== null}
                data-testid="download-annotations-button"
              >
                {downloadProgress !== null ? `Downloading... ${downloadProgress}%` : 'Download Annotations'}
              </Button>
              <Button
                onClick={handleResetWorkflow}
                variant="secondary"
                data-testid="start-new-review-button"
              >
                Start New Review
              </Button>
            </div>
          </div>
        );

      case 'submitted-for-development':
        return (
          <div className="protobooth-resolve__submitted" data-testid="workflow-submitted-for-development">
            <h2>Submitted For Development</h2>
            <p data-testid="annotations-count">{progressStats.total} annotations ready for resolution.</p>

            {progressStats.total > 0 && (
              <ProgressBar
                value={progressStats.resolved}
                max={progressStats.total}
                label={`${progressStats.resolved} of ${progressStats.total} annotations resolved`}
                className="protobooth-resolve__progress-bar"
                data-testid="resolution-progress"
              />
            )}

            <AnnotationList
              annotations={annotations}
              onMarkAsResolved={markAsResolved}
              onMarkAsInProgress={markAsInProgress}
              data-testid="annotation-list"
            />

            <div className="protobooth-resolve__actions">
              <Button
                onClick={handleResetWorkflow}
                data-testid="start-new-review-cycle-button"
              >
                Start New Review Cycle
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="protobooth-resolve__unknown">
            <h2>Unknown State</h2>
            <p>Workflow is in an unknown state.</p>
            <Button onClick={handleResetWorkflow}>Reset Workflow</Button>
          </div>
        );
    }
  };

  const anyError = stateError || annotationsError || captureError;

  return (
    <Layout id="protobooth-resolve" className="protobooth-resolve" data-testid="resolve-app">
      <div className="protobooth-resolve__header">
        <h1>protobooth Development Interface</h1>
        <StatusBadge status={workflowState} data-testid="workflow-status" />
      </div>

      <div className="protobooth-resolve__content">
        {anyError && (
          <ErrorMessage
            title="Error"
            message={anyError}
            className="protobooth-resolve__error"
            data-testid="general-error"
          />
        )}

        {renderWorkflowContent()}
      </div>
    </Layout>
  );
}
