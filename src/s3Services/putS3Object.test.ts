import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { putS3Object } from './putS3Object'
import {
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_S3_OBJECT_DATA_STRING
} from '../utils/tests/testConstants'
import 'aws-sdk-client-mock-jest'

process.env.AWS_REGION = 'eu-west-2'
const s3Mock = mockClient(S3Client)

const putObjectCommandInput: PutObjectCommandInput = {
  Bucket: TEST_PERMANENT_BUCKET_NAME,
  Key: TEST_S3_OBJECT_KEY,
  Body: TEST_S3_OBJECT_DATA_STRING
}

describe('putS3Object', () => {
  it('uploads an object', async () => {
    await putS3Object(
      TEST_PERMANENT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY,
      TEST_S3_OBJECT_DATA_STRING
    )

    expect(s3Mock).toHaveReceivedCommandWith(
      PutObjectCommand,
      putObjectCommandInput
    )
  })
})
