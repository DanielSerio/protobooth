// RED: Integration tests for AnnotateApp publish workflow
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

describe('AnnotateApp - Publish Workflow', () => {
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

  it('should display publish button', async () => {
    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('publish-button')).toBeInTheDocument();
    });
  });

  it('should disable publish button when no annotations', async () => {
    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('publish-button')).toBeInTheDocument();
    });

    const publishButton = screen.getByTestId('publish-button');
    expect(publishButton).toBeDisabled();
  });

  it('should enable publish button after creating annotation', async () => {
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

    const contentInput = screen.getByTestId('annotation-content-input');
    await user.type(contentInput, 'Test annotation');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      const publishButton = screen.getByTestId('publish-button');
      expect(publishButton).not.toBeDisabled();
    });
  });

  it('should show confirmation dialog when publish is clicked', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create annotation to enable publish
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

    // Click publish
    const publishButton = screen.getByTestId('publish-button');
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByTestId('publish-confirmation-dialog')).toBeInTheDocument();
    });
  });

  it('should display annotation count in confirmation dialog', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create two annotations
    const canvas = screen.getByTestId('annotate-canvas');

    // First annotation
    await user.click(canvas);
    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });
    const contentInput1 = screen.getByTestId('annotation-content-input');
    await user.type(contentInput1, 'First annotation');
    await user.click(screen.getByTestId('annotation-save-button'));

    // Second annotation
    await user.click(canvas);
    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });
    const contentInput2 = screen.getByTestId('annotation-content-input');
    await user.type(contentInput2, 'Second annotation');
    await user.click(screen.getByTestId('annotation-save-button'));

    await waitFor(() => {
      const publishButton = screen.getByTestId('publish-button');
      expect(publishButton).not.toBeDisabled();
    });

    // Click publish
    const publishButton = screen.getByTestId('publish-button');
    await user.click(publishButton);

    await waitFor(() => {
      const dialog = screen.getByTestId('publish-confirmation-dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByTestId('annotation-count')).toHaveTextContent('2');
    });
  });

  it('should call onPublish when confirmed', async () => {
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
      expect(mockServices.onPublish).toHaveBeenCalledOnce();
    });
  });

  it('should not call onPublish when cancelled', async () => {
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

    const contentInput = screen.getByTestId('annotation-content-input');
    await user.type(contentInput, 'Test annotation');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      const publishButton = screen.getByTestId('publish-button');
      expect(publishButton).not.toBeDisabled();
    });

    // Publish but cancel
    const publishButton = screen.getByTestId('publish-button');
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByTestId('publish-confirmation-dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('cancel-publish-button');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('publish-confirmation-dialog')).not.toBeInTheDocument();
    });

    expect(mockServices.onPublish).not.toHaveBeenCalled();
  });

  it('should show publishing state during publish', async () => {
    const user = userEvent.setup();

    // Mock delayed publish
    const mockPublish = vi.fn(() => new Promise<void>((resolve) => setTimeout(() => resolve(), 100)));
    const servicesWithDelay = { ...mockServices, onPublish: mockPublish };

    render(<AnnotateApp {...servicesWithDelay} />);

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

    // Check publishing state
    await waitFor(() => {
      expect(screen.getByTestId('publish-progress')).toBeInTheDocument();
    });
  });

  it('should disable all actions during publish', async () => {
    const user = userEvent.setup();

    // Mock delayed publish
    const mockPublish = vi.fn(() => new Promise<void>((resolve) => setTimeout(() => resolve(), 100)));
    const servicesWithDelay = { ...mockServices, onPublish: mockPublish };

    render(<AnnotateApp {...servicesWithDelay} />);

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

    // Check that buttons are disabled during publish
    await waitFor(() => {
      expect(screen.getByTestId('publish-button')).toBeDisabled();
    });
  });
});
