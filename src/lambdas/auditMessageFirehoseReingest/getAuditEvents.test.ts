import { when } from 'jest-when'
import { getAuditEvents } from './getAuditEvents'
import { getAuditEventsFromS3Object } from './getAuditEventsFromS3Object'

jest.mock('./getAuditEventsFromS3Object', () => ({
  getAuditEventsFromS3Object: jest.fn()
}))

describe('getAuditEvents', () => {
  const s3ObjectDetails = [
    {
      bucket: 'mockBucket',
      key: 'failures/mockKey1',
      sqsRecordMessageId: 'mockMessageId1'
    },
    {
      bucket: 'mockBucket',
      key: 'failures/mockKey2',
      sqsRecordMessageId: 'mockMessageId2'
    }
  ]
  const auditEvents = [
    {
      event_name: 'MOCK_EVENT_NAME',
      timestamp: 12345678
    }
  ]

  it('returns the audit events from the provided s3 objects', async () => {
    when(getAuditEventsFromS3Object).mockResolvedValue(auditEvents)

    const expectedResult = {
      successfulResults: [
        {
          auditEvents,
          bucket: 'mockBucket',
          key: 'failures/mockKey1',
          sqsRecordMessageId: 'mockMessageId1'
        },
        {
          auditEvents,
          bucket: 'mockBucket',
          key: 'failures/mockKey2',
          sqsRecordMessageId: 'mockMessageId2'
        }
      ],
      failedIds: []
    }

    const result = await getAuditEvents(s3ObjectDetails)

    expect(result).toEqual(expectedResult)
  })

  it('returns the failed ids when the audit events cannot be retrieved', async () => {
    when(getAuditEventsFromS3Object).mockRejectedValue(new Error('mockError'))

    const expectedResult = {
      successfulResults: [],
      failedIds: ['mockMessageId1', 'mockMessageId2']
    }

    const result = await getAuditEvents(s3ObjectDetails)

    expect(result).toEqual(expectedResult)
  })
})
