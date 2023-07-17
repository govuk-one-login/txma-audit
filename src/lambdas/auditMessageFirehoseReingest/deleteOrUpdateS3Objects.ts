import { constants, gzipSync } from 'node:zlib'
import { logger } from '../../services/logger'
import { deleteS3Object } from '../../services/s3/deleteS3Object'
import { putS3Object } from '../../services/s3/putS3Object'
import { AuditEvent } from '../../types/auditEvent'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { objectToBase64 } from '../../utils/helpers/objectToBase64'

export const deleteOrUpdateS3Objects = async (results: S3ObjectDetails[]) => {
  return Promise.all(
    results.map(async (result) => {
      if (
        result.auditEventsFailedReingest &&
        result.auditEventsFailedReingest.length > 0
      ) {
        await updateFailedProcessingS3Object(
          result.auditEventsFailedReingest,
          result.bucket,
          result.key
        )
      } else {
        await deleteFailedProcessingS3Object(result.bucket, result.key)
      }
    })
  )
}

const setFileContentsFromAuditEvents = (events: AuditEvent[]): Buffer => {
  const fileContents = JSON.stringify({
    rawData: objectToBase64(events)
  })

  return gzipSync(Buffer.from(fileContents), { flush: constants.Z_SYNC_FLUSH })
}

const updateFailedProcessingS3Object = async (
  events: AuditEvent[],
  bucket: string,
  key: string
): Promise<void> => {
  try {
    const fileContents = setFileContentsFromAuditEvents(events)

    await putS3Object(bucket, key, fileContents)

    logger.info('Updated s3 object with events that failed to reingest', {
      bucket: bucket,
      key: key
    })
  } catch (error) {
    logger.error(
      'Error updating s3 object, some events still require reingest',
      {
        bucket: bucket,
        key: key,
        error,
        failedEventIds: events.map((event) => event.event_id)
      }
    )
  }
}

const deleteFailedProcessingS3Object = async (bucket: string, key: string) => {
  try {
    await deleteS3Object(bucket, key)

    logger.info('Deleted s3 object successfully', {
      bucket: bucket,
      key: key
    })
  } catch (error) {
    logger.error('Error deleting s3 object', {
      bucket: bucket,
      key: key,
      error
    })
  }
}
