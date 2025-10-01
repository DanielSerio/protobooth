import { Button } from '@/ui/Core/components';
import { ErrorMessage } from './ErrorMessage';

interface InDevelopmentViewProps {
  validationErrors: string[];
  isCapturing: boolean;
  captureProgress: string | null;
  onRequestReview: () => void;
}

/**
 * View component for the "In Development" workflow state
 */
export function InDevelopmentView({
  validationErrors,
  isCapturing,
  captureProgress,
  onRequestReview,
}: InDevelopmentViewProps) {
  return (
    <div className='workflow-state' data-testid='workflow-in-development'>
      <h2>In Development</h2>
      <p>Ready to request client review of your prototype.</p>

      {validationErrors.length > 0 && (
        <ErrorMessage
          title='Configuration Required'
          message='Please configure fixtures before requesting review'
          details={validationErrors}
          data-testid='configuration-error'
        />
      )}

      <div className='actions'>
        <Button
          onClick={onRequestReview}
          disabled={isCapturing || validationErrors.length > 0}
          className='btn-primary'
          data-testid='request-review-button'>
          {isCapturing ? 'Capturing Screenshots...' : 'Request Review'}
        </Button>
      </div>

      {captureProgress && (
        <div className='progress-info' data-testid='capture-progress'>
          <p>{captureProgress}</p>
        </div>
      )}
    </div>
  );
}
