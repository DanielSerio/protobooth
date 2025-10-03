import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileStorage } from '@/core/file-storage';
import { WorkflowStateManager } from '@/core/workflow-state-manager';
import type { Annotation } from '@/types/annotations';
import fs from 'fs/promises';
import path from 'path';

describe('FileStorage + WorkflowStateManager Integration', () => {
  const testProjectRoot = path.join(process.cwd(), 'tests', 'fixtures', 'storage-test');
  const storageDir = path.join(testProjectRoot, '.protobooth');
  let fileStorage: FileStorage;
  let stateManager: WorkflowStateManager;

  beforeEach(async () => {
    // Clean up test directories
    await fs.rm(storageDir, { recursive: true, force: true });
    await fs.mkdir(testProjectRoot, { recursive: true });

    // Create instances
    fileStorage = new FileStorage(testProjectRoot);
    stateManager = new WorkflowStateManager(fileStorage);
  });

  afterEach(async () => {
    // Clean up
    await fs.rm(storageDir, { recursive: true, force: true });
  });

  describe('Workflow State Persistence', () => {
    it('should save and load workflow state', async () => {
      // Save state
      await stateManager.setWorkflowState('reviews-requested', {
        screenshotCount: 27,
        outputPath: '.protobooth/screenshots'
      });

      // Load state
      const loadedState = await stateManager.getWorkflowState();

      expect(loadedState.state).toBe('reviews-requested');
      expect(loadedState.lastCaptureResult).toEqual({
        screenshotCount: 27,
        outputPath: '.protobooth/screenshots'
      });
      expect(loadedState.timestamp).toBeDefined();
    });

    it('should return default state when no state file exists', async () => {
      const state = await stateManager.getWorkflowState();

      expect(state.state).toBe('in-development');
      expect(state.timestamp).toBeDefined();
      expect(state.lastCaptureResult).toBeUndefined();
    });

    it('should update workflow state multiple times', async () => {
      // First update
      await stateManager.setWorkflowState('reviews-requested');
      let state = await stateManager.getWorkflowState();
      expect(state.state).toBe('reviews-requested');

      // Second update
      await stateManager.setWorkflowState('in-review');
      state = await stateManager.getWorkflowState();
      expect(state.state).toBe('in-review');

      // Third update with capture result
      await stateManager.setWorkflowState('reviews-requested', {
        screenshotCount: 15,
        outputPath: '.protobooth/screenshots'
      });
      state = await stateManager.getWorkflowState();
      expect(state.state).toBe('reviews-requested');
      expect(state.lastCaptureResult?.screenshotCount).toBe(15);
    });

    it('should persist state across manager instances', async () => {
      // Save with first instance
      await stateManager.setWorkflowState('in-review');

      // Create new instances
      const newFileStorage = new FileStorage(testProjectRoot);
      const newStateManager = new WorkflowStateManager(newFileStorage);

      // Load with new instance
      const state = await newStateManager.getWorkflowState();
      expect(state.state).toBe('in-review');
    });
  });

  describe('Annotations Persistence', () => {
    it('should save and load annotations', async () => {
      const annotations: Annotation[] = [
        {
          id: '1',
          timestamp: new Date(),
          route: '/home',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'Fix this button',
          priority: 'high',
          status: 'pending'
        },
        {
          id: '2',
          timestamp: new Date(),
          route: '/about',
          viewport: 'mobile',
          position: { x: 50, y: 75 },
          content: 'Update copy',
          priority: 'low',
          status: 'pending'
        }
      ];

      // Save annotations
      await stateManager.saveAnnotations(annotations);

      // Load annotations
      const loadedAnnotations = await stateManager.getAnnotations();

      expect(loadedAnnotations).toHaveLength(2);
      expect(loadedAnnotations[0].content).toBe('Fix this button');
      expect(loadedAnnotations[1].content).toBe('Update copy');
    });

    it('should return empty array when no annotations file exists', async () => {
      const annotations = await stateManager.getAnnotations();
      expect(annotations).toEqual([]);
    });

    it('should overwrite annotations on save', async () => {
      // Save first set
      const firstSet: Annotation[] = [
        {
          id: '1',
          timestamp: new Date(),
          route: '/home',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'First annotation',
          priority: 'high',
          status: 'pending'
        }
      ];
      await stateManager.saveAnnotations(firstSet);

      // Save second set (should overwrite)
      const secondSet: Annotation[] = [
        {
          id: '2',
          timestamp: new Date(),
          route: '/about',
          viewport: 'mobile',
          position: { x: 50, y: 75 },
          content: 'Second annotation',
          priority: 'low',
          status: 'pending'
        }
      ];
      await stateManager.saveAnnotations(secondSet);

      // Load and verify only second set exists
      const loaded = await stateManager.getAnnotations();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].content).toBe('Second annotation');
    });
  });

  describe('Workflow Reset', () => {
    it('should reset workflow to initial state', async () => {
      // Set up some state
      await stateManager.setWorkflowState('in-review');
      await stateManager.saveAnnotations([
        {
          id: '1',
          timestamp: new Date(),
          route: '/home',
          viewport: 'desktop',
          position: { x: 100, y: 200 },
          content: 'Test',
          priority: 'high',
          status: 'pending'
        }
      ]);

      // Reset
      await stateManager.resetWorkflow();

      // Verify state is reset
      const state = await stateManager.getWorkflowState();
      expect(state.state).toBe('in-development');

      // Verify annotations are cleared
      const annotations = await stateManager.getAnnotations();
      expect(annotations).toEqual([]);
    });
  });

  describe('File System Operations', () => {
    it('should create .protobooth directory automatically', async () => {
      // Save state (should create directory)
      await stateManager.setWorkflowState('in-development');

      // Verify directory exists
      const stats = await fs.stat(storageDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should write valid JSON files', async () => {
      await stateManager.setWorkflowState('reviews-requested', {
        screenshotCount: 10,
        outputPath: '.protobooth/screenshots'
      });

      // Read file directly and verify it's valid JSON
      const filePath = path.join(storageDir, 'workflow-state.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.state).toBe('reviews-requested');
      expect(parsed.lastCaptureResult.screenshotCount).toBe(10);
    });

    it('should handle concurrent writes correctly', async () => {
      // Perform multiple writes in parallel
      await Promise.all([
        stateManager.setWorkflowState('in-development'),
        stateManager.saveAnnotations([]),
        stateManager.setWorkflowState('reviews-requested')
      ]);

      // Verify final state is consistent
      const state = await stateManager.getWorkflowState();
      expect(['in-development', 'reviews-requested']).toContain(state.state);
    });
  });
});
