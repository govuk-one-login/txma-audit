import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { logger } from '../../sharedServices/logger'
import { ProcessingResult } from './handler'
import {
  FirehoseProcessingResult,
  parseFirehoseResponse
} from './writeToFirehose'

describe('test parseFirehoseResponse() function', () => {
  const baseProcessingResults: ProcessingResult[] = [
    {
      sqsMessageId: '123456789',
      failed: false,
      statusReason: 'SuccessfullyParsed',
      auditEvent: {
        event_id: '987654321',
        event_name: 'EVENT_ONE',
        timestamp: 1691673691
      }
    },
    {
      sqsMessageId: '234567890',
      failed: false,
      statusReason: 'SuccessfullyParsed',
      auditEvent: {
        event_id: '098765432',
        event_name: 'EVENT_TWO',
        timestamp: 1691673691
      }
    },
    {
      sqsMessageId: '345678901',
      failed: false,
      statusReason: 'SuccessfullyParsed',
      auditEvent: {
        event_id: '109876543',
        event_name: 'EVENT_THREE',
        timestamp: 1691673691
      }
    }
  ]

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
      parseFirehoseResponse(allSuccessFirehoseResponse, baseProcessingResults)
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
    const result = parseFirehoseResponse(
      partialSuccessFirehoseResponse,
      baseProcessingResults
    )
    expect(result).toStrictEqual(expectedResult)
    expect(logger.warn).toHaveBeenCalledWith(
      'Some audit events failed to reingest'
    )
  })
})
