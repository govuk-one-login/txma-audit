import { invokeLambdaFunction } from '../support/utils/aws/lambda/invokeLambda'
import { getEnv } from '../support/utils/getEnv'
import { randomUUID } from 'crypto'
import { baseEvent } from '../constants/baseEvent'
import { getAuditEvent } from '../support/utils/aws/s3/returnS3FileContents'

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
      firehose: getEnv('FIREHOSE_AUDIT_MESSAGE_BATCH_NAME')
    })
    console.log(`Event ID for ${baseEvent.event_name}: ${eventId}`)
  })

  test('Audit event successfully processed and found in Temp Audit S3 Bucket', async () => {
    const eventBodyFromFraudBucket = await getAuditEvent(
      getEnv('AUDIT_BUILD_MESSAGE_BATCH_NAME'),
      eventId
    )
    expect(eventBodyFromFraudBucket).toEqual(event)
  })
})
