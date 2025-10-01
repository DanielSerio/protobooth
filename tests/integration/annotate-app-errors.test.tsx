// RED: Integration tests for AnnotateApp error scenarios
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnotateApp } from '@/ui/Annotate/components/AnnotateApp';
import type { Screenshot } from '@/types/screenshot';

interface AnnotateAppServices {
  onSaveAnnotation: (annotation: any) => Promise<void>;
  onPublish: () => Promise<void>;
  screenshots: Screenshot[];
}

describe('AnnotateApp - Error Scenarios', () => {
  let mockServices: AnnotateAppServices;
  let mockScreenshots: Screenshot[];

  beforeEach(() => {
    mockScreenshots = [
      {
        route: '/home',
        viewport: 'desktop',
        filePath: '/screenshots/home-desktop.png',
        dimensions: { width: 1440, height: 900 },
        timestamp: new Date(),
      },
    ];

    mockServices = {
      onSaveAnnotation: vi.fn().mockResolvedValue(undefined),
      onPublish: vi.fn().mockResolvedValue(undefined),
      screenshots: mockScreenshots,
    };
  });

  // Note: Screenshot loading errors cannot be tested in jsdom environment
  // since image.onerror doesn't fire. This would be covered by E2E tests.

  it('should display error when annotation save fails', async () => {
    const user = userEvent.setup();

    const mockError = vi.fn().mockRejectedValue(new Error('Save failed'));
    const servicesWithError = { ...mockServices, onSaveAnnotation: mockError };

    render(<AnnotateApp {...servicesWithError} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create annotation
    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    const contentInput = screen.getByTestId('annotation-content-input');
    await user.type(contentInput, 'Test annotation');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('save-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to save annotation');
    });
  });

  it('should display error when publish fails', async () => {
    const user = userEvent.setup();

    const mockError = vi.fn().mockRejectedValue(new Error('Publish failed'));
    const servicesWithError = { ...mockServices, onPublish: mockError };

    render(<AnnotateApp {...servicesWithError} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create annotation
    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    const contentInput = screen.getByTestId('annotation-content-input');
    await user.type(contentInput, 'Test annotation');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      const publishButton = screen.getByTestId('publish-button');
      expect(publishButton).not.toBeDisabled();
    });

    // Publish and confirm
    const publishButton = screen.getByTestId('publish-button');
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByTestId('publish-confirmation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByTestId('confirm-publish-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByTestId('publish-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to publish annotations');
    });
  });

  it('should validate annotation content is not empty', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create annotation
    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    // Try to save without content
    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Content is required');
    });

    expect(mockServices.onSaveAnnotation).not.toHaveBeenCalled();
  });

  it('should allow dismissing errors', async () => {
    const user = userEvent.setup();

    const mockError = vi.fn().mockRejectedValue(new Error('Save failed'));
    const servicesWithError = { ...mockServices, onSaveAnnotation: mockError };

    render(<AnnotateApp {...servicesWithError} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create annotation and trigger error
    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    const contentInput = screen.getByTestId('annotation-content-input');
    await user.type(contentInput, 'Test annotation');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('save-error')).toBeInTheDocument();
    });

    // Dismiss error
    const dismissButton = screen.getByTestId('dismiss-error-button');
    await user.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByTestId('save-error')).not.toBeInTheDocument();
    });
  });

  it('should retry failed annotation save', async () => {
    const user = userEvent.setup();

    let callCount = 0;
    const mockRetry = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('First attempt failed'));
      }
      return Promise.resolve();
    });

    const servicesWithRetry = { ...mockServices, onSaveAnnotation: mockRetry };

    render(<AnnotateApp {...servicesWithRetry} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create annotation
    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    const contentInput = screen.getByTestId('annotation-content-input');
    await user.type(contentInput, 'Test annotation');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('save-error')).toBeInTheDocument();
    });

    // Retry save
    const retryButton = screen.getByTestId('retry-save-button');
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.queryByTestId('save-error')).not.toBeInTheDocument();
      expect(mockRetry).toHaveBeenCalledTimes(2);
    });
  });

  it('should display error when no screenshots provided', async () => {
    render(<AnnotateApp {...mockServices} screenshots={[]} />);

    await waitFor(() => {
      expect(screen.getByTestId('no-screenshots-error')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('No screenshots available');
    });
  });

  // Duplicate test removed - network errors during publish are already covered by
  // "should display error when publish fails" test above
});
