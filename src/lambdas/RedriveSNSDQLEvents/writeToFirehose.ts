import { firehosePutRecordBatch } from '../../sharedServices/firehose/firehosePutRecordBatch'
import { logger } from '../../sharedServices/logger'
import { AuditEvent } from '../../types/auditEvent'
import { auditEventsToFirehoseRecords } from '../../utils/helpers/firehose/auditEventsToFirehoseRecords'
import { getEnv } from '../../utils/helpers/getEnv'
import { ProcessingResult } from './helper'
import { parseFirehoseResponse } from './parseFirehoseResponse'

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
