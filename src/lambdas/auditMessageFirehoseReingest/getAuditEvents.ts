import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { getAuditEventsFromS3Object } from './getAuditEventsFromS3Object'

export const getAuditEvents = async (
  s3ObjectDetails: S3ObjectDetails[],
  bucket: string
): Promise<{
  successfulResults: S3ObjectDetails[]
  failedIds: string[]
}> => {
  const promises = s3ObjectDetails.map(async (details) => ({
    ...details,
    auditEvents: await getAuditEventsFromS3Object(bucket, details.key)
  }))

  const results = await Promise.allSettled(promises)

  const successfulResults: S3ObjectDetails[] = []
  const failedIds: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value)
    } else {
      failedIds.push(s3ObjectDetails[index].sqsRecordMessageId)
    }
  })

  return {
    successfulResults,
    failedIds
  }
}
