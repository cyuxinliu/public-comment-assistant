import { defineConfig } from 'vitest/config'

// Live-model test questions. Separate from `npm test`, which never calls the API.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['eval/**/*.eval.ts'],
    testTimeout: 180_000,
    fileParallelism: false,
  },
})
