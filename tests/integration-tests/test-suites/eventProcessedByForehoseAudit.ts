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
  
    test('Fraud event successfully processed, correct fields are obfuscated for a fraud event', async () => {
      const filterLogsByUniqueMessageId = await filterCloudWatchLogs(
        getEnv('AUDIT_MESSAGE_DELIVERY_STREAM_LOG_GROUP_NAME'),
        [cloudwatchLogFilters.eventPublished, messageId]
      )
      expect(filterLogsByUniqueMessageId).not.toEqual([])
      logSuccessForEventIdInLogGroup(
        eventId,
        getEnv('AUDIT_MESSAGE_DELIVERY_STREAM_LOG_GROUP_NAME')
      )
  
      const filterLogsByFirehoseSuccessMessage = await filterCloudWatchLogs(
        getEnv('FRAUD_SPLUNK_TRANSFORMATION_LOG_GROUP_NAME'),
        [cloudwatchLogFilters.firehouseSuccess, eventId]
      )
      expect(filterLogsByFirehoseSuccessMessage).not.toEqual([])
      logSuccessForEventIdInLogGroup(
        eventId,
        getEnv('FRAUD_SPLUNK_TRANSFORMATION_LOG_GROUP_NAME')
      )
  
      const eventBodyFromFraudBucket = await getAuditEvent(
        getEnv('FRAUD_SPLUNK_DELIVERY_TEST_BUCKET_NAME'),
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
      console.log('Fraud event successfully obfuscated and sent to splunk')
    })
  
    test('Performance event successfully processed, correct fields are obfuscated and removed for a performance event', async () => {
      const filterLogsByUniqueMessageId = await filterCloudWatchLogs(
        getEnv('AUDIT_MESSAGE_DELIVERY_STREAM_LOG_GROUP_NAME'),
        [cloudwatchLogFilters.eventPublished, messageId]
      )
      expect(filterLogsByUniqueMessageId).not.toEqual([])
      logSuccessForEventIdInLogGroup(
        eventId,
        getEnv('AUDIT_MESSAGE_DELIVERY_STREAM_LOG_GROUP_NAME')
      )
  
      const filterLogsByFirehoseSuccessMessage = await filterCloudWatchLogs(
        getEnv('PERFORMANCE_SPLUNK_TRANSFORMATION_LOG_GROUP_NAME'),
        [cloudwatchLogFilters.firehouseSuccess, eventId]
      )
      expect(filterLogsByFirehoseSuccessMessage).not.toEqual([])
      logSuccessForEventIdInLogGroup(
        eventId,
        getEnv('PERFORMANCE_SPLUNK_TRANSFORMATION_LOG_GROUP_NAME')
      )
  
      const eventSentToSplunk = await checkSplunkBucketForEventId(
        getEnv('PERFORMANCE_SPLUNK_DELIVERY_TEST_BUCKET_NAME'),
        eventId
      )
  
      expect(eventSentToSplunk).toBe(true)
  
      const eventBodyFromPerfBucket = await getAuditEvent(
        getEnv('PERFORMANCE_SPLUNK_DELIVERY_TEST_BUCKET_NAME'),
        eventId
      )
  
      const requiredProps = ['user'] as NestedKeyOf<AuditEvent>[]
  
      const obfuscatedProps = obfuscateSpecifiedProps(
        baseEvent,
        requiredProps,
        getEnv('PERFORMANCE_HMAC_KEY')
      ) as Partial<AuditEvent>
  
      const testUserObject = {
        user_id: obfuscatedProps.user?.user_id,
        govuk_signin_journey_id: baseEvent.user?.govuk_signin_journey_id
      }
  
      const expectedBodyWithObfuscatedandRedactedFields: AuditEvent = {
        event_name: baseEvent.event_name,
        component_id: baseEvent.component_id,
        timestamp: baseEvent.timestamp,
        timestamp_formatted: baseEvent.timestamp_formatted,
        event_id: eventId,
        user: testUserObject,
        txma: { obfuscated: true },
        extensions: {
          evidence: [
            {
              activityHistoryScore: 'blah',
              identityFraudScore: 'blah',
              strengthScore: 'blah',
              validityScore: 'blah',
              verificationScore: 'blah'
            }
          ]
        }
      }
  
      expect(eventBodyFromPerfBucket).toEqual(
        expectedBodyWithObfuscatedandRedactedFields
      )
    })
  })  