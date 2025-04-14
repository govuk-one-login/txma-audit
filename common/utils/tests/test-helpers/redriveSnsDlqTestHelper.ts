import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { SQSEvent } from 'aws-lambda'
import { ProcessingResult } from '../../../../src/lambdas/redriveSnsDlqEvents/helper'
import { FirehoseProcessingResult } from '../../../../src/lambdas/redriveSnsDlqEvents/writeToFirehose'

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
        obfuscated: true,
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

export const baseFirehoseResponse: PutRecordBatchCommandOutput = {
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

export const mockFireHoseRecords = [
  {
    Data: Buffer.from('mockData1')
  },
  {
    Data: Buffer.from('mockData2')
  }
]

export const allSuccessFirehoseResponseExpectedResult: FirehoseProcessingResult =
  {
    failedProcessingResults: [],
    successfullProcessingResults: baseProcessingResults.map((element) => {
      return {
        ...element,
        failed: false,
        statusReason: 'SucceededToWriteToFirehose'
      }
    })
  }
