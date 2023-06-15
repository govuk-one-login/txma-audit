import { handler } from './handler'
import { TestHelper } from '../../utils/tests/test-helpers/test-helper'
import { FirehoseTransformationResult } from 'aws-lambda'

describe('Unit test for app eventProcessorHandler', function () {
  const exampleMessage = JSON.stringify({
    timestamp: 1609462861,
    timestamp_formatted: '2021-01-23T15:43:21.842',
    event_name: 'AUTHENTICATION_ATTEMPT',
    component_id: 'AUTH'
  })
  const expectedData = Buffer.from(exampleMessage + '\n').toString('base64')

  it('accepts a payload and stringifies', async () => {
    const expectedResult: FirehoseTransformationResult = {
      records: [
        {
          data: expectedData,
          recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
          result: 'Ok'
        }
      ]
    }
    const firehoseEvent =
      TestHelper.createFirehoseEventWithEncodedMessage(exampleMessage)

    const result = await handler(firehoseEvent)

    expect(result).toEqual(expectedResult)
  })

  it('accepts a payload with multiple messages and stringifies', async () => {
    const expectedResult: FirehoseTransformationResult = {
      records: []
    }
    for (let i = 0; i < 5; i++) {
      expectedResult.records.push({
        data: expectedData,
        recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
        result: 'Ok'
      })
    }
    const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
      exampleMessage,
      5
    )

    const result = await handler(firehoseEvent)

    expect(result).toEqual(expectedResult)
  })
})
