import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getEnv } from '../../src/utils/helpers/tryParseJson'
import { createManifestFileText } from './createManifestFileText'

export const writeJobManifestFile = async (
  sourceBucket: string,
  fileList: string[],
  manifestFileName: string
): Promise<string> => {
  const client = new S3Client(getEnv('AWS_REGION'))
  console.log('Writing job manifest file', {
    manifestFileName: manifestFileName
  })
  const response = await client.send(
    new PutObjectCommand({
      Key: manifestFileName,
      Bucket: getEnv('BATCH_JOB_MANIFEST_BUCKET_NAME'),
      Body: createManifestFileText(sourceBucket, fileList)
    })
  )
  console.log('Succesfully wrote manifest to S3', {
    manifestFileName,
    etag: response.ETag
  })
  return response.ETag as string
}
