import type {
  Context,
  FirehoseTransformationEvent,
  FirehoseTransformationEventRecord,
  FirehoseTransformationResult
} from 'aws-lambda'

import { initialiseLogger, logger } from '../../../common/sharedServices/logger'

/* eslint-disable @typescript-eslint/require-await */
export const handler = async (
  event: FirehoseTransformationEvent,
  context: Context
): Promise<FirehoseTransformationResult> => {
  initialiseLogger(context)
  const startTime = Date.now()

  logger.info('Event processing started', {
    recordCount: event.records.length
  })

  /* Process the list of records and transform them */
  const output = event.records.map(
    (record: FirehoseTransformationEventRecord) => {
      try {
        const recordData = Buffer.from(record.data, 'base64').toString('utf8')
        const payload = Buffer.from(recordData + '\n', 'utf8').toString(
          'base64'
        )

        return {
          recordId: record.recordId,
          result: 'Ok' as const,
          data: payload
        }
      } catch (err) {
        logger.error('Failed to process Firehose record', {
          errorCode: 'TAUD012',
          recordId: record.recordId,
          error: {
            message: err instanceof Error ? err.message : String(err),
            name: err instanceof Error ? err.name : undefined,
            stack: err instanceof Error ? err.stack : undefined
          }
        })

        return {
          recordId: record.recordId,
          result: 'ProcessingFailed' as const,
          data: record.data
        }
      }
    }
  )

  const failedCount = output.filter(
    (r) => r.result === 'ProcessingFailed'
  ).length

  if (failedCount > 0) {
    logger.error('Event processing completed with failures', {
      errorCode: 'TAUD012',
      outcome: 'partial',
      duration: Date.now() - startTime,
      processedCount: output.length,
      failedCount
    })
  } else {
    logger.info('Event processing completed', {
      outcome: 'success',
      duration: Date.now() - startTime,
      processedCount: output.length
    })
  }

  return { records: output }
}
