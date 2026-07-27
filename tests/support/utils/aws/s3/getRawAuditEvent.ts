import { exponentialBackoff, pause, readableToString } from '../../helpers'
import { getLatestXObjectKeysFromS3 } from './getLatestXObjectKeys'
import { getS3ObjectAsStream } from './getS3Object'
import { createGunzip } from 'node:zlib'

export const getRawAuditEvent = async (
  bucket: string,
  payload: string,
  maxRetries = 20,
  retryCount = 0
): Promise<string | undefined> => {
  const latestObjects = await getLatestXObjectKeysFromS3(bucket, 15)
  const foundEvent = (
    await Promise.all(
      latestObjects.map(async (key) => {
        const input = { Bucket: bucket, Key: key }
        const fileStream = await getS3ObjectAsStream(input)
        const contentsString = await readableToString(
          fileStream.pipe(createGunzip())
        )
        return contentsString
          .split('\n')
          .filter((line) => line && line.length > 0)
          .find((line) => line.includes(payload))
      })
    )
  ).find(Boolean)

  if (foundEvent) {
    return foundEvent
  } else {
    retryCount++
    if (retryCount > maxRetries) {
      throw new Error('Could not find raw event in s3 bucket')
    } else {
      console.log(`Waiting for event data in bucket... ${retryCount} attempts`)
      await pause(exponentialBackoff(retryCount, 2))
      return await getRawAuditEvent(bucket, payload, maxRetries, retryCount)
    }
  }
}
