// RED: Integration tests for ResolveApp annotation download workflow
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolveApp } from '@/ui/Resolve/components/ResolveApp';
import type {
  FileOperations,
  ScreenshotService,
  FixtureManager,
} from '@/ui/Resolve/components/ResolveApp.props';

describe('ResolveApp - Annotation Download Workflow', () => {
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

  it('should download annotations when in "In Review" state', async () => {
    const savedState = { state: 'in-review', timestamp: new Date().toISOString() };
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

    await user.click(screen.getByTestId('download-annotations-button'));
    await waitFor(() => expect(mockFileOps.writeFile).toHaveBeenCalled());
  });

  it('should transition to "Submitted For Development" after download', async () => {
    const savedState = { state: 'in-review', timestamp: new Date().toISOString() };
    const mockAnnotations = [{
      id: 'ann-1', timestamp: new Date(), route: '/home', viewport: 'desktop',
      position: { x: 100, y: 200 }, content: 'Fix this button',
      priority: 'high' as const, status: 'pending' as const,
    }];

    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn()
      .mockResolvedValueOnce(JSON.stringify(savedState))
      .mockResolvedValueOnce(JSON.stringify(mockAnnotations));
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
    await user.click(screen.getByTestId('download-annotations-button'));
    await waitFor(() => {
      expect(screen.getByTestId('workflow-submitted-for-development')).toBeInTheDocument();
    });
  });

  it('should display annotations after transitioning state', async () => {
    const savedState = { state: 'submitted-for-development', timestamp: new Date().toISOString() };
    const mockAnnotations = [
      { id: 'ann-1', timestamp: new Date(), route: '/home', viewport: 'desktop',
        position: { x: 100, y: 200 }, content: 'Fix this button',
        priority: 'high' as const, status: 'pending' as const },
      { id: 'ann-2', timestamp: new Date(), route: '/about', viewport: 'mobile',
        position: { x: 50, y: 100 }, content: 'Update text',
        priority: 'low' as const, status: 'pending' as const },
    ];

    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn()
      .mockResolvedValueOnce(JSON.stringify(savedState))
      .mockResolvedValueOnce(JSON.stringify(mockAnnotations));

    render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={mockScreenshotService}
        fixtureManager={mockFixtureManager}
        config={testConfig}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('workflow-submitted-for-development')).toBeInTheDocument();
    });
    expect(screen.getByTestId('annotation-list')).toBeInTheDocument();
    expect(screen.getByTestId('annotations-count')).toHaveTextContent('2 annotations');
  });

  it('should allow marking annotations as resolved', async () => {
    const savedState = { state: 'submitted-for-development', timestamp: new Date().toISOString() };
    const mockAnnotations = [{
      id: 'ann-1', timestamp: new Date(), route: '/home', viewport: 'desktop',
      position: { x: 100, y: 200 }, content: 'Fix this button',
      priority: 'high' as const, status: 'pending' as const,
    }];

    mockFileOps.fileExists = vi.fn().mockResolvedValue(true);
    mockFileOps.readFile = vi.fn()
      .mockResolvedValueOnce(JSON.stringify(savedState))
      .mockResolvedValueOnce(JSON.stringify(mockAnnotations));
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
      expect(screen.getByTestId('annotation-list')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('resolve-annotation-ann-1'));
    await waitFor(() => {
      expect(mockFileOps.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('annotations.json'),
        expect.stringContaining('resolved')
      );
    });
  });
});
