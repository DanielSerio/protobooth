// Configuration types for protobooth
import type { FixtureConfig } from './fixtures';

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
}

export interface ProtoboothConfig {
  enabled?: boolean;
  fixtures?: FixtureConfig;
  viewports?: ViewportConfig[];
  outputDir?: string;
  projectPath?: string;
  routerType?: 'vite' | 'nextjs';
}

// Re-export FixtureConfig for convenience
export type { FixtureConfig } from './fixtures';