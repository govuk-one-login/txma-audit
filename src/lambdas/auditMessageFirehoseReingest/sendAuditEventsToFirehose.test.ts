import { when } from 'jest-when'
import { firehosePutRecordBatch } from '../../services/firehose/firehosePutRecordBatch'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { sendAuditEventsToFirehose } from './sendAuditEventsToFirehose'

process.env.FIREHOSE_DELIVERY_STREAM_NAME = 'mockDeliveryStreamName'

jest.mock('../../services/firehose/firehosePutRecordBatch.ts', () => ({
  firehosePutRecordBatch: jest.fn()
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('sendAuditEventsToFirehose', () => {
  const mockS3ObjectDetailsArray: S3ObjectDetails[] = [
    {
      auditEvents: [
        {
          event_name: 'MOCK_EVENT_NAME_1',
          timestamp: 12345678
        },
        {
          event_name: 'MOCK_EVENT_NAME_2',
          timestamp: 12345678
        }
      ],
      bucket: 'mockBucket',
      key: 'failures/mockKey1',
      sqsRecordMessageId: 'mockMessageId1'
    }
  ]

  it('should successfully send a batch of audit events to a Firehose stream', async () => {
    when(firehosePutRecordBatch).mockResolvedValue({
      FailedPutCount: 0,
      RequestResponses: [],
      $metadata: {}
    })

    const result = await sendAuditEventsToFirehose(mockS3ObjectDetailsArray)

    expect(result).toEqual(
      mockS3ObjectDetailsArray.map((s3ObjectDetails) => ({
        ...s3ObjectDetails,
        auditEventsFailedReingest: []
      }))
    )
  })

  it('should return all audit events in the auditEventsFailedReingest array when the Firehose PutBatch throws an error', async () => {
    when(firehosePutRecordBatch).mockRejectedValue(new Error('mockError'))

    const result = await sendAuditEventsToFirehose(mockS3ObjectDetailsArray)

    expect(result).toEqual(
      mockS3ObjectDetailsArray.map((s3ObjectDetails) => ({
        ...s3ObjectDetails,
        auditEventsFailedReingest: s3ObjectDetails.auditEvents
      }))
    )
  })

  it('should return failed events in the auditEventsFailedReingest array when the Firehose PutBatch returns a partial success response', async () => {
    when(firehosePutRecordBatch).mockResolvedValue({
      FailedPutCount: 1,
      RequestResponses: [
        {
          ErrorCode: 'mockErrorCode',
          ErrorMessage: 'mockErrorMessage'
        },
        {
          RecordId: 'mockRecordId'
        }
      ],
      $metadata: {}
    })

    const result = await sendAuditEventsToFirehose(mockS3ObjectDetailsArray)

    expect(result).toEqual(
      mockS3ObjectDetailsArray.map((s3ObjectDetails) => ({
        ...s3ObjectDetails,
        auditEventsFailedReingest: [
          {
            event_name: 'MOCK_EVENT_NAME_1',
            timestamp: 12345678
          }
        ]
      }))
    )
  })
})
