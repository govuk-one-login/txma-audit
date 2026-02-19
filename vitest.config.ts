import { defineConfig } from 'vitest/config'

const baseCoverage = [
  // scan all files
  '<rootDir>/**/*.ts',
  // scripts can be ignored
  '!**/scripts/**',
  // types can be ignored
  '!**/interface/**',
  '!**/interfaces/**',
  '!**/type/**',
  '!**/types/**',
  // The buildLogger function doesn't have anything we can meaningfully test
  '!**/logger.ts',
  // ignoring the tests folder
  '!**/tests/**',
  // ignore config files
  '!**/*.config.ts',
  // ignore .files
  '!**/.*'
]

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'vitest-setup.test.ts',
      '**/auditMessageDelimiter/handler.test.ts'
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: ['./common/utils/tests/setup/testEnvVars.ts'],
    coverage: {
      provider: 'v8',
      exclude: ['/node_modules/', '/.yarn/', '/dist/'].concat(baseCoverage)
    }
  }
})
