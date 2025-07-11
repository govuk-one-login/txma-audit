import {
  S3Client,
  HeadObjectCommand,
  HeadObjectOutput
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'
import {
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_KEY
} from '../../../common/utils/tests/testConstants'
import { s3FileExists } from './s3FileExists'
const s3Mock = mockClient(S3Client)
describe('s3FileExists', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it('should return false if a file not exists error is returned', async () => {
    s3Mock.on(HeadObjectCommand).rejects({ name: 'NotFound' })
    expect(
      await s3FileExists(TEST_PERMANENT_BUCKET_NAME, TEST_S3_OBJECT_KEY)
    ).toEqual(false)
    expect(s3Mock).toHaveReceivedCommandWith(HeadObjectCommand, {
      Bucket: TEST_PERMANENT_BUCKET_NAME,
      Key: TEST_S3_OBJECT_KEY
    })
  })

  it('should throw if some other error is returned', async () => {
    const someError = 'some other error'
    s3Mock.on(HeadObjectCommand).rejects(someError)
    await expect(
      s3FileExists(TEST_PERMANENT_BUCKET_NAME, TEST_S3_OBJECT_KEY)
    ).rejects.toThrow(someError)

    expect(s3Mock).toHaveReceivedCommandWith(HeadObjectCommand, {
      Bucket: TEST_PERMANENT_BUCKET_NAME,
      Key: TEST_S3_OBJECT_KEY
    })
  })

  it('should return true if the requested file is found', async () => {
    s3Mock
      .on(HeadObjectCommand)
      .resolves({ ContentLength: 100 } as HeadObjectOutput)
    expect(
      await s3FileExists(TEST_PERMANENT_BUCKET_NAME, TEST_S3_OBJECT_KEY)
    ).toEqual(true)

    expect(s3Mock).toHaveReceivedCommandWith(HeadObjectCommand, {
      Bucket: TEST_PERMANENT_BUCKET_NAME,
      Key: TEST_S3_OBJECT_KEY
    })
  })
})
