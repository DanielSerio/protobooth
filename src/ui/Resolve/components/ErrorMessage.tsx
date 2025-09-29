import React from 'react';
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
    <div className={clsx('protobooth-error-message', className)} data-testid={testId}>
      <div className="protobooth-error-message__header">
        <h4 className="protobooth-error-message__title">{title}</h4>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="protobooth-error-message__dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>

      <div className="protobooth-error-message__content">
        <p className="protobooth-error-message__message" data-testid={`${testId}-message`}>{message}</p>

        {details && details.length > 0 && (
          <div className="protobooth-error-message__details">
            <ul className="protobooth-error-message__details-list">
              {details.map((detail, index) => (
                <li key={index} className="protobooth-error-message__detail">
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