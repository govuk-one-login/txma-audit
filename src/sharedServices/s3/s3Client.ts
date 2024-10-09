import { S3Client } from '@aws-sdk/client-s3'
import { getEnv } from '../../utils/helpers/getEnv'
import AWSXRay from 'aws-xray-sdk-core'

const clientRaw = new S3Client({ region: getEnv('AWS_REGION') })

export const client =
  process.env.XRAY_ENABLED === 'true'
    ? AWSXRay.captureAWSv3Client(clientRaw)
    : clientRaw
