import React from 'react';
import { Button } from '../Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  const dialogClassName = `confirm-dialog confirm-dialog-${variant}`;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <>
      <div
        className="confirm-dialog-overlay"
        data-testid="confirm-dialog-overlay"
        onClick={handleOverlayClick}
      />
      <div
        className={dialogClassName}
        data-testid="confirm-dialog"
      >
        <div className="confirm-dialog-content">
          <h3
            className="confirm-dialog-title"
            data-testid="confirm-dialog-title"
          >
            {title}
          </h3>
          <p
            className="confirm-dialog-message"
            data-testid="confirm-dialog-message"
          >
            {message}
          </p>
          <div className="confirm-dialog-actions">
            <Button
              onClick={onCancel}
              variant="secondary"
              data-testid="confirm-dialog-cancel-button"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              data-testid="confirm-dialog-confirm-button"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
