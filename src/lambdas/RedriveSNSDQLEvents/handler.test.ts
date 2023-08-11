import {
  ProcessingResult,
  SQSBatchItemFailureFromProcessingResultArray
} from './handler'

export const baseProcessingResults: ProcessingResult[] = [
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

describe('testing helper functions', () => {
  it('test SQSBatchItemFailureFromProcessingResultArray() to support partial failure response ', async () => {
    const result = SQSBatchItemFailureFromProcessingResultArray(
      baseProcessingResults
    )

    const expectedResult = [
      { itemIdentifier: '123456789' },
      { itemIdentifier: '234567890' },
      { itemIdentifier: '345678901' }
    ]
    expect(result).toStrictEqual(expectedResult)
  })
})
