import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      AI_PROVIDER: 'static',
    },
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
