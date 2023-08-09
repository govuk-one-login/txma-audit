import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { firehosePutRecordBatch } from '../../sharedServices/firehose/firehosePutRecordBatch'
import { logger } from '../../sharedServices/logger'
import { AuditEvent } from '../../types/auditEvent'
import { auditEventsToFirehoseRecords } from '../../utils/helpers/firehose/auditEventsToFirehoseRecords'
import { getEnv } from '../../utils/helpers/getEnv'
import { ProcessingResult } from './handler'

type FirehoseProcessingResult = {
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
    return parseFailedFirehosePuts(result, successfullyParsedRecords)
  } catch (error) {
    logger.error('failed to publish to firehose', error as Error)
    const errorOutput: FirehoseProcessingResult = {
      successfullProcessingResults: [],
      failedProcessingResults: successfullyParsedRecords
    }
    return errorOutput
  }
}

const parseFailedFirehosePuts = (
  params: PutRecordBatchCommandOutput,
  firehoseProcessingResults: ProcessingResult[]
): FirehoseProcessingResult => {
  if (params.FailedPutCount && params.FailedPutCount > 0) {
    logger.warn('Some audit events failed to reingest')
    const successfullProcessingResults: ProcessingResult[] = []
    const failedProcessingResults: ProcessingResult[] = []

    params.RequestResponses?.forEach((response, index) => {
      if (response.ErrorCode && firehoseProcessingResults[index]) {
        firehoseProcessingResults[index] = {
          ...firehoseProcessingResults[index],
          failureReason: 'succeededToWriteToFirehose'
        }
        successfullProcessingResults.push(firehoseProcessingResults[index])
      } else {
        firehoseProcessingResults[index] = {
          ...firehoseProcessingResults[index],
          failureReason: 'FailedToWriteToFirehose'
        }
        failedProcessingResults.push(firehoseProcessingResults[index])
      }
    })
    return {
      successfullProcessingResults,
      failedProcessingResults
    }
  } else {
    return {
      successfullProcessingResults: firehoseProcessingResults,
      failedProcessingResults: []
    }
  }
}
