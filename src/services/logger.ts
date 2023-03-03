import { Logger } from '@aws-lambda-powertools/logger'
import { LogLevel } from '@aws-lambda-powertools/logger/lib/types/Log'
import { Context } from 'aws-lambda'

const getLogLevel = (): LogLevel => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL as LogLevel
  }

  return 'DEBUG'
}

const loggerInstance = new Logger({
  serviceName: process.env.AWS_LAMBDA_FUNCTION_NAME,
  logLevel: getLogLevel()
})

export const initialiseLogger = (context: Context) => {
  loggerInstance.addContext(context)
}

export const logger = loggerInstance
