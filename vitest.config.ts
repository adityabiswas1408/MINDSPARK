import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // browser APIs (performance.now, requestAnimationFrame)
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    poolOptions: {
      threads: {
        maxThreads: 2,
        minThreads: 1,
      }
    },
    testTimeout: 30000,
    hookTimeout: 60000,
    coverage: {
      provider: 'v8',
      include: ['src/lib/anzan/**', 'src/lib/anticheat/**', 'src/lib/offline/**', 'src/app/actions/**'],
      thresholds: { lines: 90, functions: 90 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
