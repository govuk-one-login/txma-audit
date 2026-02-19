import { describe, it, expect, vi } from 'vitest'
import { getAuditEvents } from './getAuditEvents'
import { getAuditEventsFromS3Object } from './getAuditEventsFromS3Object'

vi.mock('./getAuditEventsFromS3Object', () => ({
  getAuditEventsFromS3Object: vi.fn()
}))

describe('getAuditEvents', () => {
  const mockBucketName = 'mockBucket'
  const mockfailuresKey1 = 'failures/mockKey1'
  const mockfailuresKey2 = 'failures/mockKey2'
  const mockMessageId1 = 'mockMessageId1'
  const mockMessageId2 = 'mockMessageId2'

  const s3ObjectDetails = [
    {
      bucket: mockBucketName,
      key: 'failures/mockKey1',
      sqsRecordMessageId: mockMessageId1
    },
    {
      bucket: mockBucketName,
      key: 'failures/mockKey2',
      sqsRecordMessageId: mockMessageId2
    }
  ]
  const auditEvents = [
    {
      event_name: 'MOCK_EVENT_NAME',
      timestamp: 12345678
    }
  ]

  it('returns the audit events from the provided s3 objects', async () => {
    ;(getAuditEventsFromS3Object as any).mockResolvedValue(auditEvents)

    const expectedResult = {
      successfulResults: [
        {
          auditEvents,
          bucket: mockBucketName,
          key: mockfailuresKey1,
          sqsRecordMessageId: mockMessageId1
        },
        {
          auditEvents,
          bucket: mockBucketName,
          key: mockfailuresKey2,
          sqsRecordMessageId: mockMessageId2
        }
      ],
      failedIds: []
    }

    const result = await getAuditEvents(s3ObjectDetails)

    expect(result).toEqual(expectedResult)
  })

  it('returns the failed ids when the audit events cannot be retrieved', async () => {
    ;(getAuditEventsFromS3Object as any).mockRejectedValue(
      new Error('mockError')
    )

    const expectedResult = {
      successfulResults: [],
      failedIds: [mockMessageId1, mockMessageId2]
    }

    const result = await getAuditEvents(s3ObjectDetails)

    expect(result).toEqual(expectedResult)
  })
})
