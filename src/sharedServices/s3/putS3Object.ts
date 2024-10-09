import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'
import { client } from './s3Client'

export const putS3Object = async (
  bucket: string,
  fileKey: string,
  data: Buffer
): Promise<void> => {
  const input = {
    Bucket: bucket,
    Key: fileKey,
    Body: data
  } as PutObjectCommandInput

  await client.send(new PutObjectCommand(input))
}
