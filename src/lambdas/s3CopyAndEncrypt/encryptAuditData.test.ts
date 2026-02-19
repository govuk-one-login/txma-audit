import { describe, it, expect, beforeEach, vi } from 'vitest'
import { encryptS3Object } from '../../../common/sharedServices/kms/encryptS3Object'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { encryptAuditData } from './encryptAuditData'
import { createDataStream } from '../../../common/utils/tests/test-helpers/test-helper'
import {
  TEST_AUDIT_BUCKET_NAME,
  TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_DATA_STRING,
  TEST_S3_OBJECT_KEY,
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_WRONG_S3_BUCKET
} from '../../../common/utils/tests/testConstants'

vi.mock('../../../common/sharedServices/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: vi.fn()
}))

vi.mock('../../../common/sharedServices/s3/putS3Object', () => ({
  putS3Object: vi.fn()
}))

vi.mock('../../../common/sharedServices/kms/encryptS3Object', () => ({
  encryptS3Object: vi.fn()
}))

describe('encryptAuditData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it.each([TEST_TEMPORARY_BUCKET_NAME, TEST_AUDIT_BUCKET_NAME])(
    'retrieves and copies an S3 object from the bucket %p',
    async (bucketName: string) => {
      const s3ObjectStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)
      ;(getS3ObjectAsStream as any).mockResolvedValue(s3ObjectStream)
      ;(encryptS3Object as any).mockResolvedValue(
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
    await expect(
      encryptAuditData(TEST_WRONG_S3_BUCKET, TEST_S3_OBJECT_KEY)
    ).rejects.toThrow(`Incorrect source bucket - ${TEST_WRONG_S3_BUCKET}`)
    expect(getS3ObjectAsStream).not.toHaveBeenCalled()
    expect(encryptS3Object).not.toHaveBeenCalled()
    expect(putS3Object).not.toHaveBeenCalled()
  })
})
