import { when } from 'jest-when'
import { firehosePutRecordBatch } from '../../services/firehose/firehosePutRecordBatch'
import { S3ObjectDetails } from '../../types/s3ObjectDetails'
import { auditEventsToFirehoseRecords } from '../../utils/helpers/firehose/auditEventsToFirehoseRecords'
import { sendAuditEventsToFirehose } from './sendAuditEventsToFirehose'

process.env.FIREHOSE_DELIVERY_STREAM_NAME = 'mockDeliveryStreamName'

jest.mock('../../services/firehose/firehosePutRecordBatch.ts', () => ({
  firehosePutRecordBatch: jest.fn()
}))

jest.mock(
  '../../utils/helpers/firehose/auditEventsToFirehoseRecords.ts',
  () => ({
    auditEventsToFirehoseRecords: jest.fn()
  })
)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('sendAuditEventsToFirehose', () => {
  const mockDeliveryStreamName = 'mockDeliveryStreamName'
  const mockFirehoseRecords = [
    {
      Data: Buffer.from('mockData1')
    },
    {
      Data: Buffer.from('mockData2')
    }
  ]

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
    },
    {
      auditEvents: [
        {
          event_name: 'MOCK_EVENT_NAME_3',
          timestamp: 12345678
        },
        {
          event_name: 'MOCK_EVENT_NAME_4',
          timestamp: 12345678
        }
      ],
      bucket: 'mockBucket',
      key: 'failures/mockKey2',
      sqsRecordMessageId: 'mockMessageId2'
    }
  ]

  it('should successfully send a batch of audit events to a Firehose stream', async () => {
    when(firehosePutRecordBatch).mockResolvedValue({
      FailedPutCount: 0,
      RequestResponses: [],
      $metadata: {}
    })
    when(auditEventsToFirehoseRecords).mockReturnValue(mockFirehoseRecords)

    const result = await sendAuditEventsToFirehose(mockS3ObjectDetailsArray)

    expect(result).toEqual(
      mockS3ObjectDetailsArray.map((s3ObjectDetails) => ({
        ...s3ObjectDetails,
        auditEventsFailedReingest: []
      }))
    )
    expect(firehosePutRecordBatch).toHaveBeenCalledTimes(2)
    expect(firehosePutRecordBatch).toHaveBeenCalledWith(
      mockDeliveryStreamName,
      mockFirehoseRecords
    )
  })

  it('should return all audit events in the auditEventsFailedReingest array when the Firehose PutBatch throws an error', async () => {
    when(firehosePutRecordBatch).mockRejectedValue(new Error('mockError'))
    when(auditEventsToFirehoseRecords).mockReturnValue(mockFirehoseRecords)

    const result = await sendAuditEventsToFirehose(mockS3ObjectDetailsArray)

    expect(result).toEqual(
      mockS3ObjectDetailsArray.map((s3ObjectDetails) => ({
        ...s3ObjectDetails,
        auditEventsFailedReingest: s3ObjectDetails.auditEvents
      }))
    )
    expect(firehosePutRecordBatch).toHaveBeenCalledTimes(2)
    expect(firehosePutRecordBatch).toHaveBeenCalledWith(
      mockDeliveryStreamName,
      mockFirehoseRecords
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
    when(auditEventsToFirehoseRecords).mockReturnValue(mockFirehoseRecords)

    const expectedResult = mockS3ObjectDetailsArray
    expectedResult[0].auditEventsFailedReingest = [
      {
        event_name: 'MOCK_EVENT_NAME_1',
        timestamp: 12345678
      }
    ]
    expectedResult[1].auditEventsFailedReingest = [
      {
        event_name: 'MOCK_EVENT_NAME_3',
        timestamp: 12345678
      }
    ]

    const result = await sendAuditEventsToFirehose(mockS3ObjectDetailsArray)

    expect(result).toEqual(expectedResult)
    expect(firehosePutRecordBatch).toHaveBeenCalledTimes(2)
    expect(firehosePutRecordBatch).toHaveBeenCalledWith(
      mockDeliveryStreamName,
      mockFirehoseRecords
    )
  })
})
