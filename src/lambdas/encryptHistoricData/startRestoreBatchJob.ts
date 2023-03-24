import { logger } from '../../services/logger'

export const startRestoreBatchJob = async (s3FileKeys: string[]) => {
  logger.info('starting restore batch job', { s3FileKeys })
}
