import { Logger } from '@aws-lambda-powertools/logger'

export const logger = new Logger({
  serviceName: 'integration-tests',
  environment: process.env.TEST_ENVIRONMENT,
  logLevel: 'DEBUG'
})

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason as Error)
  process.exit(1)
})
