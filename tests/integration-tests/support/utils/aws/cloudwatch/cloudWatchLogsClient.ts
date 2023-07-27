import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs'
import { getEnv } from '../../getEnv'

export const cloudWatchLogsClient = new CloudWatchLogsClient({
  region: getEnv('AWS_REGION')
})
