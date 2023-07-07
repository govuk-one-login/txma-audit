import {
  Context,
  Handler,
  SQSBatchItemFailure,
  SQSBatchResponse,
  SQSEvent,
  SQSRecord
} from 'aws-lambda'
import { initialiseLogger, logger } from '../../services/logger'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { tryParseJSON } from '../../utils/helpers/tryParseJson'
import { getAuditEvents } from './getAuditEvents'

export const handler: Handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  initialiseLogger(context)

  logger.info(`Received ${event.Records.length} records for processing`)

  const batchItemFailures: SQSBatchItemFailure[] = []

  const bucket: string = JSON.parse(event.Records[0].body).s3.bucket.name
  const s3ObjectDetails: S3ObjectDetails[] = getS3ObjectDetails(event.Records)

  const getAuditEventsResults = await getAuditEvents(s3ObjectDetails, bucket)
  batchItemFailures.push(
    ...messageIdsToBatchItemFailures(getAuditEventsResults.failedIds)
  )

  // Use PutRecordBatch to reingest the audit message

  // Delete object from S3

  return {
    batchItemFailures: []
  }
}

const getS3ObjectDetails = (records: SQSRecord[]): S3ObjectDetails[] =>
  records
    .filter((record) => tryParseJSON(record.body).Event === 's3:TestEvent')
    .map((record) => ({
      key: JSON.parse(record.body).s3.object.key as string,
      sqsRecordMessageId: record.messageId
    }))

const messageIdsToBatchItemFailures = (messageIds: string[]) =>
  messageIds.map((messageId) => ({
    itemIdentifier: messageId
  }))
