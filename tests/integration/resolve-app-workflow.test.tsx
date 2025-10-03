// RED: Integration tests for ResolveApp workflow state transitions
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolveApp } from '@/ui/Resolve/components/ResolveApp';
import type {
  FileOperations,
  ScreenshotService,
  FixtureManager,
} from '@/ui/Resolve/components/ResolveApp.props';

describe('ResolveApp - Workflow State Transitions', () => {
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

  it('should render in "In Development" state by default', async () => {
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

    expect(screen.getByTestId('workflow-state-title')).toBeInTheDocument();
    expect(screen.getByTestId('request-review-button')).toBeInTheDocument();
  });

  it('should load existing workflow state from file on mount', async () => {
    const savedState = {
      state: 'in-review',
      timestamp: new Date().toISOString(),
    };

    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn().mockResolvedValue(JSON.stringify(savedState));

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

    expect(screen.getByTestId('workflow-state-title')).toBeInTheDocument();
  });

  it('should transition from "In Development" to "Reviews Requested" when clicked', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.writeFile = vi.fn().mockResolvedValue(undefined);

    mockScreenshotService.captureRoutes = vi.fn().mockResolvedValue({
      screenshots: [
        {
          route: '/home',
          viewport: 'desktop',
          filePath: '/temp/screenshots/home-desktop.png',
          dimensions: { width: 1440, height: 900 },
          timestamp: new Date(),
        },
      ],
      outputDirectory: '/temp/screenshots',
    });

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
      expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
    });

    const requestReviewButton = screen.getByTestId('request-review-button');
    await user.click(requestReviewButton);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-reviews-requested')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockScreenshotService.captureRoutes).toHaveBeenCalledOnce();
    });

    expect(mockFileOps.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('workflow-state.json'),
      expect.stringContaining('reviews-requested')
    );
  });

  it('should persist workflow state to file when transitioning states', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.writeFile = vi.fn().mockResolvedValue(undefined);

    mockScreenshotService.captureRoutes = vi.fn().mockResolvedValue({
      screenshots: [],
      outputDirectory: '/temp',
    });

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
      expect(mockFileOps.writeFile).toHaveBeenCalled();
    });

    const writeCallArgs = (mockFileOps.writeFile as ReturnType<typeof vi.fn>).mock
      .calls[0];
    const savedData = JSON.parse(writeCallArgs[1] as string);

    expect(savedData.state).toBe('reviews-requested');
    expect(savedData.timestamp).toBeDefined();
  });
});
