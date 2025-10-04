// RED: Tests for ConfirmDialog component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/ui/Core/components/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render dialog with custom title and message', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-dialog-title')).toHaveTextContent('Confirm Action');
    expect(screen.getByTestId('confirm-dialog-message')).toHaveTextContent('Are you sure you want to proceed?');
  });

  it('should render confirm and cancel buttons with default labels', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('confirm-dialog-confirm-button')).toHaveTextContent('Confirm');
    expect(screen.getByTestId('confirm-dialog-cancel-button')).toHaveTextContent('Cancel');
  });

  it('should render custom button labels when provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="This action cannot be undone"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('confirm-dialog-confirm-button')).toHaveTextContent('Delete');
    expect(screen.getByTestId('confirm-dialog-cancel-button')).toHaveTextContent('Keep');
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByTestId('confirm-dialog-confirm-button'));

    expect(mockOnConfirm).toHaveBeenCalledOnce();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByTestId('confirm-dialog-cancel-button'));

    expect(mockOnCancel).toHaveBeenCalledOnce();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Confirm"
        message="Proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('should render overlay when dialog is open', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('confirm-dialog-overlay')).toBeInTheDocument();
  });

  it('should call onCancel when overlay is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByTestId('confirm-dialog-overlay'));

    expect(mockOnCancel).toHaveBeenCalledOnce();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should support danger variant with visual indicator', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Everything"
        message="This will delete all data"
        variant="danger"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const dialog = screen.getByTestId('confirm-dialog');
    expect(dialog).toHaveClass('confirm-dialog-danger');
  });

  it('should support warning variant with visual indicator', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Recapture Screenshots"
        message="This will overwrite existing screenshots"
        variant="warning"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const dialog = screen.getByTestId('confirm-dialog');
    expect(dialog).toHaveClass('confirm-dialog-warning');
  });
});