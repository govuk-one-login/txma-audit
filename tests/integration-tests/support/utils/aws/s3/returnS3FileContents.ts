import { exponentialBackoff, pause, readableToString } from '../../helpers'
import { getLatestXObjectKeysFromS3 } from './getLatestXObjectKeys'
import { getS3ObjectAsStream } from './getS3Object'
import { createGunzip } from 'node:zlib'
import { AuditEvent } from '../../../types/auditEvent'

export const getAuditEvent = async (
  bucket: string,
  eventId: string,
  maxRetries = 20,
  retryCount = 0
): Promise<AuditEvent> => {
  const latestObjects = await getLatestXObjectKeysFromS3(bucket, 15)
  const foundAuditEvent = (
    await Promise.all(
      latestObjects.map(async (key) => {
        const input = { Bucket: bucket, Key: key }
        const fileStream = await getS3ObjectAsStream(input)
        const contentsString = await readableToString(
          fileStream.pipe(createGunzip())
        )
        // Files in the audit bucket can contain multiple events, separated by line breaks.
        // The file ends with a line break as well.
        // Each line is a chunk of JSON, so we split on line breaks and remove any empty entries from the array,
        // and parse each line as JSON, before returning the array of events
        return contentsString
          .split('\n')
          .filter((line) => line && line.length > 0)
          .map((line) => JSON.parse(line))
      })
    )
  )
    .flat()
    .find((event: AuditEvent) => event.event_id === eventId)

  if (foundAuditEvent) {
    return foundAuditEvent
  } else {
    retryCount++
    if (retryCount > maxRetries) {
      throw new Error('Could not find event in s3 bucket')
    } else {
      console.log(`Waiting for event data in bucket... ${retryCount} attempts`)
      await pause(exponentialBackoff(retryCount, 2))
      return await getAuditEvent(bucket, eventId, maxRetries, retryCount)
    }
  }
}
