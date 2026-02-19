import { describe, it, expect } from 'vitest'
import { FirehoseClient, PutRecordBatchCommand } from '@aws-sdk/client-firehose'
import { mockClient } from 'aws-sdk-client-mock'
import { firehosePutRecordBatch } from '../../../common/sharedServices/firehose/firehosePutRecordBatch'

describe('firehosePutRecordBatch', () => {
  const firehoseMockClient = mockClient(FirehoseClient)

  const mockFirehoseRecords = [
    {
      Data: Buffer.from(JSON.stringify({ foo: 'bar' }))
    },
    {
      Data: Buffer.from(JSON.stringify({ baz: 'qux' }))
    }
  ]
  const mockDeliveryStreamName = 'mockDeliveryStreamName'

  firehoseMockClient
    .on(PutRecordBatchCommand)
    .resolves({ FailedPutCount: 0, RequestResponses: [] })

  it('should successfully put a batch onto a Firehose stream', async () => {
    const result = await firehosePutRecordBatch(
      mockDeliveryStreamName,
      mockFirehoseRecords
    )

    expect(result).toEqual({ FailedPutCount: 0, RequestResponses: [] })

    const calls = firehoseMockClient.commandCalls(PutRecordBatchCommand)
    expect(calls).toHaveLength(1)
    expect(calls[0].args[0].input).toEqual({
      DeliveryStreamName: mockDeliveryStreamName,
      Records: mockFirehoseRecords
    })
  })
})
