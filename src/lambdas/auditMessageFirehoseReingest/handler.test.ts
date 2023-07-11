import { SQSEvent } from 'aws-lambda'
import { when } from 'jest-when'
import { mockLambdaContext } from '../../utils/tests/mockLambdaContext'
import { testS3TestEvent } from '../../utils/tests/testEvents/testS3SqsEvent'
import { deleteOrUpdateS3Objects } from './deleteOrUpdateS3Objects'
import { getAuditEvents } from './getAuditEvents'
import { handler } from './handler'
import { sendAuditEventsToFirehose } from './sendAuditEventsToFirehose'

jest.mock('./getAuditEvents', () => ({
  getAuditEvents: jest.fn()
}))

jest.mock('./sendAuditEventsToFirehose', () => ({
  sendAuditEventsToFirehose: jest.fn()
}))

jest.mock('./deleteOrUpdateS3Objects', () => ({
  deleteOrUpdateS3Objects: jest.fn()
}))

describe('handler', () => {
  const sqsEvent: SQSEvent = {
    Records: [
      {
        body: JSON.stringify({
          Records: [
            {
              s3: {
                bucket: {
                  name: 'mockBucket'
                },
                object: {
                  key: 'failures/your-object-key'
                }
              }
            }
          ]
        }),
        messageId: 'messageId1'
      }
    ]
  } as SQSEvent

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('successfully receives an SQS event, and returns an SQS Batch response', async () => {
    when(getAuditEvents).mockResolvedValue({
      successfulResults: [
        {
          auditEvents: [],
          bucket: 'mockBucket',
          key: 'failures/your-object-key',
          sqsRecordMessageId: 'messageId1'
        }
      ],
      failedIds: []
    })
    when(sendAuditEventsToFirehose).mockResolvedValue([
      {
        auditEvents: [],
        auditEventsFailedReingest: [],
        bucket: 'mockBucket',
        key: 'failures/your-object-key',
        sqsRecordMessageId: 'messageId1'
      }
    ])
    when(deleteOrUpdateS3Objects).mockResolvedValue([])

    const expectedResult = {
      batchItemFailures: []
    }

    const result = await handler(sqsEvent, mockLambdaContext)

    expect(result).toEqual(expectedResult)
    expect(getAuditEvents).toHaveBeenCalledWith([
      {
        bucket: 'mockBucket',
        key: 'failures/your-object-key',
        sqsRecordMessageId: 'messageId1'
      }
    ])
    expect(sendAuditEventsToFirehose).toHaveBeenCalledWith([
      {
        auditEvents: [],
        bucket: 'mockBucket',
        key: 'failures/your-object-key',
        sqsRecordMessageId: 'messageId1'
      }
    ])
    expect(deleteOrUpdateS3Objects).toHaveBeenCalledWith([
      {
        auditEvents: [],
        auditEventsFailedReingest: [],
        bucket: 'mockBucket',
        key: 'failures/your-object-key',
        sqsRecordMessageId: 'messageId1'
      }
    ])
  })

  it('handles partial failures', async () => {
    when(getAuditEvents).mockResolvedValue({
      successfulResults: [
        {
          auditEvents: [],
          bucket: 'mockBucket',
          key: 'failures/your-object-key',
          sqsRecordMessageId: 'messageId1'
        }
      ],
      failedIds: ['messageId2']
    })
    when(sendAuditEventsToFirehose).mockResolvedValue([
      {
        auditEvents: [],
        auditEventsFailedReingest: [],
        bucket: 'mockBucket',
        key: 'failures/your-object-key',
        sqsRecordMessageId: 'messageId1'
      }
    ])
    when(deleteOrUpdateS3Objects).mockResolvedValue([])

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
    when(getAuditEvents).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    when(sendAuditEventsToFirehose).mockResolvedValue([])
    when(deleteOrUpdateS3Objects).mockResolvedValue([])

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
                    name: 'mockBucket'
                  },
                  object: {
                    key: 'your-object-key'
                  }
                }
              }
            ]
          }),
          messageId: 'messageId1'
        }
      ]
    } as SQSEvent

    when(getAuditEvents).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    when(sendAuditEventsToFirehose).mockResolvedValue([])
    when(deleteOrUpdateS3Objects).mockResolvedValue([])

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
                    name: 'mockBucket'
                  }
                }
              }
            ]
          }),
          messageId: 'messageId1'
        }
      ]
    } as SQSEvent

    when(getAuditEvents).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    when(sendAuditEventsToFirehose).mockResolvedValue([])
    when(deleteOrUpdateS3Objects).mockResolvedValue([])

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
                    key: 'failures/your-object-key'
                  }
                }
              }
            ]
          }),
          messageId: 'messageId1'
        }
      ]
    } as SQSEvent

    when(getAuditEvents).mockResolvedValue({
      successfulResults: [],
      failedIds: []
    })
    when(sendAuditEventsToFirehose).mockResolvedValue([])
    when(deleteOrUpdateS3Objects).mockResolvedValue([])

    await handler(sqsEvent, mockLambdaContext)

    expect(getAuditEvents).toHaveBeenCalledWith([])
  })
})
