interface ErrorDisplayProps {
  type: string;
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorDisplay({ type, message, onDismiss, onRetry }: ErrorDisplayProps) {
  return (
    <div data-testid={type}>
      <div data-testid="error-message">{message}</div>
      <button data-testid="dismiss-error-button" onClick={onDismiss}>
        Dismiss
      </button>
      {type === 'save-error' && onRetry && (
        <button data-testid="retry-save-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
