import { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'
import { getS3ObjectAsStream } from '../../services/s3/getS3ObjectAsStream'
import { AuditEvent } from '../../types/auditEvent'
import { base64ToObject } from '../../utils/helpers/base64ToObject'
import { readableToString } from '../../utils/helpers/readableToString'

export const getAuditEventsFromS3Object = async (
  bucketName: string,
  key: string
) => {
  const contents = await getS3ObjectAsStream(bucketName, key)

  return await getAuditEvents(contents)
}

const getAuditEvents = async (contents: Readable): Promise<AuditEvent[]> => {
  const jsonString = await readableToString(contents.pipe(createGunzip()))

  const base64AuditEvents: string[] = jsonString
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line).rawData)

  return base64AuditEvents.map(
    (base64AuditEvent) => base64ToObject(base64AuditEvent) as AuditEvent
  )
}
