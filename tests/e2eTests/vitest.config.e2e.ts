import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/tests/e2eTests/testSuites/*.spec.ts'],
    testTimeout: 300000,
    setupFiles: ['../support/setup/setup.ts'],
    hookTimeout: 300000
  }
})
