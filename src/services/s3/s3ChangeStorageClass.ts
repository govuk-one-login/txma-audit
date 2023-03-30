import {
  CopyObjectCommand,
  CopyObjectCommandOutput,
  S3Client,
  StorageClass
} from '@aws-sdk/client-s3'
import { getEnv } from '../../utils/helpers'

export const s3ChangeStorageClass = (
  bucket: string,
  key: string,
  storageClass: StorageClass
): Promise<CopyObjectCommandOutput> => {
  const client = new S3Client({ region: getEnv('AWS_REGION') })
  return client.send(
    new CopyObjectCommand({
      CopySource: `${bucket}/${key}`,
      Bucket: bucket,
      StorageClass: storageClass,
      Key: key
    })
  )
}
