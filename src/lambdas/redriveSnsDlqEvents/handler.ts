import { Context, SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { initialiseLogger, logger } from '../../../common/sharedServices/logger'
import { AuditEvent } from '../../../common/types/auditEvent'
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
  const startTime = Date.now()
  const correlationId = event.Records[0]?.messageId

  logger.info('Redrive SNS DLQ events started', {
    correlationId,
    recordCount: event.Records.length
  })

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

  logger.info('Redrive SNS DLQ events completed', {
    correlationId,
    outcome: batchItemFailure.length === 0 ? 'success' : 'partial',
    duration: Date.now() - startTime,
    processedCount: event.Records.length,
    failedCount: batchItemFailure.length,
    eventIds: generateEventIdLogMessageFromProcessingResult([
      firehoseResponse.failedProcessingResults,
      firehoseResponse.successfullProcessingResults
    ])
  })

  return {
    batchItemFailures: batchItemFailure
  }
}
