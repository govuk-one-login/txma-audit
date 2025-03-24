import { Context, SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { AuditEvent } from '../../types/auditEvent'
import {
  generateEventIdLogMessageFromProcessingResult,
  parseSQSEvent,
  SQSBatchItemFailureFromProcessingResultArray
} from './helper'
import { writeToFirehose } from './writeToFirehose'

export interface ProcessingResult {
  sqsMessageId: string
  failed: boolean
  statusReason: string
  auditEvent?: AuditEvent
}

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  initialiseLogger(context)

  const { successfullyParsedRecords, unsuccessfullyParsedRecords } =
    parseSQSEvent(event)

  const firehoseResponse = await writeToFirehose(successfullyParsedRecords)

  const unsuccessfullyParsedRecordsSQSMessageId =
    SQSBatchItemFailureFromProcessingResultArray(unsuccessfullyParsedRecords)

  const unsucessfullySentToFirehoseSQSMessageId =
    SQSBatchItemFailureFromProcessingResultArray(
      firehoseResponse.failedProcessingResults
    )

  const batchItemFailure = unsuccessfullyParsedRecordsSQSMessageId.concat(
    unsucessfullySentToFirehoseSQSMessageId
  )

  logger.info('processed the following event ids', {
    event_id: generateEventIdLogMessageFromProcessingResult([
      firehoseResponse.failedProcessingResults,
      firehoseResponse.successfullProcessingResults
    ])
  })
  return {
    batchItemFailures: batchItemFailure
  }
}
