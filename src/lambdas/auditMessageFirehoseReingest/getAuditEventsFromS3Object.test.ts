import { describe, it, expect, vi } from 'vitest'
import { Readable, Writable } from 'node:stream'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { AuditEvent } from '../../../common/types/auditEvent'
import { objectToBase64 } from '../../../common/utils/helpers/objectToBase64'
import { readableToString } from '../../../common/utils/helpers/readableToString'
import { getAuditEventsFromS3Object } from './getAuditEventsFromS3Object'

vi.mock('../../../common/sharedServices/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: vi.fn()
}))

vi.mock('../../../common/utils/helpers/readableToString', () => ({
  readableToString: vi.fn()
}))

vi.mock('node:zlib', () => ({
  constants: vi.fn(),
  createGunzip: vi.fn().mockImplementation(() => {
    const writable = new Writable()
    writable._write = vi.fn()

    return writable
  })
}))

describe('getAuditEventsFromS3Object', () => {
  it('returns the audit events from the S3 object', async () => {
    const bucketName = 'bucketName'
    const key = 'key'
    const auditEvents: AuditEvent[] = [
      {
        event_name: 'event1',
        timestamp: 12345678,
        user: {
          user_id: 'user1'
        }
      },
      {
        event_name: 'event2',
        timestamp: 12345678,
        user: {
          user_id: 'user2'
        },
        extensions: {
          application: {
            name: 'application1',
            test: {
              test: {
                test1: 'test'
              },
              test2: 'test2',
              test3: [{ test: 'test' }, { test: 'test' }]
            }
          }
        }
      }
    ]

    const fileContents = auditEvents
      .map((event) => JSON.stringify({ rawData: objectToBase64(event) }))
      .join('\n')

    const readable = new Readable()
    readable.push(fileContents)
    readable.push(null)
    ;(getS3ObjectAsStream as any).mockResolvedValue(readable)
    ;(readableToString as any).mockResolvedValue(fileContents)

    const result = await getAuditEventsFromS3Object(bucketName, key)
    expect(result).toEqual(auditEvents)
  })
})
