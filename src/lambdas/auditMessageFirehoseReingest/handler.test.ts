import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SQSEvent } from 'aws-lambda'
import { mockLambdaContext } from '../../../common/utils/tests/mockLambdaContext'
import { testS3TestEvent } from '../../../common/utils/tests/testEvents/testS3SqsEvent'
import { deleteOrUpdateS3Objects } from './deleteOrUpdateS3Objects'
import { getAuditEvents } from './getAuditEvents'
import { handler } from './handler'
import { sendAuditEventsToFirehose } from './sendAuditEventsToFirehose'

vi.mock('./getAuditEvents', () => ({
  getAuditEvents: vi.fn()
}))

vi.mock('./sendAuditEventsToFirehose', () => ({
  sendAuditEventsToFirehose: vi.fn()
}))

vi.mock('./deleteOrUpdateS3Objects', () => ({
  deleteOrUpdateS3Objects: vi.fn()
}))

describe('handler', () => {
  const mockFailuresS3ObjectKey = 'failures/your-object-key'
  const mockBucketName = 'mockBucket'
  const mockMessageId = 'mockMessageId'
  const sqsEvent: SQSEvent = {
    Records: [
      {
        body: JSON.stringify({
          Records: [
            {
              s3: {
                bucket: {
                  name: mockBucketName
                },
                object: {
                  key: mockFailuresS3ObjectKey
                }
              }
            }
          ]
        }),
        messageId: mockMessageId
      }
    ]
  } as SQSEvent

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully receives an SQS event, and returns an SQS Batch response', async () => {
    ;(getAuditEvents as any).mockResolvedValue({
      successfulResults: [
        {
          auditEvents: [],
          bucket: mockBucketName,
          key: mockFailuresS3ObjectKey,
          sqsRecordMessageId: mockMessageId
        }
      ],
      failedIds: []
    })
    ;(sendAuditEventsToFirehose as any).mockResolvedValue([
      {
        auditEvents: [],
        auditEventsFailedReingest: [],
        bucket: mockBucketName,
        key: mockFailuresS3ObjectKey,
        sqsRecordMessageId: mockMessageId
      }
    ])
    ;(deleteOrUpdateS3Objects as any).mockResolvedValue([])

    const expectedResult = {
      batchItemFailures: []
    }

    const result = await handler(sqsEvent, mockLambdaContext)

    expect(result).toEqual(expectedResult)
    expect(getAuditEvents).toHaveBeenCalledWith([
      {
        bucket: mockBucketName,
        key: mockFailuresS3ObjectKey,
        sqsRecordMessageId: mockMessageId
      }
    ])
    expect(sendAuditEventsToFirehose).toHaveBeenCalledWith([
      {
        auditEvents: [],
        bucket: mockBucketName,
        key: mockFailuresS3ObjectKey,
        sqsRecordMessageId: mockMessageId
      }
    ])
    expect(deleteOrUpdateS3Objects).toHaveBeenCalledWith([
      {
        auditEvents: [],
        auditEventsFailedReingest: [],
        bucket: mockBucketName,
        key: mockFailuresS3ObjectKey,
        sqsRecordMessageId: mockMessageId
      }
    ])
  })

  it('handles partial failures', async () => {
    ;(getAuditEvents as any).mockResolvedValue({
      successfulResults: [
        {
          auditEvents: [],
          bucket: mockBucketName,
          key: mockFailuresS3ObjectKey,
          sqsRecordMessageId: mockMessageId
        }
      ],
      failedIds: ['messageId2']
    })
    ;(sendAuditEventsToFirehose as any).mockResolvedValue([
      {
        auditEvents: [],
        auditEventsFailedReingest: [],
        bucket: mockBucketName,
        key: mockFailuresS3ObjectKey,
        sqsRecordMessageId: mockMessageId
      }
    ])
    ;(deleteOrUpdateS3Objects as any).mockResolvedValue([])

    const expectedResult = {
      batchItemFailures: [
        {
          itemIdentifier: 'messageId2'
        }
      ]
    }

    const result = await handler(sqsEvent, mockLambdaContext)

    expect(result).toEqual(expectedResult)
  })

  it('ignores s3 test events', async () => {
    ;(getAuditEvents as any).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    ;(sendAuditEventsToFirehose as any).mockResolvedValue([])
    ;(deleteOrUpdateS3Objects as any).mockResolvedValue([])

    await handler(testS3TestEvent, mockLambdaContext)

    expect(getAuditEvents).toHaveBeenCalledWith([])
  })

  it('ignores events from objects without failures/ prefix', async () => {
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            Records: [
              {
                s3: {
                  bucket: {
                    name: mockBucketName
                  },
                  object: {
                    key: 'your-object-key'
                  }
                }
              }
            ]
          }),
          messageId: mockMessageId
        }
      ]
    } as SQSEvent

    ;(getAuditEvents as any).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    ;(sendAuditEventsToFirehose as any).mockResolvedValue([])
    ;(deleteOrUpdateS3Objects as any).mockResolvedValue([])

    await handler(sqsEvent, mockLambdaContext)

    expect(getAuditEvents).toHaveBeenCalledWith([])
  })

  it('ignores events without s3 object key', async () => {
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            Records: [
              {
                s3: {
                  bucket: {
                    name: mockBucketName
                  }
                }
              }
            ]
          }),
          messageId: mockMessageId
        }
      ]
    } as SQSEvent

    ;(getAuditEvents as any).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    ;(sendAuditEventsToFirehose as any).mockResolvedValue([])
    ;(deleteOrUpdateS3Objects as any).mockResolvedValue([])

    await handler(sqsEvent, mockLambdaContext)

    expect(getAuditEvents).toHaveBeenCalledWith([])
  })

  it('ignores events without s3 bucket name', async () => {
    const sqsEvent: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            Records: [
              {
                s3: {
                  object: {
                    key: mockFailuresS3ObjectKey
                  }
                }
              }
            ]
          }),
          messageId: mockMessageId
        }
      ]
    } as SQSEvent

    ;(getAuditEvents as any).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    ;(sendAuditEventsToFirehose as any).mockResolvedValue([])
    ;(deleteOrUpdateS3Objects as any).mockResolvedValue([])

    await handler(sqsEvent, mockLambdaContext)

    expect(getAuditEvents).toHaveBeenCalledWith([])
  })
})
