import { SQSBatchItemFailure, SQSEvent } from 'aws-lambda'
import { AuditEvent } from '../../../common/types/auditEvent'
import { tryParseJSON } from '../../../common/utils/helpers/tryParseJson'

export interface ProcessingResult {
  sqsMessageId: string
  failed: boolean
  statusReason: string
  auditEvent?: AuditEvent
}

export interface parseSQSEventReturnType {
  successfullyParsedRecords: ProcessingResult[]
  unsuccessfullyParsedRecords: ProcessingResult[]
}

export const SQSBatchItemFailureFromProcessingResultArray = (
  processingResultArray: ProcessingResult[]
): SQSBatchItemFailure[] => {
  return processingResultArray.map((element) => {
    return { itemIdentifier: element.sqsMessageId }
  })
}

export const generateEventIdLogMessageFromProcessingResult = (
  processingResultArrays: ProcessingResult[][]
) => {
  const logMessage: Record<string, string[]> = {}
  processingResultArrays.forEach((singleProcessingResultArray) => {
    singleProcessingResultArray.forEach((processsingResult) => {
      if (!Object.keys(logMessage).includes(processsingResult.statusReason)) {
        logMessage[`${processsingResult.statusReason}`] = []
      }
      logMessage[`${processsingResult.statusReason}`].push(
        processsingResult.auditEvent?.event_id as string
      )
    })
  })

  return logMessage
}

export const parseSQSEvent = (event: SQSEvent): parseSQSEventReturnType => {
  const results: ProcessingResult[] = event.Records.map((sqsRecord) => {
    const parsedRecord: AuditEvent = tryParseJSON(sqsRecord.body)

    if (typeof parsedRecord.event_id === 'undefined') {
      return {
        sqsMessageId: sqsRecord.messageId,
        failed: true,
        statusReason: 'ParsingJSONError'
      }
    }
    const markedAuditEvent: AuditEvent = {
      ...parsedRecord,
      txma: {
        ...parsedRecord.txma,
        failedSNSPublish: {
          audit: true
        }
      }
    }
    return {
      sqsMessageId: sqsRecord.messageId,
      failed: false,
      statusReason: 'SuccessfullyParsed',
      auditEvent: markedAuditEvent
    }
  })

  const successfullyParsedRecords = results.filter(
    (result) => result.failed === false
  )
  const unsuccessfullyParsedRecords = results.filter(
    (result) => result.failed === true
  )

  return {
    successfullyParsedRecords: successfullyParsedRecords,
    unsuccessfullyParsedRecords: unsuccessfullyParsedRecords
  }
}
