import AWSXRay from 'aws-xray-sdk-core'
import { s3Client as s3ClientRaw } from '../../utils/awsSdkClients'

export const client =
  process.env.XRAY_ENABLED === 'true'
    ? AWSXRay.captureAWSv3Client(s3ClientRaw)
    : s3ClientRaw
