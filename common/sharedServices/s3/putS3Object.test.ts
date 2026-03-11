import { describe, it, expect } from 'vitest'
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import {
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER
} from '../../../common/utils/tests/testConstants'
import { putS3Object } from './putS3Object'

const s3Mock = mockClient(S3Client)

describe('putS3Object', () => {
  const putObjectCommandInput: PutObjectCommandInput = {
    Bucket: TEST_PERMANENT_BUCKET_NAME,
    Key: TEST_S3_OBJECT_KEY,
    Body: TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER
  }

  it('uploads an object', async () => {
    await putS3Object(
      TEST_PERMANENT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY,
      TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER
    )

    const calls = s3Mock.commandCalls(PutObjectCommand)
    expect(calls).toHaveLength(1)
    expect(calls[0].args[0].input).toEqual(putObjectCommandInput)
  })
})
