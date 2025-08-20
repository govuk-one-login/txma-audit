import type { JestConfigWithTsJest } from 'ts-jest'

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

const config: JestConfigWithTsJest = {
  coveragePathIgnorePatterns: ['/node_modules/', '/.yarn/', '/dist/'],
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '<rootDir>/common/**/*.test.ts'],
  setupFiles: ['<rootDir>/common/utils/tests/setup/testEnvVars.ts'],
  collectCoverageFrom: ['Optional', 'options', 'per', 'repo'].concat(
    baseCoverage
  ),
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
}

export default config
