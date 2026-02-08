import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@universal-license/core': path.resolve(__dirname, '../core/src'),
      '@universal-license/client': path.resolve(__dirname, '../js/src'),
    },
  },
});
