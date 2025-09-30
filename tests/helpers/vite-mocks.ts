import type { PluginContext, RollupLog, RollupError } from 'rollup';

/**
 * Creates a mock plugin context for Vite hooks in tests
 * Returns a Partial<PluginContext> that satisfies the minimum requirements
 */
export const createMockPluginContext = (): Partial<PluginContext> => ({
  error(error: string | RollupError): never {
    throw new Error(typeof error === 'string' ? error : error.message);
  },
  warn(warning: string | RollupLog | (() => string | RollupLog)): void {
    const message = typeof warning === 'function' ? warning() : warning;
    const messageStr = typeof message === 'string' ? message : message.message;
    console.warn(messageStr);
  },
  info(log: string | RollupLog | (() => string | RollupLog)): void {
    const message = typeof log === 'function' ? log() : log;
    const messageStr = typeof message === 'string' ? message : message.message;
    console.info(messageStr);
  },
  debug(log: string | RollupLog | (() => string | RollupLog)): void {
    const message = typeof log === 'function' ? log() : log;
    const messageStr = typeof message === 'string' ? message : message.message;
    console.debug(messageStr);
  },
  meta: {
    rollupVersion: '3.0.0',
    watchMode: false,
    viteVersion: '5.0.0'
  }
});
