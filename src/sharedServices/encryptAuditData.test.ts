import { encryptS3Object } from '../services/kms/encryptS3Object'
import { getS3ObjectAsStream } from '../services/s3/getS3ObjectAsStream'
import { putS3Object } from '../services/s3/putS3Object'
import { encryptAuditData } from './encryptAuditData'
import { createDataStream } from '../utils/tests/test-helpers/test-helper'
import {
  TEST_AUDIT_BUCKET_NAME,
  TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_DATA_STRING,
  TEST_S3_OBJECT_KEY,
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_WRONG_S3_BUCKET
} from '../utils/tests/testConstants'
import { when } from 'jest-when'

jest.mock('../services/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: jest.fn()
}))

jest.mock('../services/s3/putS3Object', () => ({
  putS3Object: jest.fn()
}))

jest.mock('../services/kms/encryptS3Object', () => ({
  encryptS3Object: jest.fn()
}))

describe('encryptAuditData', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    process.env.TEMPORARY_BUCKET_NAME = TEST_TEMPORARY_BUCKET_NAME
    process.env.PERMANENT_BUCKET_NAME = TEST_PERMANENT_BUCKET_NAME
    process.env.AUDIT_BUCKET_NAME = TEST_AUDIT_BUCKET_NAME
  })

  it.each([TEST_TEMPORARY_BUCKET_NAME, TEST_AUDIT_BUCKET_NAME])(
    'retrieves and copies an S3 object from the bucket %p',
    async (bucketName: string) => {
      const s3ObjectStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)
      when(getS3ObjectAsStream).mockResolvedValue(s3ObjectStream)
      when(encryptS3Object).mockResolvedValue(
        TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER
      )

      await encryptAuditData(bucketName, TEST_S3_OBJECT_KEY)

      expect(getS3ObjectAsStream).toHaveBeenCalledWith(
        bucketName,
        TEST_S3_OBJECT_KEY
      )
      expect(encryptS3Object).toHaveBeenCalledWith(s3ObjectStream)
      expect(putS3Object).toHaveBeenCalledWith(
        TEST_PERMANENT_BUCKET_NAME,
        TEST_S3_OBJECT_KEY,
        TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER
      )
    }
  )

  it('throws an error if the source bucket is invalid', async () => {
    expect(
      encryptAuditData(TEST_WRONG_S3_BUCKET, TEST_S3_OBJECT_KEY)
    ).rejects.toThrow(`Incorrect source bucket - ${TEST_WRONG_S3_BUCKET}`)
    expect(getS3ObjectAsStream).not.toHaveBeenCalled()
    expect(encryptS3Object).not.toHaveBeenCalled()
    expect(putS3Object).not.toHaveBeenCalled()
  })
})
