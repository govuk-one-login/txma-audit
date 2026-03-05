import { retrieveSsmParameterValue } from './retrieveSsmParameterValue'
import { getOutputValue, retrieveStackOutputs } from './retrieveStackOutputs'

const region = 'eu-west-2'
const stack = process.env.STACK_NAME ? process.env.STACK_NAME : 'audit'

const setupFunction = async () => {
  try {
    process.env['AWS_REGION'] = region
    process.env['STACK_NAME'] = stack

    const stackOutputMappings = {
      AUDIT_MESSAGE_DELIMITER_FUNCTION_NAME:
        'AuditMessageDelimiterFunctionName',
      AUDIT_MESSAGE_DELIMITER_LOGS_NAME: 'AuditMessageDelimiterLogsName',
      S3_COPY_AND_ENCRYPT_FUNCTION_NAME: 'S3CopyAndEncryptFunctionName',
      S3_COPY_AND_ENCRYPT_LOGS_NAME: 'S3CopyAndEncryptLogsName',
      S3_KEY_ROTATION_FUNCTION_NAME: 'S3KeyRotationFunctionName',
      S3_KEY_ROTATION_LOGS_NAME: 'S3KeyRotationLogsName',
      PERMANENT_MESSAGE_BATCH_BUCKET_NAME: 'PermanentMessageBatchBucketName',
      AUDIT_BUILD_MESSAGE_BATCH_NAME: 'AuditMessageBatchBucketName',
      FIREHOSE_AUDIT_MESSAGE_BATCH_NAME: 'AuditMessageDeliveryStreamName'
    }

    await setEnvVarsFromStackOutputs(stack, stackOutputMappings)
    await setEnvVarsFromSsm(ssmMappings)
  } catch (error) {
    console.error('Setup error:', error)
    throw error
  }
}

const formatTestStackSsmParam = (parameterName: string) =>
  `/tests/${stack}/${parameterName}`

const ssmMappings = {
  FIREHOSE_DELIVERY_STREAM_NAME: formatTestStackSsmParam(
    'AddRecordToFirehoseFunctionName'
  ),
  GENERATOR_KEY_ID: 'S3EncryptionGeneratorKmsKeyArn',
  BACKUP_KEY_ID: 'S3EncryptionGeneratorKmsKeyArnBck'
}

const setEnvVarsFromStackOutputs = async (
  stack: string,
  stackOutputMappings: Record<string, string>
) => {
  const stackOutputs = await retrieveStackOutputs(stack, region)

  for (const [k, v] of Object.entries(stackOutputMappings)) {
    process.env[k] = process.env[k]
      ? process.env[k]
      : getOutputValue(stackOutputs, v)
  }
}

const setEnvVarsFromSsm = async (ssmMappings: Record<string, string>) => {
  for (const [k, v] of Object.entries(ssmMappings)) {
    process.env[k] = process.env[k]
      ? process.env[k]
      : await retrieveSsmParameterValue(v, region)
  }
}

// Export in multiple ways for compatibility
export default setupFunction
export { setupFunction as setup }

// Also call it at module level as a last resort
await setupFunction()
