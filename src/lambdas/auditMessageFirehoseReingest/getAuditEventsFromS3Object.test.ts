import { when } from 'jest-when'
import { Readable, Writable } from 'node:stream'
import { getS3ObjectAsStream } from '../../sharedServices/s3/getS3ObjectAsStream'
import { AuditEvent } from '../../types/auditEvent'
import { objectToBase64 } from '../../utils/helpers/objectToBase64'
import { readableToString } from '../../utils/helpers/readableToString'
import { getAuditEventsFromS3Object } from './getAuditEventsFromS3Object'

jest.mock('../../sharedServices/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: jest.fn()
}))

jest.mock('../../utils/helpers/readableToString', () => ({
  readableToString: jest.fn()
}))

jest.mock('node:zlib', () => ({
  constants: jest.fn(),
  createGunzip: jest.fn().mockImplementation(() => {
    const writable = new Writable()
    writable._write = jest.fn()

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

    when(getS3ObjectAsStream).mockResolvedValue(readable)
    when(readableToString).mockResolvedValue(fileContents)

    const result = await getAuditEventsFromS3Object(bucketName, key)
    expect(result).toEqual(auditEvents)
  })
})
