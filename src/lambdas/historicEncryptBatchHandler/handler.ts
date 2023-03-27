import {
  Context,
  S3BatchEvent,
  S3BatchEventTask,
  S3BatchResult,
  S3BatchResultResultCode
} from 'aws-lambda'
import { initialiseLogger, logger } from '../../services/logger'
import { encryptAuditData } from '../../sharedServices/encryptAuditData'

export const handler = async (
  event: S3BatchEvent,
  context: Context
): Promise<S3BatchResult> => {
  initialiseLogger(context)

  let resultCode: S3BatchResultResultCode = 'Succeeded'
  let resultString = ''
  if (event.tasks.length === 0) {
    throw new Error('No tasks in event')
  }

  try {
    await encryptFileForTask(event.tasks[0])
    logger.info('Decrypt and copy completed successfully', {
      s3Key: event.tasks[0].s3Key
    })
  } catch (err) {
    logger.error('Error during batch encryption', {
      err,
      s3Key: event.tasks[0].s3Key
    })
    resultCode = 'TemporaryFailure'
    resultString = `Err: ${JSON.stringify(err)}`
  }
  return {
    invocationSchemaVersion: '1.0',
    treatMissingKeysAs: 'PermanentFailure',
    invocationId: event.invocationId,
    results: event.tasks.map((t: S3BatchEventTask) => ({
      taskId: t.taskId,
      resultCode: resultCode,
      resultString: resultString
    }))
  }
}

const encryptFileForTask = async (task: S3BatchEventTask) => {
  const key = task.s3Key
  const bucket = extractS3BucketNameFromArn(task.s3BucketArn)
  await encryptAuditData(bucket, key)
}

const extractS3BucketNameFromArn = (arn: string) => {
  return arn.replace('arn:aws:s3:::', '')
}
