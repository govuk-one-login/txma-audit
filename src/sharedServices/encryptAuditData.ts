import { encryptS3Object } from '../services/kms/encryptS3Object'
import { logger } from '../services/logger'
import { getS3ObjectAsStream } from '../services/s3/getS3ObjectAsStream'
import { putS3Object } from '../services/s3/putS3Object'
import { getEnv } from '../utils/helpers'

export const encryptAuditData = async (
  eventBucket: string,
  eventKey: string
) => {
  const temporaryBucket = getEnv('TEMPORARY_BUCKET_NAME')
  const auditBucket = getEnv('AUDIT_BUCKET_NAME')
  const permanentBucket = getEnv('PERMANENT_BUCKET_NAME')

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
