import {
  PutRecordBatchCommand,
  PutRecordBatchInput,
  PutRecordBatchCommandOutput,
  _Record
} from '@aws-sdk/client-firehose'
import AWSXRay from 'aws-xray-sdk-core'
import { firehoseClient as firehoseClientRaw } from '../../utils/awsSdkClients'

export const firehosePutRecordBatch = async (
  streamName: string,
  records: _Record[]
): Promise<PutRecordBatchCommandOutput> => {
  const client =
    process.env.XRAY_ENABLED === 'true'
      ? AWSXRay.captureAWSv3Client(firehoseClientRaw)
      : firehoseClientRaw

  const input: PutRecordBatchInput = {
    DeliveryStreamName: streamName,
    Records: records
  }
  const command = new PutRecordBatchCommand(input)

  return await client.send(command)
}
