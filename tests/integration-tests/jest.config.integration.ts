import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  coveragePathIgnorePatterns: ['/.yarn/', '/dist/'],
  globalSetup: '<rootDir>/support/setup/setup.ts',
  preset: 'ts-jest',
  verbose: true,
  testMatch: ['**/tests/integration-tests/test-suites/*.spec.ts'],
  testTimeout: 300000,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'TxMA audit integration tests',
        outputDirectory: '<rootDir>/reports',
        ancestorSeparator: ',',
        includeConsoleOutput: true
      }
    ]
  ]
}

export default config
