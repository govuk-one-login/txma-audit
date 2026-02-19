import { describe, test, expect, beforeAll } from 'vitest'
import { invokeLambdaFunction } from '../../support/utils/aws/lambda/invokeLambda'
import { getEnv } from '../../../common/utils/helpers/getEnv'
import { randomUUID } from 'crypto'
import {
  baseEvent,
  txmaMetaDataEnrichmentSuccessful,
  txmaMetaDataEnrichmentUnsuccessful
} from '../../constants/baseEvent'
import { getAuditEvent } from '../../support/utils/aws/s3/getAuditEvent'

describe('events processed by firehose', () => {
  let eventId1: string
  let eventId2: string
  const timestampMs = 1689936499616
  const timestampMsFormatted = '2023-07-21T10:48:19.616Z'
  let event1: unknown
  let event2: unknown

  beforeAll(async () => {
    eventId1 = randomUUID()
    eventId2 = randomUUID()

    event1 = {
      ...baseEvent,
      ...txmaMetaDataEnrichmentSuccessful,
      event_id: eventId1,
      timestamp_ms: timestampMs,
      timestamp_ms_formatted: timestampMsFormatted
    }

    await invokeLambdaFunction(getEnv('FIREHOSE_DELIVERY_STREAM_NAME'), {
      data: event1,
      firehose: getEnv('FIREHOSE_AUDIT_MESSAGE_BATCH_NAME')
    })
    console.log(`Event ID for ${baseEvent.event_name}: ${eventId1}`)

    event2 = {
      ...baseEvent,
      ...txmaMetaDataEnrichmentUnsuccessful,
      event_id: eventId2,
      timestamp_ms: timestampMs,
      timestamp_ms_formatted: timestampMsFormatted
    }

    await invokeLambdaFunction(getEnv('FIREHOSE_DELIVERY_STREAM_NAME'), {
      data: event2,
      firehose: getEnv('FIREHOSE_AUDIT_MESSAGE_BATCH_NAME')
    })
    console.log(`Event ID for ${baseEvent.event_name}: ${eventId2}`)
  })

  test('Audit event with successful enrichment txma meta data successfully processed and found in Temp Audit S3 Bucket', async () => {
    const eventBodyFromFraudBucket = await getAuditEvent(
      getEnv('AUDIT_BUILD_MESSAGE_BATCH_NAME'),
      eventId1
    )
    expect(eventBodyFromFraudBucket).toEqual(event1)
  })

  test('Audit event with failed enrichment txma meta data successfully processed and found in Temp Audit S3 Bucket', async () => {
    const eventBodyFromFraudBucket = await getAuditEvent(
      getEnv('AUDIT_BUILD_MESSAGE_BATCH_NAME'),
      eventId2
    )
    expect(eventBodyFromFraudBucket).toEqual(event2)
  })
})
