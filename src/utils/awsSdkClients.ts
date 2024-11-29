import { getEnv } from '../utils/helpers/getEnv'

import { FirehoseClient } from '@aws-sdk/client-firehose'
import { S3Client } from '@aws-sdk/client-s3'
import { S3ControlClient } from '@aws-sdk/client-s3-control'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export const firehoseClient = new FirehoseClient({
  region: getEnv('AWS_REGION')
})
export const s3Client = new S3Client({ region: getEnv('AWS_REGION') })
export const s3ControlClient = new S3ControlClient({
  region: getEnv('AWS_REGION')
})
export const secretsManagerClient = new SecretsManagerClient({
  region: getEnv('AWS_REGION')
})
