import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getEnv } from '../../utils/helpers'

export const s3FileExists = async (
  bucket: string,
  s3Key: string
): Promise<boolean> => {
  try {
    const client = new S3Client({ region: getEnv('AWS_REGION') })
    const headObjectResponse = await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: s3Key
      })
    )

    return !!headObjectResponse.ContentLength
  } catch (err) {
    const notFoundError = err as { name: string }
    if (notFoundError && notFoundError.name === 'NotFound') {
      return false
    }
    throw err
  }
}
