import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom', // browser APIs (performance.now, requestAnimationFrame)
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/anzan/**', 'src/lib/anticheat/**', 'src/lib/offline/**'],
      thresholds: { lines: 90, functions: 90 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
