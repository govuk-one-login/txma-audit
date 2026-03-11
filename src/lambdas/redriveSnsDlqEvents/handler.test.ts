import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logger } from '../../../common/sharedServices/logger'
import { mockLambdaContext } from '../../../common/utils/tests/mockLambdaContext'
import {
  allSuccessFirehoseResponseExpectedResult,
  baseProcessingResults,
  baseSQSEvent
} from '../../../common/utils/tests/test-helpers/redriveSnsDlqTestHelper'
import { handler } from './handler'
import {
  generateEventIdLogMessageFromProcessingResult,
  parseSQSEvent,
  SQSBatchItemFailureFromProcessingResultArray
} from './helper'
import { writeToFirehose } from './writeToFirehose'

const parseSQSEventResult = {
  successfullyParsedRecords: baseProcessingResults.slice(),
  unsuccessfullyParsedRecords: []
}

const parseFailureResults = baseProcessingResults.map((element) => {
  return { itemIdentifier: element.sqsMessageId.concat('json') }
})

const firehoseFailureResults = baseProcessingResults.map((element) => {
  return { itemIdentifier: element.sqsMessageId.concat('firehose') }
})

vi.mock('./helper', () => ({
  parseSQSEvent: vi.fn(),
  generateEventIdLogMessageFromProcessingResult: vi.fn(),
  SQSBatchItemFailureFromProcessingResultArray: vi.fn()
}))

vi.mock('./writeToFirehose', () => ({
  writeToFirehose: vi.fn()
}))

describe('testing handler', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(logger, 'info')
    vi.mocked(parseSQSEvent).mockReturnValue(parseSQSEventResult)
    vi.mocked(writeToFirehose).mockResolvedValue(
      allSuccessFirehoseResponseExpectedResult
    )

    const logMessage: Record<string, string[]> = {
      SucceededToWriteToFirehose: baseProcessingResults.map((element) => {
        return element.auditEvent?.event_id as string
      })
    }

    vi.mocked(generateEventIdLogMessageFromProcessingResult).mockReturnValue(
      logMessage
    )
  })

  it('No errors processing events', async () => {
    vi.mocked(SQSBatchItemFailureFromProcessingResultArray).mockReturnValue([])

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({ batchItemFailures: [] })

    expect(logger.info).toHaveBeenCalledWith(
      'processed the following event ids',
      {
        event_id: generateEventIdLogMessageFromProcessingResult([
          allSuccessFirehoseResponseExpectedResult.failedProcessingResults,
          allSuccessFirehoseResponseExpectedResult.successfullProcessingResults
        ])
      }
    )
  })

  it('Some events failed - parsing json error', async () => {
    vi.mocked(SQSBatchItemFailureFromProcessingResultArray)
      .mockReturnValueOnce(parseFailureResults)
      .mockReturnValueOnce([])

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({ batchItemFailures: parseFailureResults })

    expect(logger.info).toHaveBeenCalledWith(
      'processed the following event ids',
      {
        event_id: generateEventIdLogMessageFromProcessingResult([
          allSuccessFirehoseResponseExpectedResult.failedProcessingResults,
          allSuccessFirehoseResponseExpectedResult.successfullProcessingResults
        ])
      }
    )
  })

  it('Some events failed - sending to firehose error', async () => {
    vi.mocked(SQSBatchItemFailureFromProcessingResultArray)
      .mockReturnValueOnce([])
      .mockReturnValueOnce(firehoseFailureResults)

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({ batchItemFailures: firehoseFailureResults })
  })

  it('Some events failed - sending to firehose error and json parsing error', async () => {
    vi.mocked(SQSBatchItemFailureFromProcessingResultArray)
      .mockReturnValueOnce(parseFailureResults)
      .mockReturnValueOnce(firehoseFailureResults)

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({
      batchItemFailures: parseFailureResults.concat(firehoseFailureResults)
    })

    expect(logger.info).toHaveBeenCalledWith(
      'processed the following event ids',
      {
        event_id: generateEventIdLogMessageFromProcessingResult([
          allSuccessFirehoseResponseExpectedResult.failedProcessingResults,
          allSuccessFirehoseResponseExpectedResult.successfullProcessingResults
        ])
      }
    )
  })
})
