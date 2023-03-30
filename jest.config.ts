import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  preset: 'ts-jest',
  verbose: true,
  setupFiles: ['<rootDir>/src/utils/tests/setup/testEnvVars.ts']
}

export default config
