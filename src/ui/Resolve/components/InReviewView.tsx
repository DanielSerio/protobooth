import { Button } from '@/ui/Core/components';

interface InReviewViewProps {
  downloadProgress: number | null;
  onDownloadAnnotations: () => void;
  onResetWorkflow: () => void;
}

/**
 * View component for the "In Review" workflow state
 */
export function InReviewView({
  downloadProgress,
  onDownloadAnnotations,
  onResetWorkflow,
}: InReviewViewProps) {
  return (
    <div className='workflow-state' data-testid='workflow-in-review'>
      <h2>In Review</h2>
      <p>Waiting for client feedback on staging server.</p>

      <div className='actions'>
        <Button
          onClick={onDownloadAnnotations}
          disabled={downloadProgress !== null}
          data-testid='download-annotations-button'>
          {downloadProgress !== null
            ? `Downloading... ${downloadProgress}%`
            : 'Download Annotations'}
        </Button>
        <Button
          onClick={onResetWorkflow}
          variant='secondary'
          data-testid='start-new-review-button'>
          Start New Review
        </Button>
      </div>
    </div>
  );
}
