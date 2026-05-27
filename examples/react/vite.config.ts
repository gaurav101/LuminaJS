import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@gks101/luminajs/react',
        replacement: fileURLToPath(
          new URL('../../dist/react/index.js', import.meta.url),
        ),
      },
      {
        find: '@gks101/luminajs',
        replacement: fileURLToPath(
          new URL('../../dist/index.js', import.meta.url),
        ),
      },
    ],
    // Force a single copy of React across all peer dependencies
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});
