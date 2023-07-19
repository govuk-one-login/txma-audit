import { logger } from '../../sharedServices/logger'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
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
      auditEvents: await getAuditEventsFromS3Object(details.bucket, details.key)
    })
  )

  const results = await Promise.allSettled(promises)

  const successfulResults: S3ObjectDetails[] = []
  const failedIds: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value)
    } else {
      logger.error('Error getting audit events from S3', {
        bucket: s3ObjectDetails[index].bucket,
        s3Key: s3ObjectDetails[index].key,
        sqsRecordMessageId: s3ObjectDetails[index].sqsRecordMessageId,
        error: result.reason
      })

      failedIds.push(s3ObjectDetails[index].sqsRecordMessageId)
    }
  })

  return {
    successfulResults,
    failedIds
  }
}
