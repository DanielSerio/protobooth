// RED: Integration tests for ResolveApp loading overlay
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolveApp } from '@/ui/Resolve/components/ResolveApp';
import type {
  FileOperations,
  ScreenshotService,
  FixtureManager,
} from '@/ui/Resolve/components/ResolveApp.props';

describe('ResolveApp - Loading Overlay', () => {
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

  it('should show loading overlay when screenshot capture starts', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(false);

    // Mock slow screenshot capture
    mockScreenshotService.captureRoutes = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            screenshots: [],
            injectedFixtures: {},
            fixtureInjectionLog: [],
            totalRoutes: 1,
            totalScreenshots: 3
          });
        }, 1000);
      });
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

    // Click confirm in dialog
    const confirmButton = screen.getByTestId('confirm-dialog-confirm-button');
    await user.click(confirmButton);

    // Should show loading overlay
    await waitFor(() => {
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
  });

  it('should hide loading overlay when capture completes successfully', async () => {
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

    const confirmButton = screen.getByTestId('confirm-dialog-confirm-button');
    await user.click(confirmButton);

    // Wait for capture to complete
    await waitFor(() => {
      expect(mockScreenshotService.captureRoutes).toHaveBeenCalled();
    });

    // Loading overlay should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });
  });

  it('should hide loading overlay when capture fails', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(false);
    mockScreenshotService.captureRoutes = vi.fn().mockRejectedValue(
      new Error('Screenshot capture failed')
    );

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

    const confirmButton = screen.getByTestId('confirm-dialog-confirm-button');
    await user.click(confirmButton);

    // Wait for capture to fail
    await waitFor(() => {
      expect(mockScreenshotService.captureRoutes).toHaveBeenCalled();
    });

    // Loading overlay should be hidden even on error
    await waitFor(() => {
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });
  });

  it('should show loading overlay during recapture', async () => {
    const user = userEvent.setup();
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn().mockResolvedValue(JSON.stringify({
      state: 'reviews-requested',
      timestamp: new Date().toISOString(),
      lastCaptureResult: { screenshotCount: 5 }
    }));

    mockScreenshotService.captureRoutes = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            screenshots: [],
            injectedFixtures: {},
            fixtureInjectionLog: [],
            totalRoutes: 1,
            totalScreenshots: 3
          });
        }, 1000);
      });
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
      expect(screen.getByTestId('workflow-reviews-requested')).toBeInTheDocument();
    });

    const recaptureButton = screen.getByTestId('recapture-button');
    await user.click(recaptureButton);

    // Click confirm in dialog
    const confirmButton = screen.getByTestId('confirm-dialog-confirm-button');
    await user.click(confirmButton);

    // Should show loading overlay during recapture
    await waitFor(() => {
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
  });

  it('should not show loading overlay when not capturing', async () => {
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

    // Should not show loading overlay in idle state
    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
  });
});
