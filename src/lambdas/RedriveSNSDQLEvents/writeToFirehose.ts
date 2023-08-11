import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { firehosePutRecordBatch } from '../../sharedServices/firehose/firehosePutRecordBatch'
import { logger } from '../../sharedServices/logger'
import { AuditEvent } from '../../types/auditEvent'
import { auditEventsToFirehoseRecords } from '../../utils/helpers/firehose/auditEventsToFirehoseRecords'
import { getEnv } from '../../utils/helpers/getEnv'
import { ProcessingResult } from './helper'

export type FirehoseProcessingResult = {
  successfullProcessingResults: ProcessingResult[]
  failedProcessingResults: ProcessingResult[]
}

export const writeToFirehose = async (
  successfullyParsedRecords: ProcessingResult[]
): Promise<FirehoseProcessingResult> => {
  const auditEventArray = successfullyParsedRecords.map((element) => {
    return element.auditEvent as AuditEvent
  })

  const firehoseRecords = auditEventsToFirehoseRecords(auditEventArray)

  try {
    const result = await firehosePutRecordBatch(
      getEnv('FIREHOSE_DELIVERY_STREAM_NAME'),
      firehoseRecords
    )
    return parseFirehoseResponse(result, successfullyParsedRecords)
  } catch (error) {
    logger.error('failed to publish to firehose', error as Error)
    const errorOutput: FirehoseProcessingResult = {
      successfullProcessingResults: [],
      failedProcessingResults: successfullyParsedRecords
    }
    return errorOutput
  }
}

export const parseFirehoseResponse = (
  firehoseResponse: PutRecordBatchCommandOutput,
  processingResults: ProcessingResult[]
): FirehoseProcessingResult => {
  const successMessage = 'SucceededToWriteToFirehose'

  if (firehoseResponse.FailedPutCount && firehoseResponse.FailedPutCount > 0) {
    logger.warn('Some audit events failed to reingest')
    const successfullProcessingResults: ProcessingResult[] = []
    const failedProcessingResults: ProcessingResult[] = []

    firehoseResponse.RequestResponses?.forEach((response, index) => {
      if (response.ErrorCode && processingResults[index]) {
        processingResults[index] = {
          ...processingResults[index],
          statusReason: 'FailedToWriteToFirehose',
          failed: true
        }
        failedProcessingResults.push(processingResults[index])
      } else {
        processingResults[index] = {
          ...processingResults[index],
          statusReason: successMessage,
          failed: false
        }
        successfullProcessingResults.push(processingResults[index])
      }
    })
    return {
      successfullProcessingResults,
      failedProcessingResults
    }
  } else {
    return {
      successfullProcessingResults: processingResults.map((element) => {
        return {
          ...element,
          statusReason: successMessage
        }
      }),
      failedProcessingResults: []
    }
  }
}
