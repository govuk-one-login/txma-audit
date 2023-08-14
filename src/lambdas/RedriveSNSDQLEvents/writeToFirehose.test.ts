import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { when } from 'jest-when'
import { firehosePutRecordBatch } from '../../sharedServices/firehose/firehosePutRecordBatch'
import { logger } from '../../sharedServices/logger'
import { auditEventsToFirehoseRecords } from '../../utils/helpers/firehose/auditEventsToFirehoseRecords'
import { baseProcessingResults } from './redriveSNSDLQTestHelper'
import * as firehoseFunctions from './writeToFirehose'
import { FirehoseProcessingResult, writeToFirehose } from './writeToFirehose'

const baseFirehoseResponse: PutRecordBatchCommandOutput = {
  $metadata: {},
  FailedPutCount: 0,
  RequestResponses: [
    {
      RecordId: `FirehoseId-${baseProcessingResults[0].sqsMessageId}`
    },
    {
      RecordId: `FirehoseId-${baseProcessingResults[1].sqsMessageId}`
    },
    {
      RecordId: `FirehoseId-${baseProcessingResults[2].sqsMessageId}`
    }
  ]
}

const mockFireHoseRecords = [
  {
    Data: Buffer.from('mockData1')
  },
  {
    Data: Buffer.from('mockData2')
  }
]

jest.mock('../../sharedServices/firehose/firehosePutRecordBatch', () => ({
  firehosePutRecordBatch: jest.fn()
}))

jest.mock(
  '../../utils/helpers/firehose/auditEventsToFirehoseRecords.ts',
  () => ({
    auditEventsToFirehoseRecords: jest.fn()
  })
)

describe('test parseFirehoseResponse() function', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(logger, 'warn')
    jest.spyOn(logger, 'info')
  })

  it('all audit events were published to firehose successfully', async () => {
    const allSuccessFirehoseResponse: PutRecordBatchCommandOutput = {
      ...baseFirehoseResponse
    }
    const expectedResult: FirehoseProcessingResult = {
      failedProcessingResults: [],
      successfullProcessingResults: baseProcessingResults.map((element) => {
        return {
          ...element,
          failed: false,
          statusReason: 'SucceededToWriteToFirehose'
        }
      })
    }

    expect(
      firehoseFunctions.parseFirehoseResponse(
        allSuccessFirehoseResponse,
        baseProcessingResults
      )
    ).toStrictEqual(expectedResult)
  })

  it('not all audit events succesfully published to firehose', async () => {
    const partialSuccessFirehoseResponse: PutRecordBatchCommandOutput = {
      ...baseFirehoseResponse,
      FailedPutCount: 1,
      RequestResponses: [
        {
          ErrorCode: 'TestErrorCode'
        },
        {
          RecordId: `FirehoseId-${baseProcessingResults[1].sqsMessageId}`
        },
        {
          RecordId: `FirehoseId-${baseProcessingResults[2].sqsMessageId}`
        }
      ]
    }

    const expectedResult: FirehoseProcessingResult = {
      successfullProcessingResults: baseProcessingResults
        .slice(1)
        .map((element) => {
          return {
            ...element,
            failed: false,
            statusReason: 'SucceededToWriteToFirehose'
          }
        }),
      failedProcessingResults: baseProcessingResults
        .slice(0, 1)
        .map((element) => {
          return {
            ...element,
            failed: true,
            statusReason: 'FailedToWriteToFirehose'
          }
        })
    }
    const result = firehoseFunctions.parseFirehoseResponse(
      partialSuccessFirehoseResponse,
      baseProcessingResults
    )
    expect(result).toStrictEqual(expectedResult)
    expect(logger.warn).toHaveBeenCalledWith(
      'Some audit events failed to reingest'
    )
  })
})

describe('test writeToFirehose() function', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(logger, 'warn')
    jest.spyOn(logger, 'info')
    jest.spyOn(logger, 'error')
    jest.spyOn(firehoseFunctions, 'parseFirehoseResponse')
  })

  it('calls firehosePutRecordBatch() function.', async () => {
    const mockDeliveryStreamName = 'mockDeliveryStreamName'
    when(auditEventsToFirehoseRecords).mockReturnValue(mockFireHoseRecords)
    when(firehosePutRecordBatch).mockResolvedValue(baseFirehoseResponse)

    await writeToFirehose(baseProcessingResults)
    expect(firehosePutRecordBatch).toHaveBeenCalledWith(
      mockDeliveryStreamName,
      mockFireHoseRecords
    )
    expect(firehoseFunctions.parseFirehoseResponse).toHaveBeenCalledWith(
      baseFirehoseResponse,
      baseProcessingResults
    )
  })

  it('calls firehosePutRecordBatch() function. An error is raised', async () => {
    const mockDeliveryStreamName = 'mockDeliveryStreamName'
    const error = new Error('mockError')

    when(auditEventsToFirehoseRecords).mockReturnValue(mockFireHoseRecords)
    when(firehosePutRecordBatch).mockRejectedValue(error)

    const result = await writeToFirehose(baseProcessingResults)
    const expectedResult: FirehoseProcessingResult = {
      successfullProcessingResults: [],
      failedProcessingResults: baseProcessingResults
    }

    expect(firehosePutRecordBatch).toHaveBeenCalledWith(
      mockDeliveryStreamName,
      mockFireHoseRecords
    )
    expect(result).toStrictEqual(expectedResult)
    expect(logger.error).toHaveBeenCalledWith(
      'failed to publish to firehose',
      error
    )
  })
})
