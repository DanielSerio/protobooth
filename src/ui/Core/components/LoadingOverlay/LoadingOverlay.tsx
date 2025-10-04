import React from 'react';

export interface LoadingOverlayProps {
  isLoading: boolean;
  progressText?: string;
  progressPercent?: number;
}

export function LoadingOverlay({
  isLoading,
  progressText,
  progressPercent,
}: LoadingOverlayProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <>
      <div
        className="loading-overlay-backdrop"
        data-testid="loading-overlay-backdrop"
      />
      <div className="loading-overlay" data-testid="loading-overlay">
        <div className="loading-overlay-content">
          <div className="loading-spinner" data-testid="loading-overlay-spinner">
            <div className="spinner-circle" />
          </div>

          {progressText && (
            <p
              className="loading-overlay-text"
              data-testid="loading-overlay-text"
            >
              {progressText}
            </p>
          )}

          {progressPercent !== undefined && (
            <p
              className="loading-overlay-percent"
              data-testid="loading-overlay-percent"
            >
              {progressPercent}%
            </p>
          )}
        </div>
      </div>
    </>
  );
}
