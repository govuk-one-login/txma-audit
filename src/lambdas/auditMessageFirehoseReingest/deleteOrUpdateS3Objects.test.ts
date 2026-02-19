import { describe, it, expect, beforeEach, vi } from 'vitest'
import { deleteS3Object } from '../../../common/sharedServices/s3/deleteS3Object'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { S3ObjectDetails } from '../../../common/types/s3ObjectDetails'
import { deleteOrUpdateS3Objects } from './deleteOrUpdateS3Objects'

vi.mock('../../../common/sharedServices/s3/deleteS3Object', () => ({
  deleteS3Object: vi.fn()
}))

vi.mock('../../../common/sharedServices/s3/putS3Object', () => ({
  putS3Object: vi.fn()
}))

describe('deleteOrUpdateS3Objects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const bucket = 'mockBucket'

  it('should delete s3 objects that have no failed events', async () => {
    ;(deleteS3Object as any).mockResolvedValue()

    const results: S3ObjectDetails[] = [
      {
        auditEventsFailedReingest: [],
        auditEvents: [],
        bucket,
        key: 'mockKey1',
        sqsRecordMessageId: 'mockMessageId1'
      },
      {
        auditEventsFailedReingest: [],
        auditEvents: [],
        bucket,
        key: 'mockKey2',
        sqsRecordMessageId: 'mockMessageId2'
      }
    ]

    await deleteOrUpdateS3Objects(results)

    expect(deleteS3Object).toHaveBeenCalledWith(bucket, 'mockKey1')
    expect(deleteS3Object).toHaveBeenCalledWith(bucket, 'mockKey2')
    expect(putS3Object).not.toHaveBeenCalled()
  })

  it('should update s3 objects that have failed events', async () => {
    ;(putS3Object as any).mockResolvedValue()

    const results: S3ObjectDetails[] = [
      {
        auditEvents: [],
        auditEventsFailedReingest: [
          {
            event_id: 'mockEventId1',
            event_name: 'mockEventName1',
            timestamp: 12345678
          }
        ],
        bucket,
        key: 'mockKey1',
        sqsRecordMessageId: 'mockMessageId1'
      },
      {
        auditEvents: [],
        auditEventsFailedReingest: [
          {
            event_id: 'mockEventId2',
            event_name: 'mockEventName2',
            timestamp: 12345678
          }
        ],
        bucket,
        key: 'mockKey2',
        sqsRecordMessageId: 'mockMessageId2'
      }
    ]

    await deleteOrUpdateS3Objects(results)

    expect(putS3Object).toHaveBeenCalledWith(
      bucket,
      'mockKey1',
      expect.any(Buffer)
    )
    expect(putS3Object).toHaveBeenCalledWith(
      bucket,
      'mockKey2',
      expect.any(Buffer)
    )
    expect(deleteS3Object).not.toHaveBeenCalled()
  })
})
