import { S3Client } from '@aws-sdk/client-s3'
import { getEnv } from '../../../../../common/utils/helpers/getEnv'

export const s3Client = new S3Client({ region: getEnv('AWS_REGION') })
