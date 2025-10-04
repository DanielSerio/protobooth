// RED: Integration tests for ResolveApp confirmation modals
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolveApp } from '@/ui/Resolve/components/ResolveApp';
import type {
  FileOperations,
  ScreenshotService,
  FixtureManager,
} from '@/ui/Resolve/components/ResolveApp.props';

describe('ResolveApp - Confirmation Modals', () => {
  let mockFileOps: FileOperations;
  let mockScreenshotService: ScreenshotService;
  let mockFixtureManager: FixtureManager;

  const testConfig = {
    fixtures: {
      auth: {
        authenticated: { user: { id: '1' }, token: 'test' },
        unauthenticated: null
      }
    },
    viewports: [{ name: 'desktop', width: 1440, height: 900 }],
    projectPath: '/test/project',
    routerType: 'vite' as const
  };

  beforeEach(() => {
    mockFileOps = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      fileExists: vi.fn(),
    };

    mockScreenshotService = {
      captureRoutes: vi.fn(),
    };

    mockFixtureManager = {
      getAuthFixture: vi.fn(),
      getGlobalState: vi.fn(),
    };
  });

  it('should show confirmation dialog before Request Review', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(false);

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
    });

    const requestButton = screen.getByTestId('request-review-button');
    await user.click(requestButton);

    // Should show confirmation dialog
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-dialog-title')).toHaveTextContent('Request Review');
    expect(screen.getByTestId('confirm-dialog-message')).toHaveTextContent('capture screenshots');
  });

  it('should cancel Request Review when clicking cancel in dialog', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(false);

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
    });

    const requestButton = screen.getByTestId('request-review-button');
    await user.click(requestButton);

    // Click cancel in confirmation dialog
    const cancelButton = screen.getByTestId('confirm-dialog-cancel-button');
    await user.click(cancelButton);

    // Dialog should close
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();

    // Should NOT call screenshot service
    expect(mockScreenshotService.captureRoutes).not.toHaveBeenCalled();

    // Should still be in development state
    expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
  });

  it('should proceed with Request Review when clicking confirm in dialog', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(false);
    mockFileOps.writeFile = vi.fn().mockResolvedValue(undefined);
    mockScreenshotService.captureRoutes = vi.fn().mockResolvedValue({
      screenshots: [],
      injectedFixtures: {},
      fixtureInjectionLog: [],
      totalRoutes: 1,
      totalScreenshots: 3
    });

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
    });

    const requestButton = screen.getByTestId('request-review-button');
    await user.click(requestButton);

    // Click confirm in confirmation dialog
    const confirmButton = screen.getByTestId('confirm-dialog-confirm-button');
    await user.click(confirmButton);

    // Should call screenshot service
    await waitFor(() => {
      expect(mockScreenshotService.captureRoutes).toHaveBeenCalledOnce();
    });

    // Should transition to reviews-requested state
    await waitFor(() => {
      expect(screen.getByTestId('workflow-reviews-requested')).toBeInTheDocument();
    });
  });

  it('should show confirmation dialog before Recapture Screenshots', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn().mockResolvedValue(JSON.stringify({
      state: 'reviews-requested',
      timestamp: new Date().toISOString(),
      lastCaptureResult: { screenshotCount: 5 }
    }));

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('workflow-reviews-requested')).toBeInTheDocument();
    });

    const recaptureButton = screen.getByTestId('recapture-button');
    await user.click(recaptureButton);

    // Should show confirmation dialog
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-dialog-title')).toHaveTextContent('Recapture Screenshots');
    expect(screen.getByTestId('confirm-dialog-message')).toHaveTextContent('overwrite');
  });

  it('should show confirmation dialog before Reset Workflow', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn().mockResolvedValue(JSON.stringify({
      state: 'in-review',
      timestamp: new Date().toISOString()
    }));

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('workflow-in-review')).toBeInTheDocument();
    });

    const resetButton = screen.getByTestId('start-new-review-button');
    await user.click(resetButton);

    // Should show confirmation dialog
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-dialog-title')).toHaveTextContent('Start New Review');
    expect(screen.getByTestId('confirm-dialog-message')).toHaveTextContent('reset');
  });
});
