import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  build: {
    outDir: 'dist/ui',
    emptyOutDir: true,
    lib: {
      entry: {
        'resolve': path.resolve(__dirname, 'src/ui/Resolve/index.tsx')
      },
      formats: ['iife'],
      name: 'ProtoboothResolve',
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
