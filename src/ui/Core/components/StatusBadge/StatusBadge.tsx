import { clsx } from 'clsx';
import type { WorkflowState } from '@/ui/Resolve/hooks';

interface StatusBadgeProps {
  status: WorkflowState | 'pending' | 'in-progress' | 'resolved';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'in-development':
        return {
          text: 'In Development',
          className: 'protobooth-status-badge--development'
        };
      case 'reviews-requested':
        return {
          text: 'Reviews Requested',
          className: 'protobooth-status-badge--requested'
        };
      case 'in-review':
        return {
          text: 'In Review',
          className: 'protobooth-status-badge--review'
        };
      case 'submitted-for-development':
        return {
          text: 'Submitted For Development',
          className: 'protobooth-status-badge--submitted'
        };
      case 'pending':
        return {
          text: 'Pending',
          className: 'protobooth-status-badge--pending'
        };
      case 'in-progress':
        return {
          text: 'In Progress',
          className: 'protobooth-status-badge--progress'
        };
      case 'resolved':
        return {
          text: 'Resolved',
          className: 'protobooth-status-badge--resolved'
        };
      default:
        return {
          text: 'Unknown',
          className: 'protobooth-status-badge--unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={clsx('protobooth-status-badge', config.className, className)}>
      {config.text}
    </span>
  );
}