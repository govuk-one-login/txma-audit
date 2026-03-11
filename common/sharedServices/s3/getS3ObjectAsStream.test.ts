import { describe, it, expect } from 'vitest'
import {
  S3Client,
  GetObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandOutput
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { createDataStream } from '../../../common/utils/tests/test-helpers/test-helper'
import {
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_S3_OBJECT_DATA_STRING
} from '../../../common/utils/tests/testConstants'
import { getS3ObjectAsStream } from './getS3ObjectAsStream'

const s3Mock = mockClient(S3Client)
const getObjectCommandInput: GetObjectCommandInput = {
  Bucket: TEST_TEMPORARY_BUCKET_NAME,
  Key: TEST_S3_OBJECT_KEY
}

const givenDataAvailable = () => {
  s3Mock.on(GetObjectCommand).resolves({
    Body: createDataStream(TEST_S3_OBJECT_DATA_STRING)
  } as GetObjectCommandOutput)
}

describe('getS3Object -', () => {
  it('getS3ObjectAsStream returns a stream read from the file', async () => {
    givenDataAvailable()
    const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)

    const returnedData = await getS3ObjectAsStream(
      TEST_TEMPORARY_BUCKET_NAME,
      TEST_S3_OBJECT_KEY
    )

    const calls = s3Mock.commandCalls(GetObjectCommand)
    expect(calls).toHaveLength(1)
    expect(calls[0].args[0].input).toEqual(getObjectCommandInput)
    expect(returnedData).toEqual(testDataStream)
  })
})
