import { ToolbarStack } from '@/ui/Core/components';
import { Button } from '@/ui/Core/components';

interface ResolveToolsProps {
  workflowState: 'in-development' | 'reviews-requested' | 'in-review' | 'submitted-for-development';
  isCapturing: boolean;
  validationErrors: string[];
  downloadProgress: number | null;
  onRequestReview: () => void;
  onRecapture: () => void;
  onDownloadAnnotations: () => void;
  onResetWorkflow: () => void;
}

export default function ResolveTools({
  workflowState,
  isCapturing,
  validationErrors,
  downloadProgress,
  onRequestReview,
  onRecapture,
  onDownloadAnnotations,
  onResetWorkflow,
}: ResolveToolsProps) {
  const classNames = 'flex justify-between';

  const renderButtons = () => {
    switch (workflowState) {
      case 'in-development':
        return (
          <Button
            onClick={onRequestReview}
            disabled={isCapturing || validationErrors.length > 0}
            variant="primary"
            data-testid="request-review-button"
          >
            {isCapturing ? 'Capturing...' : 'Request Review'}
          </Button>
        );

      case 'reviews-requested':
        return (
          <Button
            onClick={onRecapture}
            disabled={isCapturing}
            variant="secondary"
            data-testid="recapture-button"
          >
            {isCapturing ? 'Recapturing...' : 'Recapture Screenshots'}
          </Button>
        );

      case 'in-review':
        return (
          <>
            <Button
              onClick={onDownloadAnnotations}
              disabled={downloadProgress !== null}
              variant="primary"
              data-testid="download-annotations-button"
            >
              {downloadProgress !== null
                ? `Downloading... ${downloadProgress}%`
                : 'Download Annotations'}
            </Button>
            <Button
              onClick={onResetWorkflow}
              variant="secondary"
              data-testid="start-new-review-button"
            >
              Start New Review
            </Button>
          </>
        );

      case 'submitted-for-development':
        return (
          <Button
            onClick={onResetWorkflow}
            variant="secondary"
            data-testid="start-new-review-cycle-button"
          >
            Start New Review Cycle
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <ToolbarStack.Toolbar className={classNames} id='toolMenu'>
      <ToolbarStack.Area>
        {renderButtons()}
      </ToolbarStack.Area>
    </ToolbarStack.Toolbar>
  );
}
