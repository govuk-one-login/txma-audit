import { SQSEvent } from 'aws-lambda'
import { ProcessingResult } from './helper'

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

export const baseSQSEvent = {
  Records: baseProcessingResults.map((result) => {
    const event = JSON.stringify(result.auditEvent)
    const response = {
      messageId: result.sqsMessageId,
      body: event
    }
    return response
  })
} as SQSEvent
