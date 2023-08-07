import { SQSEvent, Context, SQSBatchResponse } from 'aws-lambda'
import { tryParseJSON } from '../../utils/helpers/tryParseJson'
import { initialiseLogger, logger } from '../../sharedServices/logger'
export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  initialiseLogger(context)

  const results = event.Records.map((sqsRecord) => {
    const parsedRecord = tryParseJSON(sqsRecord.body)
    logger.info('parsedRecord', { parsedRecord })
    return sqsRecord.messageId
  })

  logger.info('sqs message ids', {
    messageId: results
  })

  return {
    batchItemFailures: []
  }
}
