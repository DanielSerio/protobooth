// RED: Integration tests for AnnotateApp annotation CRUD operations
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

describe('AnnotateApp - Annotation CRUD Operations', () => {
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

  it('should display annotation form when annotation is created', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Click on canvas to create annotation
    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });
  });

  it('should show annotation form fields', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-content-input')).toBeInTheDocument();
      expect(screen.getByTestId('annotation-priority-select')).toBeInTheDocument();
      expect(screen.getByTestId('annotation-save-button')).toBeInTheDocument();
      expect(screen.getByTestId('annotation-cancel-button')).toBeInTheDocument();
    });
  });

  it('should save annotation when form is submitted', async () => {
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

    // Fill form
    const contentInput = screen.getByTestId('annotation-content-input');
    await user.type(contentInput, 'Fix this button color');

    const prioritySelect = screen.getByTestId('annotation-priority-select');
    await user.selectOptions(prioritySelect, 'high');

    // Save annotation
    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockServices.onSaveAnnotation).toHaveBeenCalledOnce();
      expect(mockServices.onSaveAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Fix this button color',
          priority: 'high',
        })
      );
    });
  });

  it('should display saved annotations in list', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    // Create and save annotation
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
      expect(screen.getByTestId('annotation-list')).toBeInTheDocument();
      expect(screen.getByTestId('annotation-item-1')).toBeInTheDocument();
    });
  });

  it('should allow editing existing annotation', async () => {
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
    await user.type(contentInput, 'Original text');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-item-1')).toBeInTheDocument();
    });

    // Edit annotation
    const editButton = screen.getByTestId('edit-annotation-1');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    const editInput = screen.getByTestId('annotation-content-input');
    await user.clear(editInput);
    await user.type(editInput, 'Updated text');

    const updateButton = screen.getByTestId('annotation-save-button');
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockServices.onSaveAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Updated text',
        })
      );
    });
  });

  it('should allow deleting annotation', async () => {
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
    await user.type(contentInput, 'Delete this');

    const saveButton = screen.getByTestId('annotation-save-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-item-1')).toBeInTheDocument();
    });

    // Delete annotation
    const deleteButton = screen.getByTestId('delete-annotation-1');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByTestId('annotation-item-1')).not.toBeInTheDocument();
    });
  });

  it('should cancel annotation creation', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId('annotation-cancel-button');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('annotation-form')).not.toBeInTheDocument();
    });

    expect(mockServices.onSaveAnnotation).not.toHaveBeenCalled();
  });

  it('should set priority levels correctly', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    const canvas = screen.getByTestId('annotate-canvas');
    await user.click(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('annotation-form')).toBeInTheDocument();
    });

    const prioritySelect = screen.getByTestId('annotation-priority-select');

    // Test high priority
    await user.selectOptions(prioritySelect, 'high');
    expect(prioritySelect).toHaveValue('high');

    // Test medium priority
    await user.selectOptions(prioritySelect, 'medium');
    expect(prioritySelect).toHaveValue('medium');

    // Test low priority
    await user.selectOptions(prioritySelect, 'low');
    expect(prioritySelect).toHaveValue('low');
  });
});
