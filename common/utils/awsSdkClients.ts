import { getEnv } from '../../common/utils/helpers/getEnv'
import AWSXRay from 'aws-xray-sdk-core'

import { FirehoseClient } from '@aws-sdk/client-firehose'
import { S3Client } from '@aws-sdk/client-s3'
import { S3ControlClient } from '@aws-sdk/client-s3-control'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

const firehoseClientRaw = new FirehoseClient({
  region: getEnv('AWS_REGION')
})
export const firehoseClient =
  process.env.XRAY_ENABLED === 'true'
    ? AWSXRay.captureAWSv3Client(firehoseClientRaw)
    : firehoseClientRaw

const s3ClientRaw = new S3Client({ region: getEnv('AWS_REGION') })
export const s3Client =
  process.env.XRAY_ENABLED === 'true'
    ? AWSXRay.captureAWSv3Client(s3ClientRaw)
    : s3ClientRaw

export const s3ControlClient = new S3ControlClient({
  region: getEnv('AWS_REGION')
})
export const secretsManagerClient = new SecretsManagerClient({
  region: getEnv('AWS_REGION')
})
