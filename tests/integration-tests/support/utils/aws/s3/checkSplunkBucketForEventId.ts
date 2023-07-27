import { exponentialBackoff, pause, readableToString } from '../../helpers'
import { getLatestXObjectKeysFromS3 } from './getLatestXObjectKeys'
import { getS3ObjectAsStream } from './getS3Object'
import { createGunzip } from 'node:zlib'

export const checkSplunkBucketForEventId = async (
  bucket: string,
  eventId: string,
  maxRetries = 20,
  retryCount = 0
): Promise<boolean> => {
  const latestObjectKeys = await getLatestXObjectKeysFromS3(bucket, 30)
  const fileContents = await Promise.all(
    latestObjectKeys.map(async (key) => {
      const input = {
        Bucket: bucket,
        Key: key
      }
      const fileStream = await getS3ObjectAsStream(input)
      return await readableToString(fileStream.pipe(createGunzip()))
    })
  )

  const eventIdPresent = fileContents.some((contents) =>
    contents.includes(eventId)
  )

  if (eventIdPresent) {
    return true
  } else {
    retryCount++
    if (retryCount > maxRetries) {
      console.log(
        `Failed to find event with id ${eventId} in bucket ${bucket} after ${retryCount} attempts`
      )
      return false
    } else {
      await pause(exponentialBackoff(retryCount, 2))
      return await checkSplunkBucketForEventId(
        bucket,
        eventId,
        maxRetries,
        retryCount
      )
    }
  }
}
