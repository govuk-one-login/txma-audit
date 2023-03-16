import { SQSEvent, Context } from 'aws-lambda'
import { getS3ObjectAsStream } from '../../services/s3/getS3ObjectAsStream'
import { putS3Object } from '../../services/s3/putS3Object'
import { getEnv, tryParseJSON } from '../../utils/helpers'
import { encryptS3Object } from '../../services/kms/encryptS3Object'
import { initialiseLogger, logger } from '../../services/logger'
export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<void> => {
  initialiseLogger(context)

  if (event.Records.length === 0) {
    throw new Error('No data in event')
  }

  const eventData = tryParseJSON(event.Records[0].body)

  if (eventData.Event === 's3:TestEvent') {
    logger.info('Event is of type s3:TestEvent and will not be encrypted')
    return
  }

  if (!eventData.Records[0].s3) {
    throw new Error('No s3 data in event')
  }

  const temporaryBucket = getEnv('TEMPORARY_BUCKET_NAME')
  const auditBucket = getEnv('AUDIT_BUCKET_NAME')
  const permanentBucket = getEnv('PERMANENT_BUCKET_NAME')

  const eventS3data = eventData.Records[0].s3
  const eventBucket = eventS3data.bucket.name
  const eventKey = eventS3data.object.key

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
