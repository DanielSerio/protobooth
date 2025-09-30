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
          className: 'status-development'
        };
      case 'reviews-requested':
        return {
          text: 'Reviews Requested',
          className: 'status-requested'
        };
      case 'in-review':
        return {
          text: 'In Review',
          className: 'status-review'
        };
      case 'submitted-for-development':
        return {
          text: 'Submitted For Development',
          className: 'status-submitted'
        };
      case 'pending':
        return {
          text: 'Pending',
          className: 'status-pending'
        };
      case 'in-progress':
        return {
          text: 'In Progress',
          className: 'status-progress'
        };
      case 'resolved':
        return {
          text: 'Resolved',
          className: 'status-resolved'
        };
      default:
        return {
          text: 'Unknown',
          className: 'status-unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={clsx('badge', config.className, className)}>
      {config.text}
    </span>
  );
}