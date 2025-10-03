import { Button } from '@/ui/Core/components';
import { DeploymentInstructions } from './DeploymentInstructions';

interface CaptureResultSummary {
  screenshotCount: number;
  outputPath: string;
  deploymentInstructions?: string[];
}

interface ReviewsRequestedViewProps {
  captureProgress: string | null;
  lastCaptureResult: CaptureResultSummary | null;
  isCapturing: boolean;
  onRecapture: () => void;
}

/**
 * View component for the "Reviews Requested" workflow state
 */
export function ReviewsRequestedView({
  captureProgress,
  lastCaptureResult,
  isCapturing,
  onRecapture,
}: ReviewsRequestedViewProps) {
  return (
    <div className='workflow-state' data-testid='workflow-reviews-requested'>
      <h2 data-testid='workflow-state-title'>Reviews Requested</h2>

      {!lastCaptureResult && <p>Screenshots are being captured...</p>}

      {captureProgress && (
        <div className='progress-info' data-testid='capture-progress'>
          <p>{captureProgress}</p>
        </div>
      )}

      {lastCaptureResult && (
        <>
          <DeploymentInstructions
            screenshotCount={lastCaptureResult.screenshotCount}
            outputPath={lastCaptureResult.outputPath}
            instructions={lastCaptureResult.deploymentInstructions || []}
            data-testid='deployment-instructions'
          />

          <div className='actions'>
            <Button
              onClick={onRecapture}
              disabled={isCapturing}
              data-testid='recapture-button'>
              {isCapturing ? 'Recapturing...' : 'Recapture Screenshots'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
