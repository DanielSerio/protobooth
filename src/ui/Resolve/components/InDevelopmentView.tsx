import { ErrorMessage } from './ErrorMessage';

interface InDevelopmentViewProps {
  validationErrors: string[];
  captureProgress: string | null;
}

/**
 * View component for the "In Development" workflow state
 */
export function InDevelopmentView({
  validationErrors,
  captureProgress,
}: InDevelopmentViewProps) {
  return (
    <div className='workflow-state' data-testid='workflow-in-development'>
      <h2 data-testid='workflow-state-title'>In Development</h2>
      <p>Ready to request client review of your prototype.</p>

      {validationErrors.length > 0 && (
        <ErrorMessage
          title='Configuration Required'
          message='Please configure fixtures before requesting review'
          details={validationErrors}
          data-testid='configuration-error'
        />
      )}

      {captureProgress && (
        <div className='progress-info' data-testid='capture-progress'>
          <p>{captureProgress}</p>
        </div>
      )}
    </div>
  );
}
