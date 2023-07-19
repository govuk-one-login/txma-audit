import { logger } from '../../sharedServices/logger'

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
