import {
  DeleteObjectCommand,
  DeleteObjectCommandInput
} from '@aws-sdk/client-s3'

import { client } from './s3Client'

export const deleteS3Object = async (
  bucket: string,
  fileKey: string
): Promise<void> => {
  const input = {
    Bucket: bucket,
    Key: fileKey
  } as DeleteObjectCommandInput

  await client.send(new DeleteObjectCommand(input))
}
