import { s3FileExists } from '../../services/s3/s3FileExists'
import { getEnv } from '../../utils/helpers'

export const permanentBucketFileExists = (s3Key: string): Promise<boolean> => {
  return s3FileExists(getEnv('PERMANENT_BUCKET_NAME'), s3Key)
}
