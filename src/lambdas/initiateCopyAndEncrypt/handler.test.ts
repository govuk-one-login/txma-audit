import { encryptS3Object } from '../../services/kms/encryptS3Object'
import { getS3ObjectAsStream } from '../../services/s3/getS3ObjectAsStream'
import { putS3Object } from '../../services/s3/putS3Object'
import { mockLambdaContext } from '../../utils/tests/mockLambdaContext'
import { createDataStream } from '../../utils/tests/test-helpers/test-helper'
import {
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_DATA_STRING,
  TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
  TEST_S3_OBJECT_KEY,
  TEST_WRONG_S3_BUCKET,
  TEST_AUDIT_BUCKET_NAME
} from '../../utils/tests/testConstants'
import {
  testTemporaryS3SqsEvent,
  testAuditS3SqsEvent,
  wrongBucketTestS3SqsEvent,
  testS3TestEvent
} from '../../utils/tests/testEvents/testS3SqsEvent'
import { handler } from './handler'

jest.mock('../../services/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: jest.fn()
}))
jest.mock('../../services/s3/putS3Object', () => ({
  putS3Object: jest.fn()
}))
jest.mock('../../services/kms/encryptS3Object', () => ({
  encryptS3Object: jest.fn()
}))

const mockGetS3ObjectAsStream = getS3ObjectAsStream as jest.Mock
const mockPutS3Object = putS3Object as jest.Mock
const mockEncryptS3Object = encryptS3Object as jest.Mock

describe('InitiateCopyAndEncrypt', function () {
  beforeEach(() => {
    jest.resetAllMocks()

    process.env.TEMPORARY_BUCKET_NAME = TEST_TEMPORARY_BUCKET_NAME
    process.env.PERMANENT_BUCKET_NAME = TEST_PERMANENT_BUCKET_NAME
    process.env.AUDIT_BUCKET_NAME = TEST_AUDIT_BUCKET_NAME
  })

  it('handles s3 testEvents emitted when a new notification link is established', async () => {
    await handler(testS3TestEvent, mockLambdaContext)

    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
    expect(mockEncryptS3Object).not.toHaveBeenCalled()
    expect(mockPutS3Object).not.toHaveBeenCalled()
  })

  it('retrieves and copies an S3 object from the temporary bucket', async () => {
    const s3ObjectStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)
    mockGetS3ObjectAsStream.mockResolvedValue(s3ObjectStream)
    mockEncryptS3Object.mockResolvedValue(TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER)

    await handler(testTemporaryS3SqsEvent, mockLambdaContext)

    expect(mockGetS3ObjectAsStream).toHaveBeenCalledWith(
      TEST_TEMPORARY_BUCKET_NAME,
      TEST_S3_OBJECT_KEY
    )
    expect(mockEncryptS3Object).toHaveBeenCalledWith(s3ObjectStream)
    expect(mockPutS3Object).toHaveBeenCalledWith(
      TEST_PERMANENT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY,
      TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER
    )
  })

  it('retrieves and copies an S3 object from the audit bucket', async () => {
    const s3ObjectStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)
    mockGetS3ObjectAsStream.mockResolvedValue(s3ObjectStream)
    mockEncryptS3Object.mockResolvedValue(TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER)

    await handler(testAuditS3SqsEvent, mockLambdaContext)

    expect(mockGetS3ObjectAsStream).toHaveBeenCalledWith(
      TEST_AUDIT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY
    )
    expect(mockEncryptS3Object).toHaveBeenCalledWith(s3ObjectStream)
    expect(mockPutS3Object).toHaveBeenCalledWith(
      TEST_PERMANENT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY,
      TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER
    )
  })

  it('throws an error if there is no data in the SQS Event', async () => {
    expect(handler({ Records: [] }, mockLambdaContext)).rejects.toThrow(
      'No data in event'
    )
    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
    expect(mockPutS3Object).not.toHaveBeenCalled()
  })

  it('throws an error if the SQS event comes from the wrong S3 bucket', async () => {
    expect(
      handler(wrongBucketTestS3SqsEvent, mockLambdaContext)
    ).rejects.toThrow(`Incorrect source bucket - ${TEST_WRONG_S3_BUCKET}`)
    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
    expect(mockPutS3Object).not.toHaveBeenCalled()
  })
})
