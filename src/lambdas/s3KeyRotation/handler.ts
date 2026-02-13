import { Context, S3BatchEvent, S3BatchResult } from 'aws-lambda'
import { initialiseLogger, logger } from '../../../common/sharedServices/logger'
import { reEncryptObjectWithDualKeys } from './reEncryptObjectWithDualKeys'

export const handler = async (
  event: S3BatchEvent,
  context: Context
): Promise<S3BatchResult> => {
  initialiseLogger(context)

  logger.info('S3 Batch Key Rotation started', {
    invocationId: event.invocationId,
    jobId: event.job.id,
    taskCount: event.tasks.length
  })

  const results = await Promise.allSettled(
    event.tasks.map((task) => processTask(task))
  )

  const response: S3BatchResult = {
    invocationSchemaVersion: event.invocationSchemaVersion,
    treatMissingKeysAs: 'PermanentFailure',
    invocationId: event.invocationId,
    results: results.map((result, index) => {
      const task = event.tasks[index]
      if (result.status === 'fulfilled') {
        return {
          taskId: task.taskId,
          resultCode: 'Succeeded',
          resultString: 'Object re-encrypted successfully'
        }
      } else {
        logger.error('Task failed', {
          taskId: task.taskId,
          s3Key: task.s3Key,
          error: result.reason
        })
        return {
          taskId: task.taskId,
          resultCode: 'PermanentFailure',
          resultString: `Failed: ${
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error'
          }`
        }
      }
    })
  }

  logger.info('S3 Batch Key Rotation completed', {
    invocationId: event.invocationId,
    succeeded: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length
  })

  return response
}

const processTask = async (task: S3BatchEvent['tasks'][0]): Promise<void> => {
  // Extract bucket name from ARN (arn:aws:s3:::bucket-name)
  const bucketName = task.s3BucketArn.split(':::')[1]

  logger.info('Processing task', {
    taskId: task.taskId,
    bucket: bucketName,
    key: task.s3Key
  })

  await reEncryptObjectWithDualKeys(bucketName, task.s3Key)

  logger.info('Task completed successfully', {
    taskId: task.taskId,
    key: task.s3Key
  })
}
