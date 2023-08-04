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
              event_id: eventId,
              timestamp_ms: timestampMs,
              timestamp_ms_formatted: timestampMsFormatted
            })
          }
        ]
      }
  
      await invokeLambdaFunction(getEnv('FIREHOSE_DELIVERY_STREAM_NAME'), event)
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
        getEnv('TEMPORARY_MESSAGE_BATCH_BUCKET_NAME'),
        eventId
      )
  
      const requiredProps = ['restricted', 'user'] as NestedKeyOf<AuditEvent>[]
  
      const obfuscatedProps = obfuscateSpecifiedProps(
        baseEvent,
        requiredProps,
        getEnv('FRAUD_HMAC_KEY')
      ) as Partial<AuditEvent>
  
      const testUserObject = {
        transaction_id: obfuscatedProps.user?.transaction_id,
        email: obfuscatedProps.user?.email,
        phone: obfuscatedProps.user?.phone,
        device_id: obfuscatedProps.user?.device_id,
        govuk_signin_journey_id: baseEvent.user?.govuk_signin_journey_id,
        ip_address: baseEvent.user?.ip_address,
        session_id: baseEvent.user?.session_id,
        persistent_session_id: baseEvent.user?.persistent_session_id,
        user_id: baseEvent.user?.user_id
      }

      const expectedBodyWithObfuscatedFields = {
        ...baseEvent,
        event_id: eventId,
        restricted: obfuscatedProps.restricted,
        timestamp_ms: timestampMs,
        timestamp_ms_formatted: timestampMsFormatted,
        user: testUserObject,
        txma: { obfuscated: true },
        extensions: {
          iss: baseEvent.extensions?.iss,
          successful: baseEvent.extensions?.successful,
          levelOfConfidence: baseEvent.extensions?.levelOfConfidence,
          'mfa-type': 'blah',
          'notification-type': 'blah',
          'client-name': 'blah',
          isNewAccount: baseEvent.extensions?.isNewAccount,
          evidence: baseEvent.extensions?.evidence,
          gpg45Scores: baseEvent.extensions?.gpg45Scores
        }
      }
  
      expect(eventBodyFromFraudBucket).toEqual(expectedBodyWithObfuscatedFields)
      console.log('Fraud event successfully obfuscated')
    })
  })  