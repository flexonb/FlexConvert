import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./frontend/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.encore/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend'),
      '~encore': resolve(__dirname, './.encore/types'),
      '~backend': resolve(__dirname, './.encore/types'),
    },
  },
});
