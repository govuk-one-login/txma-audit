import {
  Context,
  SQSBatchItemFailure,
  SQSBatchResponse,
  SQSEvent
} from 'aws-lambda'
import { initialiseLogger } from '../../sharedServices/logger'
import { AuditEvent } from '../../types/auditEvent'
import { tryParseJSON } from '../../utils/helpers/tryParseJson'
import { writeToFirehose } from './writeToFirehose'

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
    const markedAuditEvent: AuditEvent = {
      ...parsedRecord,
      txma: {
        failedSNSPublish: {
          audit: true
        }
      }
    }
    return {
      sqsMessageId: sqsRecord.messageId,
      failed: false,
      auditEvent: markedAuditEvent
    }
  })

  const successfullyParsedRecords = results.filter(
    (result) => result.failed === false
  )
  const unsuccessfullyParsedRecords = results.filter(
    (result) => result.failed === true
  )
  const unsuccessfullyParsedRecordsSQSMessageId =
    SQSBatchItemFailureFromProcessingResultArray(unsuccessfullyParsedRecords)

  const firehoseResponse = await writeToFirehose(successfullyParsedRecords)

  const unsucessfullySentToFirehoseSQSMessageId =
    SQSBatchItemFailureFromProcessingResultArray(
      firehoseResponse.failedProcessingResults
    )

  return {
    batchItemFailures: unsuccessfullyParsedRecordsSQSMessageId.concat(
      unsucessfullySentToFirehoseSQSMessageId
    )
  }
}

const SQSBatchItemFailureFromProcessingResultArray = (
  processingResultArray: ProcessingResult[]
): SQSBatchItemFailure[] => {
  return processingResultArray.map((element) => {
    return { itemIdentifier: element.sqsMessageId }
  })
}
