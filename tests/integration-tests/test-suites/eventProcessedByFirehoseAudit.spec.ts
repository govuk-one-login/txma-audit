import { invokeLambdaFunction } from '../support/utils/aws/lambda/invokeLambda'
import { getEnv } from '../support/utils/getEnv'
import mockSQSEvent from '../support/test-auth-event.json'
import { randomUUID } from 'crypto'
import { cloudwatchLogFilters } from '../constants/cloudWatchLogFilters'
import { checkSplunkBucketForEventId } from '../support/utils/aws/s3/checkSplunkBucketForEventId'
import { baseEvent } from '../constants/baseEvent'
import { getAuditEvent } from '../support/utils/aws/s3/returnS3FileContents'

import {
  NestedKeyOf,
  obfuscateSpecifiedProps
} from '../support/utils/obfuscateSpecifiedProps'
import { AuditEvent } from '../support/types/auditEvent'
import { SQSEvent } from 'aws-lambda'
import { logSuccessForEventIdInLogGroup } from '../support/utils/helpers'
import { filterCloudWatchLogs } from '../support/utils/aws/cloudwatch/cloudWatchGetLogs'

describe('events processed by firehose', () => {
  let eventId: string
  let messageId: string
  const timestampMs = 1689936499616
  const timestampMsFormatted = '2023-07-21T10:48:19.616Z'
  let event: unknown

  beforeAll(async () => {
    eventId = randomUUID()
    messageId = randomUUID()

    event = {
      ...baseEvent,
      event_id: eventId,
      timestamp_ms: timestampMs,
      timestamp_ms_formatted: timestampMsFormatted
    }

    await invokeLambdaFunction(getEnv('FIREHOSE_DELIVERY_STREAM_NAME'), {
      data: event,
      firehose: 'audit-message-batch'
    })
    console.log(`Event ID for ${baseEvent.event_name}: ${eventId}`)
  })

  test('Audit event successfully processed, correct fields are obfuscated for a audit event', async () => {
    // // S3 Delimiter Function Cloudwatch Logs
    // const filterDelimiterLogsByUniqueMessageId = await filterCloudWatchLogs(
    //   getEnv('AUDIT_MESSAGE_DELIMITER_LOGS_NAME'),
    //   [cloudwatchLogFilters.eventPublished, messageId]
    // )
    // expect(filterDelimiterLogsByUniqueMessageId).not.toEqual([])
    // logSuccessForEventIdInLogGroup(
    //   eventId,
    //   getEnv('AUDIT_MESSAGE_DELIMITER_LOGS_NAME')
    // )
    // // S3 Copy And Encrypt Function Cloudwatch Logs
    // const filterEncryptLogsByUniqueMessageId = await filterCloudWatchLogs(
    //   getEnv('S3_COPY_AND_ENCRYPT_LOGS_NAME'),
    //   [cloudwatchLogFilters.eventPublished, messageId]
    // )
    // expect(filterEncryptLogsByUniqueMessageId).not.toEqual([])
    // logSuccessForEventIdInLogGroup(
    //   eventId,
    //   getEnv('S3_COPY_AND_ENCRYPT_LOGS_NAME')
    // )

    const eventBodyFromFraudBucket = await getAuditEvent(
      'audit-build-message-batch',
      eventId
    )
    console.log(eventBodyFromFraudBucket)
    expect(eventBodyFromFraudBucket).toEqual(event)
  })
})
