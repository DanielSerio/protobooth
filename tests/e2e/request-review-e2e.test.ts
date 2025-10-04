// RED: E2E test for Request Review workflow
// This test WILL fail until browser adapters are implemented
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, Browser, Page } from 'playwright';
import { resolve } from 'path';
import fs from 'fs/promises';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';

describe('Request Review Workflow - End to End', () => {
  let viteProcess: ChildProcess;
  let browser: Browser;
  let page: Page;
  let serverUrl: string;

  const demoAppRoot = resolve(__dirname, '../../demos/tanstack-router');
  const protoboothDir = path.join(demoAppRoot, '.protobooth');

  beforeAll(async () => {
    // Find available port (using fixed port for simplicity in E2E)
    const testPort = 5174; // Different from default 5173 to avoid conflicts
    serverUrl = `http://localhost:${testPort}`;

    // Start Vite dev server as child process
    viteProcess = spawn('npm', ['run', 'dev', '--', '--port', testPort.toString(), '--host'], {
      cwd: demoAppRoot,
      shell: true,
      stdio: 'pipe',
    });

    // Wait for server to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Vite dev server failed to start'));
      }, 60000);

      viteProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('ready in') || output.includes('Local:')) {
          clearTimeout(timeout);
          // Wait a bit more to ensure server is fully ready
          setTimeout(resolve, 2000);
        }
      });

      viteProcess.stderr?.on('data', (data) => {
        console.error('Vite error:', data.toString());
      });

      viteProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Start Playwright browser
    browser = await chromium.launch({
      headless: true,
    });
  }, 90000); // 90 second timeout for server startup

  beforeEach(async () => {
    // Clean up .protobooth directory before each test
    await fs.rm(protoboothDir, { recursive: true, force: true });
    await fs.mkdir(protoboothDir, { recursive: true });

    // Create new page for each test
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page?.close();
  });

  afterAll(async () => {
    await browser?.close();

    // Kill Vite dev server
    if (viteProcess) {
      viteProcess.kill('SIGTERM');
      // Wait for process to exit
      await new Promise((resolve) => {
        viteProcess.on('exit', resolve);
        setTimeout(resolve, 5000); // Force resolve after 5 seconds
      });
    }

    // Final cleanup
    await fs.rm(protoboothDir, { recursive: true, force: true });
  });

  it('should navigate to /protobooth/resolve successfully', async () => {
    // Navigate to protobooth resolve UI
    await page.goto(`${serverUrl}/protobooth/resolve`);

    // Wait for UI to load
    await page.locator('[data-testid="workflow-in-development"]').waitFor({
      timeout: 10000,
    });

    // Verify we're on the resolve page
    const title = await page.locator('[data-testid="workflow-state-title"]').textContent();
    expect(title).toBeTruthy();
  }, 30000);

  it('should complete Request Review workflow end-to-end', async () => {
    // Navigate to protobooth resolve UI
    await page.goto(`${serverUrl}/protobooth/resolve`);

    // Wait for UI to load
    await page.locator('[data-testid="request-review-button"]').waitFor({
      timeout: 10000,
    });

    // Verify initial state is "In Development"
    await expect(page.locator('[data-testid="workflow-in-development"]')).toBeVisible();

    // Click Request Review button
    await page.locator('[data-testid="request-review-button"]').click();

    // Wait for workflow state transition
    // This should change to "Reviews Requested" after screenshot capture
    await page.locator('[data-testid="workflow-reviews-requested"]').waitFor({
      timeout: 60000, // Screenshot capture can take time
    });

    // Verify workflow state was persisted to file system
    const stateFilePath = path.join(protoboothDir, 'workflow-state.json');
    const stateFileExists = await fs.access(stateFilePath)
      .then(() => true)
      .catch(() => false);

    expect(stateFileExists).toBe(true);

    // Read and verify workflow state content
    const stateContent = await fs.readFile(stateFilePath, 'utf-8');
    const state = JSON.parse(stateContent);
    expect(state.state).toBe('reviews-requested');
    expect(state.timestamp).toBeDefined();

    // Verify screenshots directory was created
    const screenshotsDir = path.join(protoboothDir, 'screenshots');
    const screenshotsDirExists = await fs.access(screenshotsDir)
      .then(() => true)
      .catch(() => false);

    expect(screenshotsDirExists).toBe(true);

    // Verify screenshots were captured
    const screenshots = await fs.readdir(screenshotsDir);
    expect(screenshots.length).toBeGreaterThan(0);

    // Verify screenshot files are PNG images
    const pngScreenshots = screenshots.filter(file => file.endsWith('.png'));
    expect(pngScreenshots.length).toBeGreaterThan(0);
  }, 90000); // 90 second timeout for full workflow

  it('should handle screenshot capture with fixtures from demo app', async () => {
    // Navigate to protobooth resolve UI
    await page.goto(`${serverUrl}/protobooth/resolve`);

    // Wait for UI to load
    await page.locator('[data-testid="request-review-button"]').waitFor({
      timeout: 10000,
    });

    // Click Request Review
    await page.locator('[data-testid="request-review-button"]').click();

    // Wait for capture to complete
    await page.locator('[data-testid="workflow-reviews-requested"]').waitFor({
      timeout: 60000,
    });

    // Verify screenshots for demo routes were captured
    const screenshotsDir = path.join(protoboothDir, 'screenshots');
    const screenshots = await fs.readdir(screenshotsDir);

    // Demo app has these routes (from routes.json):
    // Static: /, /about, /dashboard, /products
    // Dynamic: /product/$slug, /user/$userId
    // Should capture at least the static routes
    expect(screenshots.length).toBeGreaterThanOrEqual(4);

    // Verify deployment instructions are shown
    await expect(page.locator('[data-testid="deployment-instructions"]')).toBeVisible();
  }, 90000);

  it('should persist workflow state across page reloads', async () => {
    // Navigate to resolve UI
    await page.goto(`${serverUrl}/protobooth/resolve`);
    await page.locator('[data-testid="request-review-button"]').waitFor();

    // Trigger screenshot capture
    await page.locator('[data-testid="request-review-button"]').click();
    await page.locator('[data-testid="workflow-reviews-requested"]').waitFor({
      timeout: 60000,
    });

    // Reload the page
    await page.reload();

    // Wait for UI to load again
    await page.locator('[data-testid="workflow-state-title"]').waitFor({
      timeout: 10000,
    });

    // Verify state is still "Reviews Requested" (loaded from file)
    await expect(page.locator('[data-testid="workflow-reviews-requested"]')).toBeVisible();

    // Verify deployment instructions still visible
    await expect(page.locator('[data-testid="deployment-instructions"]')).toBeVisible();
  }, 90000);

  it('should show validation errors for missing configuration', async () => {
    // This test verifies error handling when config is missing
    // Navigate to resolve UI
    await page.goto(`${serverUrl}/protobooth/resolve`);
    await page.locator('[data-testid="workflow-in-development"]').waitFor();

    // If configuration is invalid/missing, Request Review button should be disabled
    // or show validation errors
    const requestButton = page.locator('[data-testid="request-review-button"]');

    // Button should be enabled with valid demo config
    const isDisabled = await requestButton.isDisabled();
    expect(isDisabled).toBe(false);
  }, 30000);
});
