// RED: Integration tests for ResolveApp error handling
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolveApp } from '@/ui/Resolve/components/ResolveApp';
import type {
  FileOperations,
  ScreenshotService,
  FixtureManager,
} from '@/ui/Resolve/components/ResolveApp.props';

describe('ResolveApp - Error Handling', () => {
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

  it('should display error when workflow state file read fails', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn().mockRejectedValue(new Error('File read error'));

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('general-error')).toBeInTheDocument();
    });
  });

  it('should display error when annotations file read fails', async () => {
    const savedState = {
      state: 'submitted-for-development',
      timestamp: new Date().toISOString(),
    };

    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi
      .fn()
      .mockResolvedValueOnce(JSON.stringify(savedState))
      .mockRejectedValueOnce(new Error('Annotations read error'));

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('general-error')).toBeInTheDocument();
    });
  });

  it('should handle corrupted workflow state gracefully', async () => {
    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn().mockResolvedValue('{ invalid json }');

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('general-error')).toBeInTheDocument();
    });
  });

  it('should allow resetting workflow when errors occur', async () => {
    const savedState = {
      state: 'in-review',
      timestamp: new Date().toISOString(),
    };

    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn().mockResolvedValue(JSON.stringify(savedState));
    mockFileOps.writeFile = vi.fn().mockResolvedValue(undefined);

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
      expect(screen.getByTestId('workflow-in-review')).toBeInTheDocument();
    });

    const resetButton = screen.getByTestId('start-new-review-button');
    await user.click(resetButton);

    await waitFor(() => {
      expect(mockFileOps.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('workflow-state.json'),
        expect.stringContaining('in-development')
      );
    });
  });
});
