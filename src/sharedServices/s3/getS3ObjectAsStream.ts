import { GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { client } from './s3Client'

export const getS3ObjectAsStream = async (
  bucket: string,
  fileKey: string
): Promise<Readable> => {
  const input = {
    Bucket: bucket,
    Key: fileKey
  } as GetObjectCommandInput

  const { Body } = await client.send(new GetObjectCommand(input))

  if (!(Body instanceof Readable)) {
    throw Error('Get S3 Object command did not return stream')
  }

  return Body
}
