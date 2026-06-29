import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'vitest-setup.test.ts',
      '**/auditMessageDelimiter/handler.test.ts',
      '**/sharedServices/s3/*.test.ts',
      '**/sharedServices/firehose/*.test.ts',
      '**/sharedServices/kms/*.test.ts',
      '**/s3CopyAndEncrypt/*.test.ts',
      '**/redriveSnsDlqEvents/*.test.ts',
      '**/auditMessageFirehoseReingest/*.test.ts'
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: ['./common/utils/tests/setup/testEnvVars.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts', 'common/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/scripts/**',
        '**/interface/**',
        '**/interfaces/**',
        '**/type/**',
        '**/types/**',
        '**/logger.ts',
        '**/tests/**',
        '**/*.config.ts',
        '**/*.test.ts'
      ]
    }
  }
})
