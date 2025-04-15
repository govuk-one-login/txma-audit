import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  preset: 'ts-jest',
  verbose: true,
  setupFiles: ['<rootDir>/common/utils/tests/setup/testEnvVars.ts'],
  testMatch: ['**/*.test.ts', '<rootDir>/common/**/*.test.ts']
}

export default config
