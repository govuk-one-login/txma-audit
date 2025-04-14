import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { deleteS3Object } from './deleteS3Object'
import 'aws-sdk-client-mock-jest'
import {
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_S3_OBJECT_KEY
} from '../../../common/utils/tests/testConstants'

const s3Mock = mockClient(S3Client)

const putObjectCommandInput: DeleteObjectCommandInput = {
  Bucket: TEST_TEMPORARY_BUCKET_NAME,
  Key: TEST_S3_OBJECT_KEY
}

describe('deleteS3Object', () => {
  it('deletes an object', async () => {
    await deleteS3Object(TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY)

    expect(s3Mock).toHaveReceivedCommandWith(
      DeleteObjectCommand,
      putObjectCommandInput
    )
  })
})
