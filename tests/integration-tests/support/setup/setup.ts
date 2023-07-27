import { retrieveSecretValue } from './retrieveSecretValue'
import { getOutputValue, retrieveStackOutputs } from './retrieveStackOutputs'

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module global {
  const AWS_REGION: string
  const STACK_NAME: string
}

const region = global.AWS_REGION
const stack = process.env.STACK_NAME
  ? process.env.STACK_NAME
  : global.STACK_NAME

module.exports = async () => {
  const globals = ['AWS_REGION']
  const stackOutputMappings = {
    AUDIT_MESSAGE_DELIMITER_FUNCTION_NAME: 'AuditMessageDelimiterFunctionName',
    AUDIT_MESSAGE_DELIVERY_STREAM_LOG_GROUP_NAME: 'AuditMessageDeliveryStreamLogsName',
    FRAUD_SPLUNK_DELIVERY_TEST_BUCKET_NAME: 'FraudSplunkDeliveryTestBucketName',
    FRAUD_SPLUNK_TRANSFORMATION_LOG_GROUP_NAME:
      'FraudSplunkTransformationLogGroupName',
    PERFORMANCE_SPLUNK_DELIVERY_TEST_BUCKET_NAME:
      'PerformanceSplunkDeliveryTestBucketName',
    PERFORMANCE_SPLUNK_TRANSFORMATION_LOG_GROUP_NAME:
      'PerformanceSplunkTransformationLogGroupName'
  }
  const secretMappings = {
    FRAUD_HMAC_KEY: `tests/${stack}/FraudHMACKey`,
    PERFORMANCE_HMAC_KEY: `tests/${stack}/PerformanceHMACKey`
  }
  setEnvVarsFromJestGlobals(globals)
  await setEnvVarsFromStackOutputs(stack, stackOutputMappings)
  await setEnvVarsFromSecretsManager(secretMappings)
}

const setEnvVarsFromJestGlobals = (globals: string[]) => {
  globals.forEach(
    (v) =>
      (process.env[v] = process.env[v]
        ? process.env[v]
        : global[v as keyof typeof global])
  )
}

const setEnvVarsFromStackOutputs = async (
  stack: string,
  stackOutputMappings: {
    [key: string]: string
  }
) => {
  const stackOutputs = await retrieveStackOutputs(stack, region)

  for (const [k, v] of Object.entries(stackOutputMappings)) {
    process.env[k] = process.env[k]
      ? process.env[k]
      : getOutputValue(stackOutputs, v)
  }
}

const setEnvVarsFromSecretsManager = async (secretMappings: {
  [key: string]: string
}) => {
  for (const [envVar, secretName] of Object.entries(secretMappings)) {
    const secretValue = await retrieveSecretValue(secretName, region)

    process.env[envVar] = process.env[envVar]
      ? process.env[envVar]
      : secretValue
  }
}
