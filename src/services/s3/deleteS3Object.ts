import {
  S3Client,
  DeleteObjectCommand,
  DeleteObjectCommandInput
} from '@aws-sdk/client-s3'
import { getEnv } from '../../utils/helpers'

export const deleteS3Object = async (
  bucket: string,
  fileKey: string
): Promise<void> => {
  const client = new S3Client({ region: getEnv('AWS_REGION') })

  const input = {
    Bucket: bucket,
    Key: fileKey
  } as DeleteObjectCommandInput

  await client.send(new DeleteObjectCommand(input))
}
