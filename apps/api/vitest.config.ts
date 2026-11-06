import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    include: ['tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'test-secret-key-that-has-at-least-32-chars-long-123456',
      PORT: '3001',
      WEB_ORIGIN: 'http://localhost:5173',
      ANTHROPIC_MODEL: 'claude-sonnet-4-5',
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
