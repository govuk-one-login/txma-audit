import { _Object } from '@aws-sdk/client-s3'
import { Context } from 'aws-lambda'
import { initialiseLogger, logger } from '../../services/logger'
import { startCopyBatchJob } from './startCopyBatchJob'
import { startRestoreBatchJob } from './startRestoreBatchJob'
import { listAuditFilesForDateRange } from './listAuditFilesForDateRange'
import { fileAlreadyEncrypted } from './fileAlreadyEncrypted'

export const handler = async (
  parameters: { dateFrom: string; dateTo: string },
  context: Context
) => {
  initialiseLogger(context)
  logger.info('Checking data for historic decrypt', {
    dateFrom: parameters.dateFrom,
    dateTo: parameters.dateTo
  })
  const fileList = await filterFileListForAlreadyEncryptedData(
    await listAuditFilesForDateRange(parameters)
  )
  const glacierFiles = fileList.filter((f) => f.StorageClass === 'GLACIER')
  const standardTierFiles = fileList.filter(
    (f) => f.StorageClass === 'STANDARD'
  )
  await startCopyBatchJob(standardTierFiles.map((f) => f.Key as string))
  await startRestoreBatchJob(glacierFiles.map((f) => f.Key as string))
}

const filterFileListForAlreadyEncryptedData = async (
  fileList: _Object[]
): Promise<_Object[]> => {
  return fileList.filter((file) => !!file.Key && fileAlreadyEncrypted(file.Key))
}
