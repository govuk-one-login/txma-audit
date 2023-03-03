import { logger } from '../services/logger'

export const getEnv = (name: string) => {
  const env = process.env[name]

  if (env === undefined || env === null)
    throw Error(`Missing environment variable: ${name}`)

  return env
}

export const tryParseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    // We deliberately don't log out the specific error here,
    // because Node 19 and onwards will include part of the string the parser
    // was attempting to parse, which can leak sensitive data
    logger.error('Error parsing JSON')
    return {}
  }
}
