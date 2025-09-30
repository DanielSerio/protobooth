import React from 'react';
import { clsx } from 'clsx';
import { Button, StatusBadge } from '@/ui/Core/components';
import type { Annotation } from '@/types/annotations';

interface AnnotationListProps {
  annotations: Annotation[];
  onMarkAsResolved: (id: string) => Promise<void>;
  onMarkAsInProgress: (id: string) => Promise<void>;
  className?: string;
  'data-testid'?: string;
}

interface AnnotationItemProps {
  annotation: Annotation;
  onMarkAsResolved: (id: string) => Promise<void>;
  onMarkAsInProgress: (id: string) => Promise<void>;
}

function AnnotationItem({ annotation, onMarkAsResolved, onMarkAsInProgress }: AnnotationItemProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleMarkAsResolved = async () => {
    try {
      setIsUpdating(true);
      await onMarkAsResolved(annotation.id);
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsInProgress = async () => {
    try {
      setIsUpdating(true);
      await onMarkAsInProgress(annotation.id);
    } catch (error) {
      console.error('Failed to mark as in progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityClassName = () => {
    switch (annotation.priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div className={clsx('annotation-item', getPriorityClassName())}>
      <div className="item-header">
        <div className="meta-info">
          <span className="route-label">{annotation.route}</span>
          <span className="viewport-label">{annotation.viewport}</span>
          <span className={clsx('priority-badge', `priority-${annotation.priority}`)}>
            {annotation.priority} priority
          </span>
        </div>
        <StatusBadge status={annotation.status} />
      </div>

      <div className="item-content">
        <p>{annotation.content}</p>
      </div>

      <div className="position-info">
        Position: x={annotation.position.x}, y={annotation.position.y}
      </div>

      <div className="actions">
        {annotation.status === 'pending' && (
          <Button
            onClick={handleMarkAsInProgress}
            disabled={isUpdating}
            size="small"
            variant="secondary"
          >
            Start Working
          </Button>
        )}

        {(annotation.status === 'pending' || annotation.status === 'in-progress') && (
          <Button
            onClick={handleMarkAsResolved}
            disabled={isUpdating}
            size="small"
            data-testid="mark-as-resolved-button"
          >
            Mark as Resolved
          </Button>
        )}
      </div>

      <div className="timestamp">
        {annotation.timestamp.toLocaleString()}
      </div>
    </div>
  );
}

export function AnnotationList({ annotations, onMarkAsResolved, onMarkAsInProgress, className, 'data-testid': testId }: AnnotationListProps) {
  if (annotations.length === 0) {
    return (
      <div className={clsx('annotation-list', 'list-empty', className)} data-testid={testId}>
        <p>No annotations available.</p>
      </div>
    );
  }

  // Group annotations by status for better organization
  const groupedAnnotations = annotations.reduce((groups, annotation) => {
    const status = annotation.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(annotation);
    return groups;
  }, {} as Record<string, Annotation[]>);

  return (
    <div className={clsx('annotation-list', className)} data-testid={testId}>
      {/* Pending annotations first */}
      {groupedAnnotations.pending && groupedAnnotations.pending.length > 0 && (
        <div className="annotation-group">
          <h3>Pending ({groupedAnnotations.pending.length})</h3>
          {groupedAnnotations.pending.map(annotation => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              onMarkAsResolved={onMarkAsResolved}
              onMarkAsInProgress={onMarkAsInProgress}
            />
          ))}
        </div>
      )}

      {/* In progress annotations */}
      {groupedAnnotations['in-progress'] && groupedAnnotations['in-progress'].length > 0 && (
        <div className="annotation-group">
          <h3>In Progress ({groupedAnnotations['in-progress'].length})</h3>
          {groupedAnnotations['in-progress'].map(annotation => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              onMarkAsResolved={onMarkAsResolved}
              onMarkAsInProgress={onMarkAsInProgress}
            />
          ))}
        </div>
      )}

      {/* Resolved annotations last */}
      {groupedAnnotations.resolved && groupedAnnotations.resolved.length > 0 && (
        <div className="annotation-group">
          <h3>Resolved ({groupedAnnotations.resolved.length})</h3>
          {groupedAnnotations.resolved.map(annotation => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              onMarkAsResolved={onMarkAsResolved}
              onMarkAsInProgress={onMarkAsInProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}