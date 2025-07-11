import {
  Context,
  SQSBatchItemFailure,
  SQSBatchResponse,
  SQSEvent,
  SQSRecord
} from 'aws-lambda'
import { initialiseLogger, logger } from '../../../common/sharedServices/logger'
import { S3ObjectDetails } from '../../../common/types/s3ObjectDetails'
import { tryParseJSON } from '../../../common/utils/helpers/tryParseJson'
import { deleteOrUpdateS3Objects } from './deleteOrUpdateS3Objects'
import { getAuditEvents } from './getAuditEvents'
import { sendAuditEventsToFirehose } from './sendAuditEventsToFirehose'

interface S3EventRecord {
  s3?: {
    bucket?: {
      name?: string
    }
    object?: {
      key?: string
    }
  }
}

interface S3EventBody {
  Records?: S3EventRecord[]
  Event?: string
}

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  initialiseLogger(context)

  logger.info(`Received ${event.Records.length} records for processing`)

  const batchItemFailures: SQSBatchItemFailure[] = []
  const s3ObjectDetailsArray: S3ObjectDetails[] = getDetailsOfS3Objects(
    event.Records
  )

  // Get the audit events from the S3 objects, if there is a failure we can send
  // the message back to the queue for reprocessing
  const getAuditEventsResults = await getAuditEvents(s3ObjectDetailsArray)
  batchItemFailures.push(
    ...messageIdsToBatchItemFailures(getAuditEventsResults.failedIds)
  )

  if (batchItemFailures.length > 0) {
    logger.warn(
      'Finished retrieving Audit Events from S3. There were some failures.',
      { batchItemFailures }
    )
  } else {
    logger.info('Successfully retrieved Audit Events from S3')
  }

  // Send the audit events to Firehose, and collect any that Firehose failed
  // to ingest
  const sendAuditEventsToFirehoseResults = await sendAuditEventsToFirehose(
    getAuditEventsResults.successfulResults
  )

  // Delete or update the S3 objects based on the results of the Firehose
  // ingestion. If there are any failures we can keep the S3 object and update
  // it with the events that failed to reingest
  await deleteOrUpdateS3Objects(sendAuditEventsToFirehoseResults)

  return {
    batchItemFailures
  }
}

const getDetailsOfS3Objects = (records: SQSRecord[]): S3ObjectDetails[] => {
  const s3ObjectDetailsArray = records
    .filter(isS3TestEvent)
    .filter(hasFailuresPrefix)
    .map(getS3ObjectDetails)

  logger.info(`Found ${s3ObjectDetailsArray.length} S3 objects to process`, {
    s3ObjectDetails: s3ObjectDetailsArray.map(({ bucket, key }) => ({
      bucket,
      key
    }))
  })

  return s3ObjectDetailsArray
}

const messageIdsToBatchItemFailures = (messageIds: string[]) =>
  messageIds.map((messageId) => ({
    itemIdentifier: messageId
  }))

const isS3TestEvent = (record: SQSRecord) => {
  const parsedBody = tryParseJSON(record.body) as S3EventBody
  const isS3TestEvent = parsedBody.Event === 's3:TestEvent'

  if (isS3TestEvent) {
    logger.info('Event is of type s3:TestEvent, ignoring')
  }

  return !isS3TestEvent
}

const hasFailuresPrefix = (record: SQSRecord) => {
  const parsedBody = tryParseJSON(record.body) as S3EventBody
  const s3EventData = parsedBody.Records?.[0]?.s3
  const key = s3EventData?.object?.key ?? ''
  const bucket = s3EventData?.bucket?.name ?? ''

  if (key && bucket) {
    const isFailuresKey = key.startsWith('failures/')

    if (!isFailuresKey) {
      logger.warn('Received object without failures/ prefix, ignoring', {
        bucket,
        key
      })
    }
    return isFailuresKey
  }
  return false
}

const getS3ObjectDetails = (record: SQSRecord): S3ObjectDetails => {
  const parsedBody = tryParseJSON(record.body) as S3EventBody
  const s3EventData = parsedBody.Records?.[0]?.s3

  return {
    bucket: s3EventData?.bucket?.name,
    key: s3EventData?.object?.key,
    sqsRecordMessageId: record.messageId
  }
}
