import { s3FileExists } from '../../services/s3/s3FileExists'
import {
  TEST_PERMANENT_BUCKET_NAME,
  TEST_S3_OBJECT_KEY
} from '../../utils/tests/testConstants'
import { permanentBucketFileExists } from './permanentBucketFileExists'
import { when } from 'jest-when'
jest.mock('../../services/s3/s3FileExists', () => ({
  s3FileExists: jest.fn()
}))

describe('permanentBucketFileExists', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.PERMANENT_BUCKET_NAME = TEST_PERMANENT_BUCKET_NAME
  })

  it.each([true, false])(
    'should return the right value from the s3FileExists utility when the file exists value is %p',
    async (givenFileExistsValue: boolean) => {
      when(s3FileExists).mockResolvedValue(givenFileExistsValue)
      expect(await permanentBucketFileExists(TEST_S3_OBJECT_KEY)).toEqual(
        givenFileExistsValue
      )
      expect(s3FileExists).toHaveBeenCalledWith(
        TEST_PERMANENT_BUCKET_NAME,
        TEST_S3_OBJECT_KEY
      )
    }
  )
})
