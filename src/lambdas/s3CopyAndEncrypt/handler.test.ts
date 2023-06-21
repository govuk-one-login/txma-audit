import { mockLambdaContext } from '../../utils/tests/mockLambdaContext'
import { encryptAuditData } from '../../sharedServices/encryptAuditData'
import {
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_PERMANENT_BUCKET_NAME,
  TEST_AUDIT_BUCKET_NAME
} from '../../utils/tests/testConstants'
import {
  testS3TestEvent,
  testS3SqsEvent
} from '../../utils/tests/testEvents/testS3SqsEvent'
import { handler } from './handler'

jest.mock('../../sharedServices/encryptAuditData.ts', () => ({
  encryptAuditData: jest.fn()
}))

describe('InitiateCopyAndEncrypt', function () {
  beforeEach(() => {
    jest.resetAllMocks()

    process.env.TEMPORARY_BUCKET_NAME = TEST_TEMPORARY_BUCKET_NAME
    process.env.PERMANENT_BUCKET_NAME = TEST_PERMANENT_BUCKET_NAME
    process.env.AUDIT_BUCKET_NAME = TEST_AUDIT_BUCKET_NAME
  })

  it('handles s3 testEvents emitted when a new notification link is established', async () => {
    await handler(testS3TestEvent, mockLambdaContext)

    expect(encryptAuditData).not.toHaveBeenCalled()
  })

  it('calls encryptAuditData to encrypt the relevant data', async () => {
    const bucketName = 'myBucketName'
    const objectKey = 'myObjectKey'
    await handler(testS3SqsEvent(bucketName, objectKey), mockLambdaContext)
    expect(encryptAuditData).toHaveBeenCalledWith(bucketName, objectKey)
  })

  it('throws an error if there is no data in the SQS Event', async () => {
    expect(handler({ Records: [] }, mockLambdaContext)).rejects.toThrow(
      'No data in event'
    )
    expect(encryptAuditData).not.toHaveBeenCalled()
  })
})