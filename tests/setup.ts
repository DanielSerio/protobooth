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

// Mock fabric.js for testing
vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn(() => ({
      clear: vi.fn(),
      setBackgroundImage: vi.fn((_img, callback) => callback()),
      renderAll: vi.fn()
    })),
    Image: vi.fn((img) => ({ img }))
  }
}));