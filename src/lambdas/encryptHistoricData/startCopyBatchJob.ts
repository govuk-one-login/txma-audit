import { logger } from '../../services/logger'

export const startCopyBatchJob = async (s3FileKeys: string[]) => {
  logger.info('Start copy batch job', { s3FileKeys })
}
