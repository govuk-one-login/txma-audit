import { PutRecordBatchOutput } from '@aws-sdk/client-firehose'
import { firehosePutRecordBatch } from '../../../common/sharedServices/firehose/firehosePutRecordBatch'
import { logger } from '../../../common/sharedServices/logger'
import { AuditEvent } from '../../../common/types/auditEvent'
import { S3ObjectDetails } from '../../../common/types/s3ObjectDetails'
import { auditEventsToFirehoseRecords } from '../../../common/utils/helpers/firehose/auditEventsToFirehoseRecords'
import { getEnv } from '../../../common/utils/helpers/getEnv'

export const sendAuditEventsToFirehose = async (
  s3ObjectDetails: S3ObjectDetails[]
): Promise<S3ObjectDetails[]> =>
  Promise.all(s3ObjectDetails.map(sendAuditEventToFirehose))

const sendAuditEventToFirehose = async (s3ObjectDetails: S3ObjectDetails) => {
  const records = auditEventsToFirehoseRecords(
    s3ObjectDetails.auditEvents as AuditEvent[]
  )

  try {
    const result = await firehosePutRecordBatch(
      getEnv('FIREHOSE_DELIVERY_STREAM_NAME'),
      records
    )

    return handleFirehosePutRecordBatchResult(result, s3ObjectDetails)
  } catch (err) {
    logger.error('Failed to send audit events to Firehose', {
      bucket: s3ObjectDetails.bucket,
      key: s3ObjectDetails.key,
      error: {
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : undefined,
        stack: err instanceof Error ? err.stack : undefined
      }
    })

    return {
      ...s3ObjectDetails,
      auditEventsFailedReingest: s3ObjectDetails.auditEvents
    }
  }
}

const handleFirehosePutRecordBatchResult = (
  result: PutRecordBatchOutput,
  s3ObjectDetails: S3ObjectDetails
) => {
  const auditEvents = s3ObjectDetails.auditEvents as AuditEvent[]

  if (result.FailedPutCount && result.FailedPutCount > 0) {
    logger.warn('Some audit events failed to reingest', {
      bucket: s3ObjectDetails.bucket,
      key: s3ObjectDetails.key,
      failedCount: result.FailedPutCount
    })

    return {
      ...s3ObjectDetails,
      auditEventsFailedReingest: getFailedAuditEventsFromBatchResult(
        result,
        auditEvents
      )
    }
  } else {
    logger.info('All audit events reingested successfully', {
      bucket: s3ObjectDetails.bucket,
      key: s3ObjectDetails.key,
      count: auditEvents.length
    })

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
        failedEvents.push(auditEvents[index])
      }

      return failedEvents
    },
    []
  )
