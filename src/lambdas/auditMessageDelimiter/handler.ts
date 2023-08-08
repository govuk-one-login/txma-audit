import {
  FirehoseRecordTransformationStatus,
  FirehoseTransformationEvent,
  FirehoseTransformationEventRecord,
  FirehoseTransformationResult,
  FirehoseTransformationResultRecord
} from 'aws-lambda'

import { logger } from '../../sharedServices/logger'

export const handler = async (
  event: FirehoseTransformationEvent
): Promise<FirehoseTransformationResult> => {
  logger.info(`Received ${event.records.length} records for processing`)

  /* Process the list of records and transform them */
  const transformationResult: FirehoseRecordTransformationStatus = 'Ok'

  const output = event.records.map(
    (record: FirehoseTransformationEventRecord) => {
      const recordData = Buffer.from(record.data, 'base64').toString('utf8')
      const delimitedData = recordData + '\n'
      const payload = Buffer.from(delimitedData, 'utf8').toString('base64')

      return {
        recordId: record.recordId,
        result: transformationResult,
        data: payload
      } as FirehoseTransformationResultRecord
    }
  )

  return { records: output }
}
