import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { logger } from '../../sharedServices/logger'
import {
  allSuccessFirehoseResponseExpectedResult,
  baseFirehoseResponse,
  baseProcessingResults
} from '../../utils/tests/test-helpers/redriveSnsDlqTestHelper'
import * as parseFirehoseResponse from './parseFirehoseResponse'
import { FirehoseProcessingResult } from './writeToFirehose'

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

    expect(
      parseFirehoseResponse.parseFirehoseResponse(
        allSuccessFirehoseResponse,
        baseProcessingResults
      )
    ).toStrictEqual(allSuccessFirehoseResponseExpectedResult)
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
    const result = parseFirehoseResponse.parseFirehoseResponse(
      partialSuccessFirehoseResponse,
      baseProcessingResults
    )
    expect(result).toStrictEqual(expectedResult)
    expect(logger.warn).toHaveBeenCalledWith(
      'Some audit events failed to reingest'
    )
  })
})
