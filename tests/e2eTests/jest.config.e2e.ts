import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  coveragePathIgnorePatterns: ['/dist/'],
  globalSetup: '../support/setup/setup.ts',
  preset: 'ts-jest',
  verbose: true,
  testMatch: ['**/tests/e2eTests/testSuites/*.spec.ts'],
  testTimeout: 300000,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'TxMA audit e2e tests',
        outputDirectory: '<rootDir>/reports',
        ancestorSeparator: ',',
        includeConsoleOutput: true
      }
    ]
  ]
}

export default config
