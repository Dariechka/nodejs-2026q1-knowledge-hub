import { defineConfig } from 'vitest/config';
import path from 'path';
import swc from 'unplugin-swc';

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
      provider: 'v8',
      reporter: ['text'],
      lines: 90,
      branches: 85,
      functions: 90,
      statements: 90,
      exclude: ['src/main.ts', 'src/**/*.module.ts'],
    },
    plugins: [
      swc.vite({
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      }),
    ],
  },
});
