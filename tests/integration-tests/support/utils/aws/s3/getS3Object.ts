import { GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import { s3Client } from './s3Client'

export const getS3ObjectAsStream = async (
  input: GetObjectCommandInput
): Promise<Readable> => {
  const { Body } = await s3Client.send(new GetObjectCommand(input))

  if (!(Body instanceof Readable)) {
    throw Error('Get S3 Object command did not return stream')
  }
  return Body
}
