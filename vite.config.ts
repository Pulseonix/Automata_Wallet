import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@lib': resolve(__dirname, './src/lib'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html',
      },
    },
    target: 'esnext', // Support for top-level await and workers
  },
  worker: {
    format: 'es', // ES module format for workers
    plugins: () => [],
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
