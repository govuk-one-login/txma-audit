import { encryptS3Object } from '../../../common/sharedServices/kms/encryptS3Object'
import { logger } from '../../../common/sharedServices/logger'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { getEnv } from '../../../common/utils/helpers/getEnv'

export const encryptAuditData = async (
  eventBucket: string,
  eventKey: string
) => {
  const temporaryBucket = getEnv('AUDIT_TEMPORARY_BUCKET_NAME')
  const auditBucket = getEnv('AUDIT_BUCKET_NAME')
  const permanentBucket = getEnv('AUDIT_PERMANENT_BUCKET_NAME')

  if (eventBucket !== temporaryBucket && eventBucket !== auditBucket) {
    throw new Error(`Incorrect source bucket - ${eventBucket}`)
  }

  const temporaryDataStream = await getS3ObjectAsStream(eventBucket, eventKey)
  logger.info('Successfully retrieved data', {
    sourceBucket: eventBucket,
    key: eventKey
  })

  const encryptedData = await encryptS3Object(temporaryDataStream)
  logger.info('Successfully encrypted data', { key: eventKey })

  await putS3Object(permanentBucket, eventKey, encryptedData)
  logger.info('Successfully put encrypted data', {
    destinationBucket: permanentBucket,
    key: eventKey
  })
}
