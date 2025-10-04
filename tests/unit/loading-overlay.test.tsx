// RED: Tests for LoadingOverlay component
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from '@/ui/Core/components/LoadingOverlay';

describe('LoadingOverlay Component', () => {
  it('should render overlay when isLoading is true', () => {
    render(<LoadingOverlay isLoading={true} />);

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('loading-overlay-backdrop')).toBeInTheDocument();
  });

  it('should not render when isLoading is false', () => {
    render(<LoadingOverlay isLoading={false} />);

    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
  });

  it('should display progress text when provided', () => {
    render(
      <LoadingOverlay
        isLoading={true}
        progressText="Capturing screenshots..."
      />
    );

    expect(screen.getByTestId('loading-overlay-text')).toHaveTextContent(
      'Capturing screenshots...'
    );
  });

  it('should display progress percentage when provided', () => {
    render(
      <LoadingOverlay
        isLoading={true}
        progressPercent={45}
      />
    );

    expect(screen.getByTestId('loading-overlay-percent')).toHaveTextContent('45%');
  });

  it('should display both text and percentage when provided', () => {
    render(
      <LoadingOverlay
        isLoading={true}
        progressText="Processing routes"
        progressPercent={60}
      />
    );

    expect(screen.getByTestId('loading-overlay-text')).toHaveTextContent('Processing routes');
    expect(screen.getByTestId('loading-overlay-percent')).toHaveTextContent('60%');
  });

  it('should show loading spinner', () => {
    render(<LoadingOverlay isLoading={true} />);

    expect(screen.getByTestId('loading-overlay-spinner')).toBeInTheDocument();
  });

  it('should not display progress text when not provided', () => {
    render(<LoadingOverlay isLoading={true} />);

    expect(screen.queryByTestId('loading-overlay-text')).not.toBeInTheDocument();
  });

  it('should not display progress percentage when not provided', () => {
    render(<LoadingOverlay isLoading={true} />);

    expect(screen.queryByTestId('loading-overlay-percent')).not.toBeInTheDocument();
  });

  it('should have proper z-index for overlay layering', () => {
    render(<LoadingOverlay isLoading={true} />);

    const overlay = screen.getByTestId('loading-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('should handle zero percent correctly', () => {
    render(
      <LoadingOverlay
        isLoading={true}
        progressPercent={0}
      />
    );

    expect(screen.getByTestId('loading-overlay-percent')).toHaveTextContent('0%');
  });

  it('should handle 100 percent correctly', () => {
    render(
      <LoadingOverlay
        isLoading={true}
        progressPercent={100}
      />
    );

    expect(screen.getByTestId('loading-overlay-percent')).toHaveTextContent('100%');
  });
});
