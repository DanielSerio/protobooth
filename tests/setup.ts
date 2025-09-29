import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Playwright for testing
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(() => ({
      newPage: vi.fn(() => ({
        goto: vi.fn(),
        screenshot: vi.fn(() => Buffer.from('mock-screenshot')),
        close: vi.fn()
      })),
      close: vi.fn()
    }))
  }
}));

// Mock fs-extra for testing
vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(),
  writeJSON: vi.fn(),
  readJSON: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
  remove: vi.fn()
}));