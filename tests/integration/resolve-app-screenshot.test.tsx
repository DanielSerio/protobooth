// RED: Integration tests for ResolveApp screenshot capture workflow
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolveApp } from '@/ui/Resolve/components/ResolveApp';
import type {
  FileOperations,
  ScreenshotService,
  FixtureManager,
} from '@/ui/Resolve/components/ResolveApp.props';

describe('ResolveApp - Screenshot Capture Workflow', () => {
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

  it('should validate configuration before capturing screenshots', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(false);

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('request-review-button')).toBeInTheDocument();
    });

    const requestReviewButton = screen.getByTestId('request-review-button');
    expect(requestReviewButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByTestId('configuration-error')).toBeInTheDocument();
    });
  });

  it('should show progress during screenshot capture', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.writeFile = vi.fn().mockResolvedValue(undefined);

    mockScreenshotService.captureRoutes = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              screenshots: [],
              outputDirectory: '/temp',
            });
          }, 100);
        })
    );

    const user = userEvent.setup();

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('request-review-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('request-review-button'));

    await waitFor(() => {
      expect(screen.getByTestId('capture-progress')).toBeInTheDocument();
    });
  });

  it('should display capture results after successful capture', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.writeFile = vi.fn().mockResolvedValue(undefined);

    mockScreenshotService.captureRoutes = vi.fn().mockResolvedValue({
      screenshots: [
        {
          route: '/home',
          viewport: 'desktop',
          filePath: '/temp/home.png',
          dimensions: { width: 1440, height: 900 },
          timestamp: new Date(),
        },
        {
          route: '/about',
          viewport: 'mobile',
          filePath: '/temp/about.png',
          dimensions: { width: 375, height: 667 },
          timestamp: new Date(),
        },
      ],
      outputDirectory: '/temp/screenshots',
    });

    const user = userEvent.setup();

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        config={testConfig}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('request-review-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('request-review-button'));

    await waitFor(() => {
      expect(screen.getByTestId('workflow-reviews-requested')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('deployment-instructions')).toBeInTheDocument();
    });
  });

  it('should handle screenshot capture errors gracefully', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.writeFile = vi.fn().mockResolvedValue(undefined);

    const captureError = new Error('Failed to launch browser');
    mockScreenshotService.captureRoutes = vi.fn().mockRejectedValue(captureError);

    const user = userEvent.setup();

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('request-review-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('request-review-button'));

    await waitFor(() => {
      expect(screen.getByTestId('general-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('general-error-message')).toBeInTheDocument();
  });
});
