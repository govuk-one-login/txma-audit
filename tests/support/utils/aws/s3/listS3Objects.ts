import {
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2Output,
  _Object
} from '@aws-sdk/client-s3'
import { s3Client } from './s3Client'

export const listS3Objects = async (
  input: ListObjectsV2CommandInput,
  objects: _Object[] = []
) => {
  const command = new ListObjectsV2Command(input)
  let response: ListObjectsV2Output
  try {
    response = await s3Client.send(command)
  } catch (err) {
    console.error(
      `Got error listing files for input ${JSON.stringify(input)}`,
      err
    )
    throw err
  }
  if (!response.Contents) return []

  response.Contents.forEach((item) => objects.push(item))

  if (response.NextContinuationToken) {
    input.ContinuationToken = response.NextContinuationToken
    await listS3Objects(input, objects)
  }

  return objects.filter((o) => !o.Key?.endsWith('/'))
}
