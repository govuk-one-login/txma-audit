import { mockLambdaContext } from '../../utils/tests/mockLambdaContext'
import { testS3RestoreEvent } from '../../utils/tests/testEvents/testS3RestoreEvent'
import { handler } from './handler'
import { permanentBucketFileExists } from './permanentBucketFileExists'
import { encryptAuditData } from '../../sharedServices/encryptAuditData'
import { s3ChangeStorageClass } from '../../services/s3/s3ChangeStorageClass'
import { when } from 'jest-when'
import {
  TEST_AUDIT_BUCKET_NAME,
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_KEY
} from '../../utils/tests/testConstants'
import { StorageClass } from '@aws-sdk/client-s3'
jest.mock('./permanentBucketFileExists', () => ({
  permanentBucketFileExists: jest.fn()
}))

jest.mock('../../sharedServices/encryptAuditData', () => ({
  encryptAuditData: jest.fn()
}))

jest.mock('../../services/s3/s3ChangeStorageClass', () => ({
  s3ChangeStorageClass: jest.fn()
}))

describe('handlerEncryptGlacierRestore', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const givenPermanentBucketFileExists = () => {
    when(permanentBucketFileExists).mockResolvedValue(true)
  }

  const givenPermanentBucketFileDoesNotExist = () => {
    when(permanentBucketFileExists).mockResolvedValue(false)
  }

  it('should throw an error if the event body is malformed', async () => {
    givenPermanentBucketFileExists()
    expect(handler({ Records: [] }, mockLambdaContext)).rejects.toThrow(
      'Event record length was 0 not 1, or no Records property found, cannot continue'
    )
    expect(permanentBucketFileExists).not.toHaveBeenCalledWith(
      TEST_S3_OBJECT_KEY
    )
    expect(encryptAuditData).not.toHaveBeenCalled()
    expect(s3ChangeStorageClass).not.toHaveBeenCalled()
  })

  it('should not encrypt the file if it can already be found in the permanent bucket', async () => {
    givenPermanentBucketFileExists()
    await handler(testS3RestoreEvent, mockLambdaContext)
    expect(permanentBucketFileExists).toHaveBeenCalledWith(TEST_S3_OBJECT_KEY)
    expect(encryptAuditData).not.toHaveBeenCalled()
    expect(s3ChangeStorageClass).not.toHaveBeenCalled()
  })

  it('should encrypt the given file if it cannot already be found in the permanent bucket', async () => {
    givenPermanentBucketFileDoesNotExist()
    await handler(testS3RestoreEvent, mockLambdaContext)
    expect(permanentBucketFileExists).toHaveBeenCalledWith(TEST_S3_OBJECT_KEY)
    expect(encryptAuditData).toHaveBeenCalledWith(
      TEST_AUDIT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY
    )
    expect(s3ChangeStorageClass).toHaveBeenCalledWith(
      TEST_PERMANENT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY,
      StorageClass.GLACIER
    )
  })
})
