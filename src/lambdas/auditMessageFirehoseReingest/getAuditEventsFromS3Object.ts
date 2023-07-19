import { Readable } from 'node:stream'
import { constants, createGunzip } from 'node:zlib'
import { getS3ObjectAsStream } from '../../sharedServices/s3/getS3ObjectAsStream'
import { AuditEvent } from '../../types/auditEvent'
import { base64ToObject } from '../../utils/helpers/base64ToObject'
import { readableToString } from '../../utils/helpers/readableToString'

export const getAuditEventsFromS3Object = async (
  bucketName: string,
  key: string
): Promise<AuditEvent[]> => {
  const contents = await getS3ObjectAsStream(bucketName, key)

  return getAuditEvents(contents)
}

const getAuditEvents = async (contents: Readable): Promise<AuditEvent[]> => {
  const jsonString = await readableToString(
    contents.pipe(createGunzip({ flush: constants.Z_SYNC_FLUSH }))
  )

  const base64AuditEvents: string[] = jsonString
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line).rawData)

  return base64AuditEvents.map(
    (base64AuditEvent) => base64ToObject(base64AuditEvent) as AuditEvent
  )
}
