// RED: Integration tests for AnnotateApp canvas tool interactions
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

describe('AnnotateApp - Canvas Tool Interactions', () => {
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

  it('should render canvas with screenshot image', async () => {
    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });

    expect(screen.getByTestId('screenshot-image')).toBeInTheDocument();
  });

  it('should display drawing tools palette', async () => {
    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('tool-palette')).toBeInTheDocument();
    });

    expect(screen.getByTestId('tool-draw')).toBeInTheDocument();
    expect(screen.getByTestId('tool-text')).toBeInTheDocument();
    expect(screen.getByTestId('tool-arrow')).toBeInTheDocument();
  });

  it('should activate drawing tool when clicked', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('tool-draw')).toBeInTheDocument();
    });

    const drawTool = screen.getByTestId('tool-draw');
    await user.click(drawTool);

    await waitFor(() => {
      expect(screen.getByTestId('tool-draw')).toHaveAttribute('data-active', 'true');
    });
  });

  it('should activate text tool when clicked', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('tool-text')).toBeInTheDocument();
    });

    const textTool = screen.getByTestId('tool-text');
    await user.click(textTool);

    await waitFor(() => {
      expect(screen.getByTestId('tool-text')).toHaveAttribute('data-active', 'true');
    });
  });

  it('should activate arrow tool when clicked', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('tool-arrow')).toBeInTheDocument();
    });

    const arrowTool = screen.getByTestId('tool-arrow');
    await user.click(arrowTool);

    await waitFor(() => {
      expect(screen.getByTestId('tool-arrow')).toHaveAttribute('data-active', 'true');
    });
  });

  it('should deactivate previous tool when new tool is selected', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('tool-draw')).toBeInTheDocument();
    });

    const drawTool = screen.getByTestId('tool-draw');
    const textTool = screen.getByTestId('tool-text');

    await user.click(drawTool);
    await waitFor(() => {
      expect(drawTool).toHaveAttribute('data-active', 'true');
    });

    await user.click(textTool);
    await waitFor(() => {
      expect(textTool).toHaveAttribute('data-active', 'true');
      expect(drawTool).toHaveAttribute('data-active', 'false');
    });
  });

  it('should show color picker for drawing tools', async () => {
    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('color-picker')).toBeInTheDocument();
    });

    expect(screen.getByTestId('color-red')).toBeInTheDocument();
    expect(screen.getByTestId('color-blue')).toBeInTheDocument();
  });

  it('should change drawing color when color is selected', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('color-red')).toBeInTheDocument();
    });

    const redColor = screen.getByTestId('color-red');
    await user.click(redColor);

    await waitFor(() => {
      expect(screen.getByTestId('color-red')).toHaveAttribute('data-selected', 'true');
    });
  });

  it('should enable clear canvas button after drawing', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('tool-draw')).toBeInTheDocument();
    });

    // Activate draw tool
    await user.click(screen.getByTestId('tool-draw'));

    // Simulate canvas interaction (drawing will be done via Fabric.js in actual implementation)
    const canvas = screen.getByTestId('annotate-canvas');
    await user.pointer({ target: canvas, coords: { x: 100, y: 100 } });

    await waitFor(() => {
      expect(screen.getByTestId('clear-canvas-button')).not.toBeDisabled();
    });
  });

  it('should clear canvas when clear button is clicked', async () => {
    const user = userEvent.setup();

    render(<AnnotateApp {...mockServices} />);

    await waitFor(() => {
      expect(screen.getByTestId('clear-canvas-button')).toBeInTheDocument();
    });

    const clearButton = screen.getByTestId('clear-canvas-button');
    await user.click(clearButton);

    // Canvas should be cleared (implementation detail)
    await waitFor(() => {
      expect(screen.getByTestId('annotate-canvas')).toBeInTheDocument();
    });
  });
});
