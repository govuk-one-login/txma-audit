import { Context } from 'aws-lambda'
import { initialiseLogger, logger } from '../../services/logger'
import { startCopyBatchJob } from './startCopyBatchJob'
import { startRestoreBatchJob } from './startRestoreBatchJob'
import { listFilesToEncrypt } from './listFilesToEncrypt'

export const handler = async (
  parameters: { dateFrom: string; dateTo: string; notTestMode: boolean },
  context: Context
) => {
  initialiseLogger(context)
  logger.info('Checking data for historic decrypt', {
    dateFrom: parameters.dateFrom,
    dateTo: parameters.dateTo
  })
  const listFilesResults = await listFilesToEncrypt(parameters)
  logger.info(
    `${listFilesResults.standardFiles} standard files and ${listFilesResults.glacierFiles} glacier files found`
  )
  if (!parameters.notTestMode) {
    logger.info('Not starting batch jobs because this was a test mode run')
  } else {
    logger.info('Starting batch jobs')
    await startRestoreBatchJob(listFilesResults.glacierFiles)
    await startCopyBatchJob(listFilesResults.standardFiles)
  }
}
