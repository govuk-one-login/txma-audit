import { SQSEvent, Context } from 'aws-lambda'
import { tryParseJSON } from '../../../common/utils/helpers/tryParseJson'
import { initialiseLogger, logger } from '../../../common/sharedServices/logger'
import { encryptAuditData } from './encryptAuditData'
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

  const eventS3data = eventData.Records[0].s3
  const eventBucket = eventS3data.bucket.name
  const eventKey = eventS3data.object.key

  await encryptAuditData(eventBucket, eventKey)
}
