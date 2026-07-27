import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockLambdaContext } from '../../../common/utils/tests/mockLambdaContext'
import { encryptAuditData } from './encryptAuditData'
import {
  testS3TestEvent,
  testS3SqsEvent
} from '../../../common/utils/tests/testEvents/testS3SqsEvent'
import { handler } from './handler'

vi.mock('./encryptAuditData.ts', () => ({
  encryptAuditData: vi.fn()
}))

describe('InitiateCopyAndEncrypt', function () {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('handles s3 testEvents emitted when a new notification link is established', async () => {
    // Unit Test
    await handler(testS3TestEvent, mockLambdaContext)

    expect(encryptAuditData).not.toHaveBeenCalled()
  })

  it('calls encryptAuditData to encrypt the relevant data', async () => {
    // Unit Test
    const bucketName = 'myBucketName'
    const objectKey = 'myObjectKey'
    await handler(testS3SqsEvent(bucketName, objectKey), mockLambdaContext)
    expect(encryptAuditData).toHaveBeenCalledWith(bucketName, objectKey)
  })

  it('throws an error if there is no data in the SQS Event', async () => {
    // Unit Test
    await expect(handler({ Records: [] }, mockLambdaContext)).rejects.toThrow(
      'No data in event'
    )
    expect(encryptAuditData).not.toHaveBeenCalled()
  })

  it('throws an error when event has no s3 data in Records', async () => {
    // Unit Test
    const eventWithNoS3 = {
      Records: [
        {
          messageId: '',
          receiptHandle: '',
          body: JSON.stringify({ Records: [{ eventSource: 'aws:s3' }] }),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '',
            SenderId: '',
            ApproximateFirstReceiveTimestamp: ''
          },
          messageAttributes: {},
          md5OfBody: '',
          eventSource: '',
          eventSourceARN: '',
          awsRegion: ''
        }
      ]
    }

    await expect(handler(eventWithNoS3, mockLambdaContext)).rejects.toThrow(
      'No s3 data in event'
    )
    expect(encryptAuditData).not.toHaveBeenCalled()
  })

  it('defaults to empty string when bucket name is missing', async () => {
    // Unit Test
    const eventWithNoName = {
      Records: [
        {
          messageId: '',
          receiptHandle: '',
          body: JSON.stringify({
            Records: [{ s3: { bucket: {}, object: { key: 'someKey' } } }]
          }),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '',
            SenderId: '',
            ApproximateFirstReceiveTimestamp: ''
          },
          messageAttributes: {},
          md5OfBody: '',
          eventSource: '',
          eventSourceARN: '',
          awsRegion: ''
        }
      ]
    }

    await handler(eventWithNoName, mockLambdaContext)
    expect(encryptAuditData).toHaveBeenCalledWith('', 'someKey')
  })

  it('defaults to empty string when object key is missing', async () => {
    // Unit Test
    const eventWithNoKey = {
      Records: [
        {
          messageId: '',
          receiptHandle: '',
          body: JSON.stringify({
            Records: [{ s3: { bucket: { name: 'myBucket' }, object: {} } }]
          }),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '',
            SenderId: '',
            ApproximateFirstReceiveTimestamp: ''
          },
          messageAttributes: {},
          md5OfBody: '',
          eventSource: '',
          eventSourceARN: '',
          awsRegion: ''
        }
      ]
    }

    await handler(eventWithNoKey, mockLambdaContext)
    expect(encryptAuditData).toHaveBeenCalledWith('myBucket', '')
  })
})
