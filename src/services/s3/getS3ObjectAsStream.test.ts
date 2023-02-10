import {
  S3Client,
  GetObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandOutput
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'
import { createDataStream } from '../../utils/tests/test-helpers/test-helper'
import {
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_S3_OBJECT_DATA_STRING
} from '../../utils/tests/testConstants'
import { getS3ObjectAsStream } from './getS3ObjectAsStream'

process.env.AWS_REGION = 'eu-west-2'
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

describe('getS3Object - ', () => {
  it('getS3ObjectAsStream returns a stream read from the file', async () => {
    givenDataAvailable()
    const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)

    const returnedData = await getS3ObjectAsStream(
      TEST_TEMPORARY_BUCKET_NAME,
      TEST_S3_OBJECT_KEY
    )

    expect(s3Mock).toHaveReceivedCommandWith(
      GetObjectCommand,
      getObjectCommandInput
    )
    expect(returnedData).toEqual(testDataStream)
  })
})
