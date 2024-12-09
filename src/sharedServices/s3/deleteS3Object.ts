import {
  DeleteObjectCommand,
  DeleteObjectCommandInput
} from '@aws-sdk/client-s3'

import { s3Client } from '../../utils/awsSdkClients'

export const deleteS3Object = async (
  bucket: string,
  fileKey: string
): Promise<void> => {
  const input = {
    Bucket: bucket,
    Key: fileKey
  } as DeleteObjectCommandInput

  await s3Client.send(new DeleteObjectCommand(input))
}
