import { S3Client, CopyObjectCommand, StorageClass } from '@aws-sdk/client-s3'
import { s3ChangeStorageClass } from './s3ChangeStorageClass'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'
import {
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_KEY
} from '../../../common/utils/tests/testConstants'
const s3Mock = mockClient(S3Client)

describe('s3ChangeStorageClass', () => {
  it('should make the correct AWS SDK call to change the storage class', async () => {
    await s3ChangeStorageClass(
      TEST_PERMANENT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY,
      StorageClass.GLACIER
    )
    expect(s3Mock).toHaveReceivedCommandWith(CopyObjectCommand, {
      CopySource: `${TEST_PERMANENT_BUCKET_NAME}/${TEST_S3_OBJECT_KEY}`,
      Bucket: TEST_PERMANENT_BUCKET_NAME,
      StorageClass: StorageClass.GLACIER,
      Key: TEST_S3_OBJECT_KEY
    })
  })
})
