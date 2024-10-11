import {
  FirehoseClient,
  PutRecordBatchCommand,
  PutRecordBatchInput,
  PutRecordBatchCommandOutput,
  _Record
} from '@aws-sdk/client-firehose'
import { getEnv } from '../../utils/helpers/getEnv'
import AWSXRay from 'aws-xray-sdk-core'

export const firehosePutRecordBatch = async (
  streamName: string,
  records: _Record[]
): Promise<PutRecordBatchCommandOutput> => {
  const clientRaw = new FirehoseClient({ region: getEnv('AWS_REGION') })
  const client =
    process.env.XRAY_ENABLED === 'true'
      ? AWSXRay.captureAWSv3Client(clientRaw)
      : clientRaw

  const input: PutRecordBatchInput = {
    DeliveryStreamName: streamName,
    Records: records
  }
  const command = new PutRecordBatchCommand(input)

  return await client.send(command)
}
