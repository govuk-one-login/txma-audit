import {
  Context,
  SQSBatchItemFailure,
  SQSBatchResponse,
  SQSEvent,
  SQSRecord
} from 'aws-lambda'
import { initialiseLogger, logger } from '../../services/logger'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { tryParseJSON } from '../../utils/helpers/tryParseJson'
import { deleteOrUpdateS3Objects } from './deleteOrUpdateS3Objects'
import { getAuditEvents } from './getAuditEvents'
import { sendAuditEventsToFirehose } from './sendAuditEventsToFirehose'

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  initialiseLogger(context)

  logger.info(`Received ${event.Records.length} records for processing`)

  const batchItemFailures: SQSBatchItemFailure[] = []
  const s3ObjectDetails: S3ObjectDetails[] = getS3ObjectDetails(event.Records)

  // Get the audit events from the S3 objects, if there is a failure we can send
  // the message back to the queue for reprocessing
  const getAuditEventsResults = await getAuditEvents(s3ObjectDetails)
  batchItemFailures.push(
    ...messageIdsToBatchItemFailures(getAuditEventsResults.failedIds)
  )

  if (batchItemFailures.length > 0) {
    logger.warn(
      'Finished getting Audit Events from S3. There were some failures.',
      { batchItemFailures }
    )
  } else {
    logger.info('Successfully got Audit Events from S3')
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

const getS3ObjectDetails = (records: SQSRecord[]): S3ObjectDetails[] => {
  const s3ObjectDetails = records
    .filter((record) => {
      const isS3TestEvent = tryParseJSON(record.body).Event === 's3:TestEvent'

      if (isS3TestEvent) {
        logger.info('Event is of type s3:TestEvent, ignoring')
      }

      return !isS3TestEvent
    })
    .filter((record) => {
      const s3EventData = tryParseJSON(record.body).Records[0].s3
      const key: string = s3EventData?.object?.key
      const bucket: string = s3EventData?.bucket?.name

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
    })
    .map((record): S3ObjectDetails => {
      const s3EventData = tryParseJSON(record.body).Records[0].s3

      return {
        bucket: s3EventData?.bucket?.name,
        key: s3EventData?.object?.key,
        sqsRecordMessageId: record.messageId
      }
    })

  logger.info(`Found ${s3ObjectDetails.length} S3 objects to process`, {
    s3ObjectDetails: s3ObjectDetails.map(({ bucket, key }) => ({
      bucket,
      key
    }))
  })

  return s3ObjectDetails
}

const messageIdsToBatchItemFailures = (messageIds: string[]) =>
  messageIds.map((messageId) => ({
    itemIdentifier: messageId
  }))
