import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['**/*.e2e.spec.ts'],
    setupFiles: ['./test/setup/setup.ts'],
    coverage: {
      reporter: ['text'],
      lines: 90,
      branches: 85,
      functions: 90,
      statements: 90,
      exclude: ['src/main.ts', 'src/**/*.module.ts'],
    },
  },
});
