import { generateCurrentDateAndTimePrefix } from '../../helpers'
import { listS3Objects } from './listS3Objects'

export const getLatestXObjectKeysFromS3 = async (
  bucket: string,
  objectNo: number
) => {
  const input = {
    Bucket: bucket,
    Prefix: generateCurrentDateAndTimePrefix()
  }
  const latestXObjects = (await listS3Objects(input))
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
