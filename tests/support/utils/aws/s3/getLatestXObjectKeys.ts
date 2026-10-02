import { generateCurrentDateAndTimePrefixes } from '../../helpers'
import { listS3Objects } from './listS3Objects'

export const getLatestXObjectKeysFromS3 = async (
  bucket: string,
  objectNo: number
) => {
  // Search the current hour and preceding hours to account for delayed
  // Firehose delivery landing under an earlier hour's prefix.
  const allObjects = (
    await Promise.all(
      generateCurrentDateAndTimePrefixes().map((Prefix) =>
        listS3Objects({ Bucket: bucket, Prefix })
      )
    )
  ).flat()

  const latestXObjects = allObjects
    .filter((element) => {
      return element.LastModified != undefined
    })
    .sort((a, b) => {
      return (
        (b.LastModified as Date).getTime() - (a.LastModified as Date).getTime()
      )
    })
    .slice(0, objectNo)
  return latestXObjects.map((object) => object.Key as string)
}
