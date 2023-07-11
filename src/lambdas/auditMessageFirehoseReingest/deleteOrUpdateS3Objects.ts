import { constants, gzipSync } from 'node:zlib'
import { logger } from '../../services/logger'
import { deleteS3Object } from '../../services/s3/deleteS3Object'
import { putS3Object } from '../../services/s3/putS3Object'
import { AuditEvent } from '../../types/auditEvent'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { objectToBase64 } from '../../utils/helpers/objectToBase64'

export const deleteOrUpdateS3Objects = async (results: S3ObjectDetails[]) => {
  Promise.all(
    results.map(async (result) => {
      if (
        result.auditEventsFailedReingest &&
        result.auditEventsFailedReingest.length > 0
      ) {
        try {
          const fileContents = setFileContentsFromAuditEvents(
            result.auditEventsFailedReingest
          )

          await putS3Object(result.bucket, result.key, fileContents)

          logger.info('Updated s3 object with events that failed to reingest', {
            bucket: result.bucket,
            key: result.key
          })
        } catch (error) {
          logger.error(
            'Error updating s3 object, some events still require reingest',
            {
              bucket: result.bucket,
              key: result.key,
              error,
              failedEventIds: result.auditEventsFailedReingest.map(
                (event) => event.event_id
              )
            }
          )
        }
      } else {
        try {
          await deleteS3Object(result.bucket, result.key)

          logger.info('Deleted s3 object successfully', {
            bucket: result.bucket,
            key: result.key
          })
        } catch (error) {
          logger.error('Error deleting s3 object', {
            bucket: result.bucket,
            key: result.key,
            error
          })
        }
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
