import { Readable } from 'node:stream'
import { constants, createGunzip } from 'node:zlib'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { AuditEvent } from '../../../common/types/auditEvent'
import { base64ToObject } from '../../../common/utils/helpers/base64ToObject'
import { readableToString } from '../../../common/utils/helpers/readableToString'

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
    .map((line) => (JSON.parse(line) as { rawData: string }).rawData)

  return base64AuditEvents.map(
    (base64AuditEvent) => base64ToObject(base64AuditEvent) as AuditEvent
  )
}
