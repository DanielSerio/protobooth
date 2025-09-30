import { clsx } from 'clsx';

interface ErrorMessageProps {
  title: string;
  message: string;
  details?: string[];
  className?: string;
  onDismiss?: () => void;
  'data-testid'?: string;
}

export function ErrorMessage({
  title,
  message,
  details,
  className,
  onDismiss,
  'data-testid': testId
}: ErrorMessageProps) {
  return (
    <div className={clsx('error-card', className)} data-testid={testId}>
      <div className="error-header">
        <h4 className="error-title">{title}</h4>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="btn-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>

      <div className="error-body">
        <p className="error-text" data-testid={`${testId}-message`}>{message}</p>

        {details && details.length > 0 && (
          <div className="error-details">
            <ul className="list-unstyled">
              {details.map((detail, index) => (
                <li key={index} className="list-item">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}