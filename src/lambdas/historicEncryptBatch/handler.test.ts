import { mockLambdaContext } from '../../utils/tests/mockLambdaContext'
import {
  emptyTestS3BatchEvent,
  testS3BatchEvent
} from '../../utils/tests/testEvents/testS3BatchEvents'
import { handler } from './handler'
import { encryptAuditData } from '../../sharedServices/encryptAuditData'
import { when } from 'jest-when'
import {
  TEST_AUDIT_BUCKET_NAME,
  TEST_S3_BATCH_TASK_ID,
  TEST_S3_OBJECT_KEY
} from '../../utils/tests/testConstants'
import { logger } from '../../services/logger'
jest.mock('../../sharedServices/encryptAuditData', () => ({
  encryptAuditData: jest.fn()
}))

describe('historicEncryptBatch', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(logger, 'error')
  })

  it('throws an error if there is no data in the event', async () => {
    expect(handler(emptyTestS3BatchEvent, mockLambdaContext)).rejects.toThrow(
      'No tasks in event'
    )
    expect(encryptAuditData).not.toHaveBeenCalled()
  })

  it('calls encryptAuditData to encrypt the data specified', async () => {
    const response = await handler(testS3BatchEvent, mockLambdaContext)
    expect(response.results[0].taskId).toEqual(TEST_S3_BATCH_TASK_ID)
    expect(response.results[0].resultCode).toEqual('Succeeded')
    expect(encryptAuditData).toHaveBeenCalledWith(
      TEST_AUDIT_BUCKET_NAME,
      TEST_S3_OBJECT_KEY
    )
  })

  it('catches and logs errors, and marks the operation as a temporary failure', async () => {
    when(encryptAuditData).mockRejectedValue('Some encryption error')
    const response = await handler(testS3BatchEvent, mockLambdaContext)
    expect(response.results[0].resultCode).toEqual('TemporaryFailure')
    expect(logger.error).toHaveBeenCalledWith('Error during batch encryption', {
      err: 'Some encryption error',
      s3Key: TEST_S3_OBJECT_KEY
    })
  })
})
