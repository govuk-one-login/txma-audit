import { SQSEvent } from 'aws-lambda'
import { AuditEvent } from '../../../common/types/auditEvent'
import {
  baseProcessingResults,
  baseSQSEvent
} from '../../../common/utils/tests/test-helpers/redriveSnsDlqTestHelper'
import {
  generateEventIdLogMessageFromProcessingResult,
  parseSQSEvent,
  ProcessingResult,
  SQSBatchItemFailureFromProcessingResultArray
} from './helper'

jest.mock('./handler', () => ({
  parseSQSEvent: jest.fn()
}))

describe('testing helper functions', () => {
  it('test SQSBatchItemFailureFromProcessingResultArray() to support partial failure response', () => {
    const result = SQSBatchItemFailureFromProcessingResultArray(
      baseProcessingResults
    )

    const expectedResult = baseProcessingResults.map((result) => {
      return {
        itemIdentifier: result.sqsMessageId
      }
    })

    expect(result).toStrictEqual(expectedResult)
  })

  it('test generateLogMessageFromProcessingResult()', () => {
    const testInput: ProcessingResult[][] = [
      baseProcessingResults.slice(),
      baseProcessingResults.map((element) => {
        return {
          ...element,
          statusReason: 'ParsingJSONError'
        }
      })
    ]

    const result = generateEventIdLogMessageFromProcessingResult(testInput)
    const expectedResult = {
      SuccessfullyParsed: testInput[0].map((result) => {
        return result.auditEvent?.event_id
      }),
      ParsingJSONError: testInput[1].map((result) => {
        return result.auditEvent?.event_id
      })
    }
    expect(result).toStrictEqual(expectedResult)
  })

  it('test parseSQSEvent(). All records successfully parsed', () => {
    const result = parseSQSEvent(baseSQSEvent)
    const expectedResult = {
      successfullyParsedRecords: baseProcessingResults.slice(),
      unsuccessfullyParsedRecords: []
    }
    expect(result).toStrictEqual(expectedResult)
  })

  it('test parseSQSEvent(). partial records successfully parsed', () => {
    const partialyInvalidSQSEvent = {
      Records: baseProcessingResults.map((result, index) => {
        if (index === 0) {
          const event = result.auditEvent as AuditEvent
          delete event.event_id
          const tweakedEvent = JSON.stringify(event)
          const response = {
            messageId: result.sqsMessageId,
            body: tweakedEvent
          }
          return response
        } else {
          const event = JSON.stringify(result.auditEvent)
          const response = {
            messageId: result.sqsMessageId,
            body: event
          }
          return response
        }
      })
    } as SQSEvent

    const result = parseSQSEvent(partialyInvalidSQSEvent)
    const expectedResult = {
      successfullyParsedRecords: baseProcessingResults.slice(1),
      unsuccessfullyParsedRecords: baseProcessingResults
        .slice(0, 1)
        .map((processingResult) => {
          const tweakedProcessingResult = { ...processingResult }
          delete tweakedProcessingResult.auditEvent

          return {
            ...tweakedProcessingResult,
            failed: true,
            statusReason: 'ParsingJSONError'
          }
        })
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
