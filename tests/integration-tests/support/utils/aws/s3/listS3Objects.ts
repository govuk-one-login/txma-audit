import {
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  _Object
} from '@aws-sdk/client-s3'
import { s3Client } from './s3Client'

export const listS3Objects = async (
  input: ListObjectsV2CommandInput,
  objects: _Object[] = []
) => {
  const command = new ListObjectsV2Command(input)
  const response = await s3Client.send(command)

  if (!response.Contents) return []

  response.Contents.forEach((item) => objects.push(item))

  if (response.NextContinuationToken) {
    input.ContinuationToken = response.NextContinuationToken
    await listS3Objects(input, objects)
  }

  return objects.filter((o) => !o.Key?.endsWith('/'))
}
