import { Context, S3BatchEvent } from 'aws-lambda'
import { when } from 'jest-when'
import { handler } from './handler'
import { reEncryptObjectWithDualKeys } from './reEncryptObjectWithDualKeys'

jest.mock('./reEncryptObjectWithDualKeys', () => ({
  reEncryptObjectWithDualKeys: jest.fn()
}))

const mockReEncryptObjectWithDualKeys = reEncryptObjectWithDualKeys as jest.Mock

const mockContext = {
  functionName: 'test-function',
  awsRequestId: 'test-request-id'
} as Context

const createS3BatchEvent = (
  taskCount = 1,
  bucketName = 'test-bucket'
): S3BatchEvent => ({
  invocationSchemaVersion: '1.0',
  invocationId: 'test-invocation-id',
  job: {
    id: 'test-job-id'
  },
  tasks: Array.from({ length: taskCount }, (_, i) => ({
    taskId: `task-${i}`,
    s3Key: `test-key-${i}`,
    s3VersionId: 'version-1',
    s3BucketArn: `arn:aws:s3:::${bucketName}`
  }))
})

describe('S3 Key Rotation Handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('successfully processes a single task', async () => {
    const event = createS3BatchEvent(1, 'audit-bucket')
    mockReEncryptObjectWithDualKeys.mockResolvedValue(undefined)

    const result = await handler(event, mockContext)

    expect(result).toEqual({
      invocationSchemaVersion: '1.0',
      treatMissingKeysAs: 'PermanentFailure',
      invocationId: 'test-invocation-id',
      results: [
        {
          taskId: 'task-0',
          resultCode: 'Succeeded',
          resultString: 'Object re-encrypted successfully'
        }
      ]
    })

    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledWith(
      'audit-bucket',
      'test-key-0'
    )
    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledTimes(1)
  })

  it('successfully processes multiple tasks in parallel', async () => {
    const event = createS3BatchEvent(3, 'audit-bucket')
    mockReEncryptObjectWithDualKeys.mockResolvedValue(undefined)

    const result = await handler(event, mockContext)

    expect(result.results).toHaveLength(3)
    expect(result.results.every((r) => r.resultCode === 'Succeeded')).toBe(true)
    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledTimes(3)
    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledWith(
      'audit-bucket',
      'test-key-0'
    )
    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledWith(
      'audit-bucket',
      'test-key-1'
    )
    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledWith(
      'audit-bucket',
      'test-key-2'
    )
  })

  it('handles task failures gracefully', async () => {
    const event = createS3BatchEvent(2, 'audit-bucket')

    when(mockReEncryptObjectWithDualKeys)
      .calledWith('audit-bucket', 'test-key-0')
      .mockResolvedValue(undefined)

    when(mockReEncryptObjectWithDualKeys)
      .calledWith('audit-bucket', 'test-key-1')
      .mockRejectedValue(new Error('KMS key not found'))

    const result = await handler(event, mockContext)

    expect(result.results).toHaveLength(2)
    expect(result.results[0]).toEqual({
      taskId: 'task-0',
      resultCode: 'Succeeded',
      resultString: 'Object re-encrypted successfully'
    })
    expect(result.results[1]).toEqual({
      taskId: 'task-1',
      resultCode: 'PermanentFailure',
      resultString: 'Failed: KMS key not found'
    })
  })

  it('continues processing remaining tasks when one fails', async () => {
    const event = createS3BatchEvent(3, 'audit-bucket')

    when(mockReEncryptObjectWithDualKeys)
      .calledWith('audit-bucket', 'test-key-0')
      .mockResolvedValue(undefined)

    when(mockReEncryptObjectWithDualKeys)
      .calledWith('audit-bucket', 'test-key-1')
      .mockRejectedValue(new Error('Access denied'))

    when(mockReEncryptObjectWithDualKeys)
      .calledWith('audit-bucket', 'test-key-2')
      .mockResolvedValue(undefined)

    const result = await handler(event, mockContext)

    expect(result.results[0].resultCode).toBe('Succeeded')
    expect(result.results[1].resultCode).toBe('PermanentFailure')
    expect(result.results[2].resultCode).toBe('Succeeded')
    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledTimes(3)
  })

  it('extracts bucket name correctly from S3 ARN', async () => {
    const event = createS3BatchEvent(1, 'my-special-bucket-name')
    mockReEncryptObjectWithDualKeys.mockResolvedValue(undefined)

    await handler(event, mockContext)

    expect(mockReEncryptObjectWithDualKeys).toHaveBeenCalledWith(
      'my-special-bucket-name',
      'test-key-0'
    )
  })

  it('handles empty task list', async () => {
    const event: S3BatchEvent = {
      invocationSchemaVersion: '1.0',
      invocationId: 'test-invocation-id',
      job: {
        id: 'test-job-id'
      },
      tasks: []
    }

    const result = await handler(event, mockContext)

    expect(result.results).toEqual([])
    expect(mockReEncryptObjectWithDualKeys).not.toHaveBeenCalled()
  })

  it('includes invocation details in response', async () => {
    const event = createS3BatchEvent(1)
    mockReEncryptObjectWithDualKeys.mockResolvedValue(undefined)

    const result = await handler(event, mockContext)

    expect(result.invocationSchemaVersion).toBe('1.0')
    expect(result.invocationId).toBe('test-invocation-id')
    expect(result.treatMissingKeysAs).toBe('PermanentFailure')
  })
})
