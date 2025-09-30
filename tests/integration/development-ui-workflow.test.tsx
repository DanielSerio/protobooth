// RED: Write failing integration tests for development UI workflow
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import path from 'path';
import { ResolveApp } from '@/ui/Resolve/components/ResolveApp';
import { FixtureManager } from '@/core/fixture-manager';
import { ScreenshotCaptureService } from '@/screenshot/screenshot-capture-service';
import type { FixtureConfig } from '@/types/fixtures';
import type { Annotation } from '@/types/annotations';
import type { ViewportConfig } from '@/types/screenshot';

describe('Development UI Workflow Integration', () => {
  let fixtureManager: FixtureManager;
  let screenshotService: ScreenshotCaptureService;
  let mockFileOps: any;
  let mockBrowser: any;
  let mockWorkflowState: string;
  let mockAnnotations: Annotation[];

  const testOutputDir = path.join(__dirname, '../../temp/test-workflow');
  const demoProjectPath = path.join(__dirname, '../../demos/tanstack-router');

  const testFixtures: FixtureConfig = {
    auth: {
      authenticated: {
        user: { id: '123', name: 'Test Developer', email: 'dev@test.com' },
        token: 'mock-dev-token'
      },
      unauthenticated: null
    },
    dynamicRoutes: {
      '/user/[userId]': [
        { userId: '123' },
        { userId: '456' }
      ]
    },
    globalState: {
      theme: 'light',
      featureFlags: { developmentMode: true }
    }
  };

  const testViewports: ViewportConfig[] = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1440, height: 900 }
  ];

  beforeAll(async () => {
    // Initialize test state
    mockWorkflowState = 'in-development';
    mockAnnotations = [];

    // Mock file operations for state persistence
    mockFileOps = {
      readFile: vi.fn().mockImplementation((filePath: string) => {
        if (filePath.includes('workflow-state.json')) {
          return Promise.resolve(JSON.stringify({ state: mockWorkflowState, timestamp: new Date().toISOString() }));
        }
        if (filePath.includes('annotations.json')) {
          return Promise.resolve(JSON.stringify(mockAnnotations));
        }
        return Promise.resolve('{}');
      }),
      writeFile: vi.fn().mockImplementation((filePath: string, content: string) => {
        if (filePath.includes('workflow-state.json')) {
          const parsed = JSON.parse(content);
          mockWorkflowState = parsed.state;
        }
        if (filePath.includes('annotations.json')) {
          mockAnnotations = JSON.parse(content);
        }
        return Promise.resolve();
      }),
      fileExists: vi.fn().mockResolvedValue(true),
      ensureDir: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined)
    };

    // Mock browser for screenshot capture
    const mockPage = {
      setViewportSize: vi.fn().mockResolvedValue(undefined),
      goto: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn().mockResolvedValue(undefined),
      screenshot: vi.fn().mockResolvedValue(Buffer.from('mock-screenshot')),
      close: vi.fn().mockResolvedValue(undefined)
    };

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined)
    };

    // Initialize services
    fixtureManager = new FixtureManager(mockFileOps);
    await fixtureManager.setFixtures(testFixtures);

    screenshotService = new ScreenshotCaptureService({
      browser: mockBrowser,
      outputDir: testOutputDir,
      viewports: testViewports,
      fixtureManager,
      fileOperations: mockFileOps
    });

    // Set initial workflow state
    mockWorkflowState = 'in-development';
  });

  afterAll(async () => {
    // Cleanup test resources
    await mockFileOps.remove(testOutputDir);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkflowState = 'in-development';
    mockAnnotations = [];

    // Reset file operation mocks with updated implementations
    mockFileOps.readFile.mockImplementation((filePath: string) => {
      if (filePath.includes('workflow-state.json')) {
        return Promise.resolve(JSON.stringify({ state: mockWorkflowState, timestamp: new Date().toISOString() }));
      }
      if (filePath.includes('annotations.json')) {
        return Promise.resolve(JSON.stringify(mockAnnotations));
      }
      return Promise.resolve('{}');
    });

    mockFileOps.writeFile.mockImplementation((filePath: string, content: string) => {
      if (filePath.includes('workflow-state.json')) {
        const parsed = JSON.parse(content);
        mockWorkflowState = parsed.state;
      }
      if (filePath.includes('annotations.json')) {
        mockAnnotations = JSON.parse(content);
      }
      return Promise.resolve();
    });

    mockFileOps.fileExists.mockResolvedValue(true);
  });

  // Helper function to render ResolveApp with all required props
  const renderResolveApp = (props = {}) => {
    return render(
      <ResolveApp
        fileOperations={mockFileOps}
        screenshotService={screenshotService}
        fixtureManager={fixtureManager}
        {...props}
      />
    );
  };

  describe('4-State Workflow Progression', () => {
    it('should start in "In Development" state', async () => {
      renderResolveApp();

      // Should show development interface elements
      await waitFor(() => {
        expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
      });
    });

    it('should transition to "Reviews Requested" when Request Review is clicked', async () => {
      renderResolveApp();

      const requestReviewButton = await screen.findByTestId('request-review-button');
      fireEvent.click(requestReviewButton);

      await waitFor(() => {
        expect(mockFileOps.writeFile).toHaveBeenCalledWith(
          'protobooth-workflow-state.json',
          expect.stringContaining('"state": "reviews-requested"')
        );
      });
    });

    it('should capture screenshots during "Reviews Requested" state', async () => {
      mockFileOps.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('workflow-state.json')) {
          return Promise.resolve(JSON.stringify({ state: 'reviews-requested' }));
        }
        if (filePath.includes('routes.json')) {
          return Promise.resolve(JSON.stringify({
            routes: [
              { path: '/', isDynamic: false },
              { path: '/user/[userId]', isDynamic: true, parameters: ['userId'] }
            ]
          }));
        }
        return Promise.resolve('{}');
      });

      const result = await screenshotService.captureRoutes({
        appUrl: 'http://localhost:5173',
        projectPath: demoProjectPath,
        routerType: 'vite',
        authState: 'authenticated'
      });

      // Should capture screenshots for static and dynamic routes
      expect(result.screenshots).toHaveLength(6); // 1 static + 2 dynamic instances × 2 viewports
      expect(result.injectedFixtures.auth).toEqual(testFixtures.auth!.authenticated);
    });

    it('should transition to "In Review" after screenshots are deployed', async () => {
      mockWorkflowState = 'in-review';

      renderResolveApp();

      await waitFor(() => {
        expect(screen.getByTestId('workflow-in-review')).toBeInTheDocument();
        expect(screen.getByText(/waiting for client feedback/i)).toBeInTheDocument();
      });
    });

    it('should transition to "Submitted For Development" when annotations are ready', async () => {
      mockWorkflowState = 'submitted-for-development';
      mockAnnotations = [
        {
          id: 'ann-1',
          timestamp: new Date(),
          route: '/',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'Please change this button color',
          priority: 'medium',
          status: 'pending'
        },
        {
          id: 'ann-2',
          timestamp: new Date(),
          route: '/user/123',
          viewport: 'mobile',
          position: { x: 50, y: 150 },
          content: 'Username should be larger',
          priority: 'high',
          status: 'pending'
        }
      ];

      renderResolveApp();

      await waitFor(() => {
        expect(screen.getByTestId('workflow-submitted-for-development')).toBeInTheDocument();
        expect(screen.getByTestId('annotations-count')).toHaveTextContent('2 annotations ready for resolution.');
      });
    });
  });

  describe('Request Review Workflow', () => {
    it('should validate project configuration before requesting review', async () => {
      mockFileOps.fileExists.mockImplementation((filePath: string) => {
        if (filePath.includes('protobooth.config.json')) {
          return Promise.resolve(false); // No config file
        }
        return Promise.resolve(true);
      });

      renderResolveApp();

      const requestReviewButton = await screen.findByTestId('request-review-button');
      fireEvent.click(requestReviewButton);

      await waitFor(() => {
        expect(screen.getByTestId('configuration-error')).toBeInTheDocument();
        expect(screen.getByText(/configuration required/i)).toBeInTheDocument();
        const configErrorMessage = screen.getByTestId('configuration-error-message');
        expect(configErrorMessage).toHaveTextContent(/please configure fixtures/i);
      });
    });

    it('should show progress during screenshot capture', async () => {
      renderResolveApp();

      const requestReviewButton = await screen.findByTestId('request-review-button');
      fireEvent.click(requestReviewButton);

      await waitFor(() => {
        expect(screen.getByTestId('capture-progress')).toBeInTheDocument();
        expect(screen.getByText(/capturing screenshots/i)).toBeInTheDocument();
      });
    });

    it('should generate deployment instructions after successful capture', async () => {
      // Set up routes for successful screenshot capture
      mockFileOps.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('protobooth-workflow-state.json')) {
          return Promise.resolve(JSON.stringify({ state: mockWorkflowState, timestamp: new Date().toISOString() }));
        }
        if (filePath.includes('routes.json')) {
          return Promise.resolve(JSON.stringify({
            routes: [
              { path: '/', isDynamic: false },
              { path: '/user/[userId]', isDynamic: true, parameters: ['userId'] }
            ]
          }));
        }
        return Promise.resolve('{}');
      });

      renderResolveApp();

      const requestReviewButton = await screen.findByTestId('request-review-button');
      fireEvent.click(requestReviewButton);

      // First wait for the reviews-requested state with deployment instructions
      await waitFor(() => {
        expect(screen.getByTestId('workflow-reviews-requested')).toBeInTheDocument();
      });

      await waitFor(() => {
        const deploymentInstructions = screen.getByTestId('deployment-instructions');
        expect(deploymentInstructions).toBeInTheDocument();
        expect(deploymentInstructions).toHaveTextContent(/screenshots captured successfully/i);
        expect(deploymentInstructions).toHaveTextContent(/deploy to staging server/i);
        expect(deploymentInstructions).toHaveTextContent(/share url with clients/i);
      });
    });

    it('should handle screenshot capture failures gracefully', async () => {
      // Create a failing screenshot service for this test
      const failingScreenshotService = {
        captureRoutes: vi.fn().mockRejectedValue(new Error('Browser connection failed'))
      };

      render(
        <ResolveApp
          fileOperations={mockFileOps}
          screenshotService={failingScreenshotService}
          fixtureManager={fixtureManager}
        />
      );

      const requestReviewButton = await screen.findByTestId('request-review-button');
      fireEvent.click(requestReviewButton);

      await waitFor(() => {
        expect(screen.getByTestId('general-error')).toBeInTheDocument();
        const errorMessage = screen.getByTestId('general-error-message');
        expect(errorMessage).toHaveTextContent(/screenshot capture failed/i);
        expect(errorMessage).toHaveTextContent(/browser connection failed/i);
      });
    });
  });

  describe('Annotation Download and Resolution', () => {
    it('should download annotation bundle when available', async () => {
      mockWorkflowState = 'in-review';

      renderResolveApp();

      const downloadButton = await screen.findByTestId('download-annotations-button');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockFileOps.writeFile).toHaveBeenCalledWith(
          'protobooth-workflow-state.json',
          expect.stringContaining('"state": "submitted-for-development"')
        );
      });
    });

    it('should display annotation details in resolution interface', async () => {
      mockWorkflowState = 'submitted-for-development';
      mockAnnotations = [
        {
          id: 'ann-1',
          timestamp: new Date(),
          route: '/',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'Change button color to blue',
          priority: 'medium',
          status: 'pending'
        },
        {
          id: 'ann-2',
          timestamp: new Date(),
          route: '/user/123',
          viewport: 'mobile',
          position: { x: 50, y: 150 },
          content: 'Increase font size',
          priority: 'high',
          status: 'pending'
        }
      ];

      renderResolveApp();

      await waitFor(() => {
        expect(screen.getByText(/Change button color to blue/i)).toBeInTheDocument();
        expect(screen.getByText(/Increase font size/i)).toBeInTheDocument();
        expect(screen.getByText(/medium priority/i)).toBeInTheDocument();
        expect(screen.getByText(/high priority/i)).toBeInTheDocument();
      });
    });

    it('should allow marking annotations as resolved', async () => {
      mockWorkflowState = 'submitted-for-development';
      mockAnnotations = [
        {
          id: 'ann-1',
          timestamp: new Date(),
          route: '/',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'Fix navigation',
          priority: 'high',
          status: 'pending'
        }
      ];

      renderResolveApp();

      const resolveButton = await screen.findByTestId('mark-as-resolved-button');
      fireEvent.click(resolveButton);

      await waitFor(() => {
        expect(mockFileOps.writeFile).toHaveBeenCalledWith(
          'protobooth-annotations.json',
          expect.stringContaining('"status": "resolved"')
        );
      });
    });

    it('should track resolution progress', async () => {
      mockWorkflowState = 'submitted-for-development';
      mockAnnotations = [
        {
          id: 'ann-1',
          timestamp: new Date(),
          route: '/',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'Fix header',
          priority: 'high',
          status: 'resolved'
        },
        {
          id: 'ann-2',
          timestamp: new Date(),
          route: '/',
          viewport: 'mobile',
          position: { x: 50, y: 150 },
          content: 'Fix footer',
          priority: 'medium',
          status: 'pending'
        }
      ];

      renderResolveApp();

      await waitFor(() => {
        expect(screen.getByText(/1 of 2 annotations resolved/i)).toBeInTheDocument();
        expect(screen.getByText(/50%/i)).toBeInTheDocument();
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist workflow state across dev server restarts', async () => {
      mockFileOps.writeFile.mockResolvedValue(undefined);

      renderResolveApp();

      // Simulate state change
      const requestReviewButton = await screen.findByTestId('request-review-button');
      fireEvent.click(requestReviewButton);

      await waitFor(() => {
        expect(mockFileOps.writeFile).toHaveBeenCalledWith(
          'protobooth-workflow-state.json',
          expect.stringContaining('"state": "reviews-requested"')
        );
      });
    });

    it('should restore previous workflow state on component mount', async () => {
      mockWorkflowState = 'in-review';

      renderResolveApp();

      await waitFor(() => {
        expect(screen.getByTestId('workflow-in-review')).toBeInTheDocument();
      });
    });

    it('should handle missing state file gracefully', async () => {
      mockFileOps.fileExists.mockResolvedValue(false);

      renderResolveApp();

      await waitFor(() => {
        expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors during state persistence', async () => {
      mockFileOps.writeFile.mockRejectedValue(new Error('Permission denied'));

      renderResolveApp();

      const requestReviewButton = await screen.findByTestId('request-review-button');
      fireEvent.click(requestReviewButton);

      await waitFor(() => {
        expect(screen.getByTestId('general-error')).toBeInTheDocument();
        const errorMessage = screen.getByTestId('general-error-message');
        expect(errorMessage).toHaveTextContent(/failed to save workflow state/i);
      });
    });

    it('should handle corrupted annotation data', async () => {
      mockWorkflowState = 'submitted-for-development';
      mockFileOps.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('workflow-state.json')) {
          return Promise.resolve(JSON.stringify({ state: mockWorkflowState, timestamp: new Date().toISOString() }));
        }
        if (filePath.includes('annotations.json')) {
          return Promise.resolve('invalid json data');
        }
        return Promise.resolve('{}');
      });

      renderResolveApp();

      await waitFor(() => {
        expect(screen.getByTestId('general-error')).toBeInTheDocument();
        const errorMessage = screen.getByTestId('general-error-message');
        expect(errorMessage).toHaveTextContent(/failed to load annotations/i);
      });
    });

    it('should handle network failures during annotation download', async () => {
      mockWorkflowState = 'in-review';
      // Mock file operation failure for annotation download (local development mode)
      mockFileOps.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('protobooth-workflow-state.json')) {
          return Promise.resolve(JSON.stringify({ state: mockWorkflowState, timestamp: new Date().toISOString() }));
        }
        if (filePath.includes('protobooth-annotations.json')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve('{}');
      });

      renderResolveApp();

      const downloadButton = await screen.findByTestId('download-annotations-button');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByTestId('general-error')).toBeInTheDocument();
        const errorMessage = screen.getByTestId('general-error-message');
        expect(errorMessage).toHaveTextContent(/failed to load annotations/i);
      });
    });
  });
});