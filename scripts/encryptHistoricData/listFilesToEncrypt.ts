import { _Object, StorageClass } from '@aws-sdk/client-s3'
import { getEnv } from '../../src/utils/helpers'
import { listAuditFilesForDateRange } from './listAuditFilesForDateRange'

export const listFilesToEncrypt = async (parameters: {
  dateFrom: string
  dateTo: string
}): Promise<{ glacierFiles: string[]; standardFiles: string[] }> => {
  const auditFilesInLegacyBucket = await listAuditFilesForDateRange({
    dateFrom: parameters.dateFrom,
    dateTo: parameters.dateTo,
    bucketName: getEnv('LEGACY_AUDIT_BUCKET_NAME')
  })

  const alreadyEncryptedDataForDateRange = await listAuditFilesForDateRange({
    dateFrom: parameters.dateFrom,
    dateTo: parameters.dateTo,
    bucketName: getEnv('AUDIT_PERMANENT_BUCKET_NAME')
  })

  const filesNeedingEncryption = await filterFileListForAlreadyEncryptedData(
    auditFilesInLegacyBucket,
    alreadyEncryptedDataForDateRange
  )
  return {
    glacierFiles: getS3KeysForStorageClass(
      filesNeedingEncryption,
      StorageClass.GLACIER
    ),
    standardFiles: getS3KeysForStorageClass(
      filesNeedingEncryption,
      StorageClass.STANDARD
    )
  }
}

const getS3KeysForStorageClass = (
  files: _Object[],
  storageClass: StorageClass
): string[] => {
  return files
    .filter((f) => f.StorageClass === storageClass)
    .map((f) => f.Key as string)
}

const filterFileListForAlreadyEncryptedData = async (
  fileList: _Object[],
  alreadyEncryptedDataForDateRange: _Object[]
): Promise<_Object[]> => {
  return fileList.filter(
    (file) =>
      !alreadyEncryptedDataForDateRange.some(
        (alreadyEncryptedFile) => alreadyEncryptedFile.Key == file.Key
      )
  )
}
