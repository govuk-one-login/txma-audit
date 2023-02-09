import { SQSEvent } from 'aws-lambda'
import { getS3ObjectAsStream } from '../../services/s3/getS3Object'
import { putS3Object } from '../../services/s3/putS3Object'
import { getEnv, tryParseJSON } from '../../utils/helpers'
import { encryptS3Object } from '../../services/kms/encryptS3Object'

export const handler = async (event: SQSEvent): Promise<void> => {
  console.log(
    'Handling initiate copy and encrypt SQS event',
    JSON.stringify(event, null, 2)
  )

  if (event.Records.length === 0) {
    throw new Error('No data in event')
  }

  const eventData = tryParseJSON(event.Records[0].body)

  if (!eventData.Records[0].s3) {
    throw new Error('No s3 data in event')
  }

  const temporaryBucket = getEnv('TEMPORARY_BUCKET_NAME')
  const permanentBucket = getEnv('PERMANENT_BUCKET_NAME')

  const eventS3data = eventData.Records[0].s3
  const eventBucket = eventS3data.bucket.name
  const eventKey = eventS3data.object.key

  if (eventBucket !== temporaryBucket) {
    throw new Error(`Incorrect source bucket - ${eventBucket}`)
  }

  const temporaryDataStream = await getS3ObjectAsStream(eventBucket, eventKey)

  const encryptedData = await encryptS3Object(temporaryDataStream)

  await putS3Object(permanentBucket, eventKey, encryptedData)
}
