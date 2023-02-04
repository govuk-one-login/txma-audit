import {
  FirehoseRecordTransformationStatus,
  FirehoseTransformationEvent,
  FirehoseTransformationEventRecord,
  FirehoseTransformationResult,
  FirehoseTransformationResultRecord
} from 'aws-lambda'

export const handler = async (
  event: FirehoseTransformationEvent
): Promise<FirehoseTransformationResult> => {
  /* Process the list of records and transform them */
  const transformationResult: FirehoseRecordTransformationStatus = 'Ok'

  const output = event.records.map(
    (record: FirehoseTransformationEventRecord) => {
      const recordData = new Buffer(record.data, 'base64').toString('utf8')
      const delimitedData = recordData + '\n'
      const payload = new Buffer(delimitedData, 'utf8').toString('base64')

      return {
        recordId: record.recordId,
        result: transformationResult,
        data: payload
      } as FirehoseTransformationResultRecord
    }
  )

  return { records: output }
}
