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
  
    beforeAll(async () => {
      eventId = randomUUID()
      messageId = randomUUID()
  
      const event: SQSEvent = {
        Records: [
          {
            ...mockSQSEvent.Records[0],
            messageId: messageId,
            body: JSON.stringify({
              ...baseEvent,
              event_id: eventId
            })
          }
        ]
      }
  
      await invokeLambdaFunction(getEnv('AUDIT_MESSAGE_DELIMITER_FUNCTION_NAME'), event)
      console.log(`Event ID for ${baseEvent.event_name}: ${eventId}`)
    })
    // Hits lambda directly - Remove and hit infra firehose function instead
  
    /*
    Test logs of everything downstream. First should be correct for 1st lambda
    Replace below Splunk references with correct Audit components:
    - The Log group of the Delimiter function (Covered)
    - The Log group of the Encrypt function (Next Lambda)

    Check if we should be checking the S3 buckets also - Add to template regardless
    */
    test('Audit event successfully processed, correct fields are obfuscated for a audit event', async () => {
      // S3 Delimiter Function Cloudwatch Logs
      const filterDelimiterLogsByUniqueMessageId = await filterCloudWatchLogs(
        getEnv('AUDIT_MESSAGE_DELIMITER_LOGS_NAME'),
        [cloudwatchLogFilters.eventPublished, messageId]
      )
      expect(filterDelimiterLogsByUniqueMessageId).not.toEqual([])
      logSuccessForEventIdInLogGroup(
        eventId,
        getEnv('AUDIT_MESSAGE_DELIMITER_LOGS_NAME')
      )
      // S3 Copy And Encrypt Function Cloudwatch Logs
      const filterEncryptLogsByUniqueMessageId = await filterCloudWatchLogs(
        getEnv('S3_COPY_AND_ENCRYPT_LOGS_NAME'),
        [cloudwatchLogFilters.eventPublished, messageId]
      )
      expect(filterEncryptLogsByUniqueMessageId).not.toEqual([])
      logSuccessForEventIdInLogGroup(
        eventId,
        getEnv('S3_COPY_AND_ENCRYPT_LOGS_NAME')
      )
    })
  })  