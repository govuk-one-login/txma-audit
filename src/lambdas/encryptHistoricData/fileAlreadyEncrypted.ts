import { logger } from '../../services/logger'

export const fileAlreadyEncrypted = (s3FileKey: string): Promise<boolean> => {
  logger.info('Checking if file is encrypted already', { s3FileKey })
  return Promise.resolve(false)
}
