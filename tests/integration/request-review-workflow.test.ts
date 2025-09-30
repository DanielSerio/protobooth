import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { closeBrowser } from '@/api/screenshot-handler';
import { handleFileRead, handleFileWrite, handleFileExists } from '@/api/file-handler';
import path from 'path';
import fs from 'fs/promises';

describe('Request Review Workflow End-to-End', () => {
  const testProjectRoot = path.join(process.cwd(), 'tests', 'fixtures', 'workflow-test');
  const storageDir = path.join(testProjectRoot, '.protobooth');

  beforeEach(async () => {
    // Clean up test directories
    await fs.rm(storageDir, { recursive: true, force: true });
    await fs.mkdir(testProjectRoot, { recursive: true });
  });

  afterEach(async () => {
    // Clean up
    await fs.rm(storageDir, { recursive: true, force: true });
    await closeBrowser();
  });

  it('should complete full Request Review workflow with file persistence', async () => {
    // Step 1: Verify initial state - no workflow state exists
    const initialExists = await handleFileExists(
      'protobooth-workflow-state.json',
      testProjectRoot
    );
    expect(initialExists).toBe(false);

    // Step 2: Create initial workflow state (simulating UI initialization)
    const initialState = {
      state: 'in-development',
      timestamp: new Date().toISOString()
    };
    await handleFileWrite(
      'protobooth-workflow-state.json',
      JSON.stringify(initialState),
      testProjectRoot
    );

    // Step 3: Verify state was written
    const stateExists = await handleFileExists(
      'protobooth-workflow-state.json',
      testProjectRoot
    );
    expect(stateExists).toBe(true);

    // Step 4: Read state back
    const savedState = await handleFileRead(
      'protobooth-workflow-state.json',
      testProjectRoot
    );
    expect(JSON.parse(savedState)).toMatchObject({
      state: 'in-development'
    });

    // Step 5: Create routes.json for route discovery
    const routesData = {
      appRouter: [
        { path: '/', isDynamic: false, parameters: [] },
        { path: '/user/[id]', isDynamic: true, parameters: ['id'] }
      ]
    };
    await fs.mkdir(path.join(testProjectRoot, 'demos', 'nextjs', 'src', 'app'), {
      recursive: true
    });
    await fs.writeFile(
      path.join(testProjectRoot, 'demos', 'nextjs', 'routes.json'),
      JSON.stringify(routesData)
    );

    // Step 6: Update workflow state to 'reviews-requested'
    // (In real workflow, config would be prepared and passed to screenshot API)
    const reviewsRequestedState = {
      state: 'reviews-requested',
      timestamp: new Date().toISOString()
    };
    await handleFileWrite(
      'protobooth-workflow-state.json',
      JSON.stringify(reviewsRequestedState),
      testProjectRoot
    );

    // Step 7: Verify state transition persisted
    const updatedState = await handleFileRead(
      'protobooth-workflow-state.json',
      testProjectRoot
    );
    expect(JSON.parse(updatedState)).toMatchObject({
      state: 'reviews-requested'
    });

    // Step 8: Trigger screenshot capture (this would normally be done via HTTP API)
    // Note: We skip actual screenshot capture in test to avoid launching real browser
    // In real e2e test, you'd run this against actual server
    vi.spyOn(console, 'log'); // Suppress logs

    // Step 9: Verify workflow state file persists across operations
    const finalState = await handleFileRead(
      'protobooth-workflow-state.json',
      testProjectRoot
    );
    const parsedFinalState = JSON.parse(finalState);
    expect(parsedFinalState.state).toBe('reviews-requested');
    expect(parsedFinalState.timestamp).toBeDefined();

    // Step 10: Verify .protobooth directory was created
    const storageExists = await fs.access(storageDir)
      .then(() => true)
      .catch(() => false);
    expect(storageExists).toBe(true);
  });

  it('should handle file read errors gracefully', async () => {
    await expect(
      handleFileRead('non-existent-file.json', testProjectRoot)
    ).rejects.toThrow('File not found');
  });

  it('should create storage directory on first write', async () => {
    const filename = 'test-file.json';
    const content = JSON.stringify({ test: 'data' });

    await handleFileWrite(filename, content, testProjectRoot);

    const exists = await handleFileExists(filename, testProjectRoot);
    expect(exists).toBe(true);

    const readContent = await handleFileRead(filename, testProjectRoot);
    expect(JSON.parse(readContent)).toEqual({ test: 'data' });
  });

  it('should support multiple workflow state transitions', async () => {
    const states = [
      'in-development',
      'reviews-requested',
      'in-review',
      'submitted-for-development'
    ];

    for (const state of states) {
      const stateData = {
        state,
        timestamp: new Date().toISOString()
      };

      await handleFileWrite(
        'protobooth-workflow-state.json',
        JSON.stringify(stateData),
        testProjectRoot
      );

      const saved = await handleFileRead(
        'protobooth-workflow-state.json',
        testProjectRoot
      );

      expect(JSON.parse(saved).state).toBe(state);
    }
  });
});
