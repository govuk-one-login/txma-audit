import { _Object } from '@aws-sdk/client-s3'
import { listS3FilesForPrefix } from './listS3FilesForPrefix'
import { getAuditFilePrefixesForDates } from './getAuditFilePrefixesForDates'

export const listAuditFilesForDateRange = async (parameters: {
  dateFrom: string
  dateTo: string
  bucketName: string
}): Promise<_Object[]> => {
  return await Promise.all(
    getAuditFilePrefixesForDates(parameters.dateFrom, parameters.dateTo).map(
      (prefix) =>
        listS3FilesForPrefix({ Bucket: parameters.bucketName, Prefix: prefix })
    )
  ).then((objects: _Object[][]) => objects.flat())
}
