import {
  SQSEvent,
  Context,
  SQSBatchResponse,
  SQSBatchItemFailure
} from 'aws-lambda'
import { tryParseJSON } from '../../utils/helpers/tryParseJson'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { AuditEvent } from '../../types/auditEvent'
import { auditEventsToFirehoseRecords } from '../../utils/helpers/firehose/auditEventsToFirehoseRecords'
import { firehosePutRecordBatch } from '../../sharedServices/firehose/firehosePutRecordBatch'
import { getEnv } from '../../utils/helpers/getEnv'

export type ProcessingResult = {
  sqsMessageId: string
  failed: boolean
  failureReason?: string
  auditEvent?: AuditEvent
}

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  initialiseLogger(context)

  const results: ProcessingResult[] = event.Records.map((sqsRecord) => {
    const parsedRecord = tryParseJSON(sqsRecord.body) as AuditEvent

    if (typeof parsedRecord.event_id === 'undefined') {
      return {
        sqsMessageId: sqsRecord.messageId,
        failed: true,
        name: 'ParsingJSONError'
      }
    }
    const markedAuditEvent = {
      ...parsedRecord,
      txma: {
        failedSNSPublish: true
      }
    }
    return {
      sqsMessageId: sqsRecord.messageId,
      failed: false,
      auditEvent: markedAuditEvent
    }
  })

  const successfullyParsedRecords = results.filter(
    (result) => result.failed === true
  )
  const unsuccessfullyParsedRecords = results.filter(
    (result) => result.failed === false
  )

  const unsuccessfullyParsedRecordsSQSMessageId =
    SQSBatchItemFailureFromProcessingResultArray(unsuccessfullyParsedRecords)

  const auditEventArray = successfullyParsedRecords.map((element) => {
    return element.auditEvent as AuditEvent
  })

  const firehoseRecords = auditEventsToFirehoseRecords(auditEventArray)

  try {
    const result = await firehosePutRecordBatch(
      getEnv('FIREHOSE_DELIVERY_STREAM_NAME'),
      firehoseRecords
    )
    logger.debug('result', { result })
  } catch (error) {
    logger.error('failed to publish to firehose', error as Error)
  }

  return {
    batchItemFailures: unsuccessfullyParsedRecordsSQSMessageId
  }
}

const SQSBatchItemFailureFromProcessingResultArray = (
  processingResultArray: ProcessingResult[]
): SQSBatchItemFailure[] => {
  return processingResultArray.map((element) => {
    return { itemIdentifier: element.sqsMessageId }
  })
}
