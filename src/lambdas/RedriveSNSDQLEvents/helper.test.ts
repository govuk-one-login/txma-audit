import { SQSEvent } from 'aws-lambda'
import { AuditEvent } from '../../types/auditEvent'
import {
  generateEventIdLogMessageFromProcessingResult,
  parseSQSEvent,
  ProcessingResult,
  SQSBatchItemFailureFromProcessingResultArray
} from './helper'

export const baseProcessingResults: ProcessingResult[] = [
  {
    sqsMessageId: '123456789',
    failed: false,
    statusReason: 'SuccessfullyParsed',
    auditEvent: {
      event_id: '987654321',
      event_name: 'EVENT_ONE',
      timestamp: 1691673691,
      txma: {
        failedSNSPublish: {
          audit: true
        }
      }
    }
  },
  {
    sqsMessageId: '234567890',
    failed: false,
    statusReason: 'SuccessfullyParsed',
    auditEvent: {
      event_id: '098765432',
      event_name: 'EVENT_TWO',
      timestamp: 1691673691,
      txma: {
        failedSNSPublish: {
          audit: true
        }
      }
    }
  },
  {
    sqsMessageId: '345678901',
    failed: false,
    statusReason: 'SuccessfullyParsed',
    auditEvent: {
      event_id: '109876543',
      event_name: 'EVENT_THREE',
      timestamp: 1691673691,
      txma: {
        failedSNSPublish: {
          audit: true
        }
      }
    }
  }
]

const baseSQSEvent = {
  Records: baseProcessingResults.map((result) => {
    const event = JSON.stringify(result.auditEvent)
    const response = {
      messageId: result.sqsMessageId,
      body: event
    }
    return response
  })
} as SQSEvent

jest.mock('./handler', () => ({
  parseSQSEvent: jest.fn()
}))

describe('testing helper functions', () => {
  it('test SQSBatchItemFailureFromProcessingResultArray() to support partial failure response ', async () => {
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

  it('test generateLogMessageFromProcessingResult()', async () => {
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

  it('test parseSQSEvent(). All records successfully parsed', async () => {
    const result = parseSQSEvent(baseSQSEvent)
    const expectedResult = {
      successfullyParsedRecords: baseProcessingResults.slice(),
      unsuccessfullyParsedRecords: []
    }
    expect(result).toStrictEqual(expectedResult)
  })

  it('test parseSQSEvent(). partial records successfully parsed', async () => {
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
