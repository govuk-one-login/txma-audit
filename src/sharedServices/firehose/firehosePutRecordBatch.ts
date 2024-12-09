import {
  PutRecordBatchCommand,
  PutRecordBatchInput,
  PutRecordBatchCommandOutput,
  _Record
} from '@aws-sdk/client-firehose'
import { firehoseClient } from '../../utils/awsSdkClients'

export const firehosePutRecordBatch = async (
  streamName: string,
  records: _Record[]
): Promise<PutRecordBatchCommandOutput> => {
  const input: PutRecordBatchInput = {
    DeliveryStreamName: streamName,
    Records: records
  }
  const command = new PutRecordBatchCommand(input)

  return await firehoseClient.send(command)
}
