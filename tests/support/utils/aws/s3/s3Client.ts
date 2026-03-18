import { S3Client } from '@aws-sdk/client-s3'
import { getEnv } from '../../../../../common/utils/helpers/getEnv'

let s3ClientInstance: S3Client | undefined

export const s3Client = (): S3Client => {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({ region: getEnv('AWS_REGION') })
  }
  return s3ClientInstance
}
