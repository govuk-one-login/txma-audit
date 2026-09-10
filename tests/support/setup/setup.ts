import { SSMClient } from '@aws-sdk/client-ssm'
import { logger } from '../logger'
import { getAllParametersByPath } from './retrieveSsmParameters'

const region = 'eu-west-2'
const stack = process.env.STACK_NAME ? process.env.STACK_NAME : 'audit'

// Map from SSM parameter name suffix (published by the CloudFormation stack
// under /tests/<stackName>/) to the env var the integration tests consume.
//
// These values used to be read from CloudFormation stack outputs via
// DescribeStacks, but the shared dev-tools task role's permissions boundary
// does not allow cloudformation:DescribeStacks, so they are now published as
// SSM parameters by the stack (see the AWS::SSM::Parameter resources in
// template.yaml) and read here via ssm:GetParametersByPath.
const ssmParamMappings: Record<string, string> = {
  AuditMessageDelimiterFunctionName: 'AUDIT_MESSAGE_DELIMITER_FUNCTION_NAME',
  AuditMessageDelimiterLogsName: 'AUDIT_MESSAGE_DELIMITER_LOGS_NAME',
  S3CopyAndEncryptFunctionName: 'S3_COPY_AND_ENCRYPT_FUNCTION_NAME',
  S3CopyAndEncryptLogsName: 'S3_COPY_AND_ENCRYPT_LOGS_NAME',
  S3KeyRotationFunctionName: 'S3_KEY_ROTATION_FUNCTION_NAME',
  S3KeyRotationLogsName: 'S3_KEY_ROTATION_LOGS_NAME',
  PermanentMessageBatchBucketName: 'PERMANENT_MESSAGE_BATCH_BUCKET_NAME',
  AuditMessageBatchBucketName: 'AUDIT_BUILD_MESSAGE_BATCH_NAME',
  AuditMessageDeliveryStreamName: 'FIREHOSE_AUDIT_MESSAGE_BATCH_NAME',
  GeneratorKeyId: 'GENERATOR_KEY_ID',
  BackupKeyId: 'BACKUP_KEY_ID',
  AddRecordToFirehoseFunctionName: 'FIREHOSE_DELIVERY_STREAM_NAME'
}

const setupFunction = async () => {
  try {
    process.env['AWS_REGION'] = region
    process.env['STACK_NAME'] = stack

    logger.info('Starting test setup', { stackName: stack })

    const client = new SSMClient({ region })
    const path = `/tests/${stack}/`
    const parameters = await getAllParametersByPath(client, path)

    for (const param of parameters) {
      const suffix = param.Name?.replace(path, '')
      const envVar = suffix ? ssmParamMappings[suffix] : undefined

      if (envVar && !process.env[envVar]) {
        process.env[envVar] = param.Value
      }
    }

    const missing = Object.values(ssmParamMappings).filter(
      (envVar) => !process.env[envVar]
    )

    if (missing.length > 0) {
      throw new Error(
        `Missing required SSM-sourced environment variables: ${missing.join(
          ', '
        )}. Expected SSM parameters under ${path}`
      )
    }
  } catch (error) {
    logger.error('Setup error', error as Error)
    throw error
  }
}

// Export in multiple ways for compatibility
export default setupFunction
export { setupFunction as setup }

// Also call it at module level as a last resort
await setupFunction()
