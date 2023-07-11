import { PutRecordBatchOutput } from '@aws-sdk/client-firehose'
import { firehosePutRecordBatch } from '../../services/firehose/firehosePutRecordBatch'
import { logger } from '../../services/logger'
import { AuditEvent } from '../../types/auditEvent'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { auditEventsToFirehoseRecords } from '../../utils/helpers/firehose/auditEventsToFirehoseRecords'
import { getEnv } from '../../utils/helpers/getEnv'

export const sendAuditEventsToFirehose = async (
  s3ObjectDetails: S3ObjectDetails[]
): Promise<S3ObjectDetails[]> =>
  Promise.all(
    s3ObjectDetails.map(async (details) => {
      const records = auditEventsToFirehoseRecords(
        details.auditEvents as AuditEvent[]
      )

      try {
        const result = await firehosePutRecordBatch(
          getEnv('FIREHOSE_DELIVERY_STREAM_NAME'),
          records
        )

        /*******************************
         * TODO: REMOVE DEBUG STATEMENT *
         *******************************/
        logger.info('Firehose PutRecordBatch result', { result })

        return handleFirehosePutRecordBatchResult(result, details)
      } catch (error) {
        logger.error('Error sending audit events to Firehose', { error })

        return {
          ...details,
          auditEventsFailedReingest: details.auditEvents
        }
      }
    })
  )

const handleFirehosePutRecordBatchResult = (
  result: PutRecordBatchOutput,
  s3ObjectDetails: S3ObjectDetails
) => {
  const auditEvents = s3ObjectDetails.auditEvents as AuditEvent[]

  if (result.FailedPutCount && result.FailedPutCount > 0) {
    logger.warn('Some audit events failed to reingest')

    return {
      ...s3ObjectDetails,
      auditEventsFailedReingest: getFailedAuditEventsFromBatchResult(
        result,
        auditEvents
      )
    }
  } else {
    logger.info('All audit events reingested successfully')

    return {
      ...s3ObjectDetails,
      auditEventsFailedReingest: []
    }
  }
}

const getFailedAuditEventsFromBatchResult = (
  result: PutRecordBatchOutput,
  auditEvents: AuditEvent[]
) =>
  (result.RequestResponses || []).reduce(
    (failedEvents: AuditEvent[], response, index) => {
      if (response.ErrorCode && auditEvents[index]) {
        failedEvents.push(auditEvents[index] as AuditEvent)
      }

      return failedEvents
    },
    []
  )
