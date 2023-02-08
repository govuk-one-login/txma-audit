import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput
} from '@aws-sdk/client-s3'
import { getEnv } from '../../utils/helpers'

export const putS3Object = (bucket: string, fileKey: string, data: Buffer) => {
  const client = new S3Client({ region: getEnv('AWS_REGION') })

  const input = {
    Bucket: bucket,
    Key: fileKey,
    Body: data
  } as PutObjectCommandInput

  client.send(new PutObjectCommand(input))
}
