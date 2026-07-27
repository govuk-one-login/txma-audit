import { logger } from '../../../common/sharedServices/logger'
import { S3ObjectDetails } from '../../../common/types/s3ObjectDetails'
import { getAuditEventsFromS3Object } from './getAuditEventsFromS3Object'

export const getAuditEvents = async (
  s3ObjectDetails: S3ObjectDetails[]
): Promise<{
  successfulResults: S3ObjectDetails[]
  failedIds: string[]
}> => {
  const promises: Promise<S3ObjectDetails>[] = s3ObjectDetails.map(
    async (details) => ({
      ...details,
      auditEvents: await getAuditEventsFromS3Object(
        details.bucket as string,
        details.key as string
      )
    })
  )

  const results = await Promise.allSettled(promises)

  const successfulResults: S3ObjectDetails[] = []
  const failedIds: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value)
    } else {
      const err: unknown = result.reason
      logger.error('Failed to get audit events from S3', {
        bucket: s3ObjectDetails[index].bucket,
        s3Key: s3ObjectDetails[index].key,
        sqsRecordMessageId: s3ObjectDetails[index].sqsRecordMessageId,
        error: {
          message: err instanceof Error ? err.message : String(err),
          name: err instanceof Error ? err.name : undefined,
          stack: err instanceof Error ? err.stack : undefined
        }
      })

      failedIds.push(s3ObjectDetails[index].sqsRecordMessageId)
    }
  })

  return {
    successfulResults,
    failedIds
  }
}
