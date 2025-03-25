import { when } from 'jest-when'
import { logger } from '../../sharedServices/logger'
import { mockLambdaContext } from '../../utils/tests/mockLambdaContext'
import {
  allSuccessFirehoseResponseExpectedResult,
  baseProcessingResults,
  baseSQSEvent
} from '../../utils/tests/test-helpers/redriveSnsDlqTestHelper'
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

jest.mock('./helper', () => ({
  parseSQSEvent: jest.fn(),
  generateEventIdLogMessageFromProcessingResult: jest.fn(),
  SQSBatchItemFailureFromProcessingResultArray: jest.fn()
}))

jest.mock('./writeToFirehose', () => ({
  writeToFirehose: jest.fn()
}))

describe('testing handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(logger, 'info')

    when(parseSQSEvent)
      // .calledWith(baseSQSEvent)
      .mockReturnValue(parseSQSEventResult)

    when(writeToFirehose)
      // .calledWith(parseSQSEventResult.successfullyParsedRecords)
      .mockResolvedValue(allSuccessFirehoseResponseExpectedResult)

    const logMessage: Record<string, string[]> = {
      SucceededToWriteToFirehose: baseProcessingResults.map((element) => {
        return element.auditEvent?.event_id as string
      })
    }

    when(generateEventIdLogMessageFromProcessingResult).mockReturnValue(
      logMessage
    )
  })

  it('No errors processing events', async () => {
    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(parseSQSEventResult.unsuccessfullyParsedRecords)
      .mockReturnValue([])

    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(
        allSuccessFirehoseResponseExpectedResult.failedProcessingResults
      )
      .mockReturnValue([])

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({ batchItemFailures: [] })
  })

  it('Some events failed - parsing json error ', async () => {
    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(parseSQSEventResult.unsuccessfullyParsedRecords)
      .mockReturnValueOnce(parseFailureResults)

    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(
        allSuccessFirehoseResponseExpectedResult.failedProcessingResults
      )
      .mockReturnValue([])

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({ batchItemFailures: parseFailureResults })
  })

  it('Some events failed - sending to firehose error ', async () => {
    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(parseSQSEventResult.unsuccessfullyParsedRecords)
      .mockReturnValueOnce([])

    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(
        allSuccessFirehoseResponseExpectedResult.failedProcessingResults
      )
      .mockReturnValue(firehoseFailureResults)

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({ batchItemFailures: firehoseFailureResults })
  })

  it('Some events failed - sending to firehose error and json parsing error', async () => {
    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(parseSQSEventResult.unsuccessfullyParsedRecords)
      .mockReturnValueOnce(parseFailureResults)

    when(SQSBatchItemFailureFromProcessingResultArray)
      .calledWith(
        allSuccessFirehoseResponseExpectedResult.failedProcessingResults
      )
      .mockReturnValue(firehoseFailureResults)

    const result = await handler(baseSQSEvent, mockLambdaContext)
    expect(result).toStrictEqual({
      batchItemFailures: parseFailureResults.concat(firehoseFailureResults)
    })
  })

  afterEach(() => {
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
