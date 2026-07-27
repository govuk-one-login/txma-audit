import { describe, test, expect, beforeAll } from 'vitest'
import { invokeLambdaFunction } from '../../support/utils/aws/lambda/invokeLambda'
import { getEnv } from '../../../common/utils/helpers/getEnv'
import { getRawAuditEvent } from '../../support/utils/aws/s3/getRawAuditEvent'

describe('malformed events processed by firehose', () => {
  const malformedPayload = '!!!invalid-payload###'

  beforeAll(async () => {
    await invokeLambdaFunction(getEnv('FIREHOSE_DELIVERY_STREAM_NAME'), {
      data: malformedPayload,
      firehose: getEnv('FIREHOSE_AUDIT_MESSAGE_BATCH_NAME')
    })
  })

  test('Malformed event payload is handled gracefully and found in Temp Audit S3 Bucket', async () => {
    const eventBodyFromAuditBucket = await getRawAuditEvent(
      getEnv('AUDIT_BUILD_MESSAGE_BATCH_NAME'),
      malformedPayload
    )
    expect(eventBodyFromAuditBucket).toContain(malformedPayload)
  })
})
