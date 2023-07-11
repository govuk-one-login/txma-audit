import {
  FirehoseClient,
  PutRecordBatchCommand,
  PutRecordBatchInput,
  _Record
} from '@aws-sdk/client-firehose'
import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { getEnv } from '../../utils/helpers/getEnv'

export const firehosePutRecordBatch = async (
  streamName: string,
  records: _Record[]
): Promise<PutRecordBatchCommandOutput> => {
  const client = new FirehoseClient({ region: getEnv('AWS_REGION') })
  const input: PutRecordBatchInput = {
    DeliveryStreamName: streamName,
    Records: records
  }
  const command = new PutRecordBatchCommand(input)

  return await client.send(command)
}
