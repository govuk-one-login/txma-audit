import { PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose'
import { logger } from '../../sharedServices/logger'
import { ProcessingResult } from './helper'
import { FirehoseProcessingResult } from './writeToFirehose'

export const parseFirehoseResponse = (
  firehoseResponse: PutRecordBatchCommandOutput,
  processingResults: ProcessingResult[]
): FirehoseProcessingResult => {
  const successMessage = 'SucceededToWriteToFirehose'

  if (firehoseResponse.FailedPutCount && firehoseResponse.FailedPutCount > 0) {
    logger.warn('Some audit events failed to reingest')
    const successfullProcessingResults: ProcessingResult[] = []
    const failedProcessingResults: ProcessingResult[] = []

    firehoseResponse.RequestResponses?.forEach((response, index) => {
      if (response.ErrorCode && processingResults[index]) {
        processingResults[index] = {
          ...processingResults[index],
          statusReason: 'FailedToWriteToFirehose',
          failed: true
        }
        failedProcessingResults.push(processingResults[index])
      } else {
        processingResults[index] = {
          ...processingResults[index],
          statusReason: successMessage,
          failed: false
        }
        successfullProcessingResults.push(processingResults[index])
      }
    })
    return {
      successfullProcessingResults,
      failedProcessingResults
    }
  } else {
    return {
      successfullProcessingResults: processingResults.map((element) => {
        return {
          ...element,
          statusReason: successMessage
        }
      }),
      failedProcessingResults: []
    }
  }
}
