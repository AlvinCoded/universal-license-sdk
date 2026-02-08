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
      '@unilic/core': path.resolve(__dirname, '../core/src'),
      '@unilic/client': path.resolve(__dirname, '../js/src'),
    },
  },
});
