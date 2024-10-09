import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { client } from './s3Client'

export const s3FileExists = async (
  bucket: string,
  s3Key: string
): Promise<boolean> => {
  try {
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
