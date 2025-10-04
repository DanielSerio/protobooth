import { ProgressBar } from '@/ui/Core/components';
import { AnnotationList } from './AnnotationList';
import type { Annotation } from '@/types/annotations';

interface ProgressStats {
  total: number;
  resolved: number;
  inProgress: number;
  pending: number;
}

interface SubmittedForDevelopmentViewProps {
  progressStats: ProgressStats;
  annotations: Annotation[];
  onMarkAsResolved: (annotationId: string) => Promise<void>;
  onMarkAsInProgress: (annotationId: string) => Promise<void>;
}

/**
 * View component for the "Submitted For Development" workflow state
 */
export function SubmittedForDevelopmentView({
  progressStats,
  annotations,
  onMarkAsResolved,
  onMarkAsInProgress,
}: SubmittedForDevelopmentViewProps) {
  return (
    <div
      className='workflow-state'
      data-testid='workflow-submitted-for-development'>
      <h2 data-testid='workflow-state-title'>Submitted For Development</h2>
      <p data-testid='annotations-count'>
        {progressStats.total} annotations ready for resolution.
      </p>

      {progressStats.total > 0 && (
        <ProgressBar
          value={progressStats.resolved}
          max={progressStats.total}
          label={`${progressStats.resolved} of ${progressStats.total} annotations resolved`}
          className='progress-bar'
          data-testid='resolution-progress'
        />
      )}

      <AnnotationList
        annotations={annotations}
        onMarkAsResolved={onMarkAsResolved}
        onMarkAsInProgress={onMarkAsInProgress}
        data-testid='annotation-list'
      />
    </div>
  );
}
