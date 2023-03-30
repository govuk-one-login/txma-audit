import { StorageClass } from '@aws-sdk/client-s3'
import { Context, S3Event } from 'aws-lambda'
import { initialiseLogger, logger } from '../../services/logger'
import { s3ChangeStorageClass } from '../../services/s3/s3ChangeStorageClass'
import { encryptAuditData } from '../../sharedServices/encryptAuditData'
import { getEnv } from '../../utils/helpers'
import { permanentBucketFileExists } from './permanentBucketFileExists'

export const handler = async (event: S3Event, context: Context) => {
  initialiseLogger(context)
  if (!event.Records || event.Records.length !== 1) {
    throw Error(
      `Event record length was ${event.Records.length} not 1, or no Records property found, cannot continue`
    )
  }

  const s3Data = event.Records[0].s3
  const objectKey = s3Data.object.key
  if (await permanentBucketFileExists(objectKey)) {
    logger.info(
      'File to encrypt already found in permanent bucket, so no new encryption will happen',
      { objectKey }
    )
    return
  }

  await encryptAuditData(s3Data.bucket.name, objectKey)

  await s3ChangeStorageClass(
    getEnv('PERMANENT_BUCKET_NAME'),
    objectKey,
    StorageClass.GLACIER
  )
}
