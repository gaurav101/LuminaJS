import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  server: {
    port: 5176,
    strictPort: true,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});
