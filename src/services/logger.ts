import { Logger } from '@aws-lambda-powertools/logger'
import { LogLevel } from '@aws-lambda-powertools/logger/lib/types/Log'
import { Context } from 'aws-lambda'

const loggerInstance = new Logger({
  serviceName: process.env.AWS_LAMBDA_FUNCTION_NAME,
  logLevel: (process.env.LOG_LEVEL as LogLevel) || 'DEBUG'
})

export const initialiseLogger = (context: Context) => {
  loggerInstance.addContext(context)
}

export const logger = loggerInstance
