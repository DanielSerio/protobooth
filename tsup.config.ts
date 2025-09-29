import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    vite: 'src/integrations/vite-plugin.ts',
    next: 'src/integrations/nextjs-plugin.ts',
    'cli/cleanup': 'src/cli/cleanup.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'vite',
    'next',
    '@tanstack/react-router'
  ],
  banner: {
    js: '#!/usr/bin/env node'
  },
  target: 'node18'
});