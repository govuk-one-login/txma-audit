import { SNSEvent, SQSEvent } from 'aws-lambda';
import { handler } from '../../app';

describe('Unit test for app handler', function () {
    const sqsEvent: SQSEvent = {
        Records: [
            {
                messageId: 'MessageID_1',
                receiptHandle: 'MessageReceiptHandle',
                body: '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"SomeSessionId"}',
                md5OfBody: 'fce0ea8dd236ccb3ed9b37dae260836f',
                eventSourceARN: 'arn:aws:sqs:us-west-2:123456789012:SQSQueue',
                eventSource: 'aws:sqs',
                awsRegion: 'us-west-2',
                attributes: {
                    ApproximateReceiveCount: '2',
                    SentTimestamp: '1520621625029',
                    SenderId: 'AROAIWPX5BD2BHG722MW4:sender',
                    ApproximateFirstReceiveTimestamp: '1520621634884',
                },
                messageAttributes: {
                    Attribute3: {
                        binaryValue: 'MTEwMA==',
                        stringListValues: ['abc', '123'],
                        binaryListValues: ['MA==', 'MQ==', 'MA=='],
                        dataType: 'Binary',
                    },
                    Attribute2: {
                        stringValue: '123',
                        stringListValues: [],
                        binaryListValues: ['MQ==', 'MA=='],
                        dataType: 'Number',
                    },
                    Attribute1: {
                        stringValue: 'AttributeValue1',
                        stringListValues: [],
                        binaryListValues: [],
                        dataType: 'String',
                    },
                },
            },
        ],
    };
    const snsEvent: SNSEvent = {
        Records: [
            {
                EventVersion: '1',
                EventSubscriptionArn: 'SubscriptionArn',
                EventSource: 'Source',
                Sns: {
                    SignatureVersion: '1',
                    Signature: 'SignatureValue',
                    Timestamp: '1609462861',
                    SigningCertUrl: 'some/Url',
                    Message:
                        '{"eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","requestId":"43143-233Ds-2823-283-dj299j1","sessionId":"c222c1ec","clientId":"some-client","timestamp":1609462861,"timestampFormatted":"2021-01-23T15:43:21.842","eventName":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ipAddress":"100.100.100.100"},"platform":{"xrayTraceId":"24727sda4192"},"restricted":{"experianRef":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistentSessionId":"SomeSessionId"}',
                    MessageId: 'MessageID_1',
                    MessageAttributes: {
                        Attribute1: {
                            Type: 'Attribute1',
                            Value: 'Value1',
                        },
                    },
                    Type: 'SomeType',
                    UnsubscribeUrl: 'UnsubscribeUrl',
                    TopicArn: 'TopicArn',
                    Subject: 'Sport',
                },
            },
        ],
    };

    it('successfully stringifies an SQS event', async () => {
        const expectedResult = '[{\"event_id\":\"66258f3e-82fc-4f61-9ba0-62424e1f06b4\",\"request_id\":\"43143-233Ds-2823-283-dj299j1\",\"session_id\":\"c222c1ec\",\"client_id\":\"some-client\",\"timestamp\":1609462861,\"timestamp_formatted\":\"2021-01-23T15:43:21.842\",\"event_name\":\"AUTHENTICATION_ATTEMPT\",\"user\":{\"id\":\"a52f6f87\",\"email\":\"foo@bar.com\",\"phone\":\"07711223344\",\"ipAddress\":\"100.100.100.100\"},\"platform\":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"SomeSessionId"}]';

        const result = await handler(sqsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('successfully stringifies an SNS event', async () => {
        const expectedResult = [
            {
                messageId: 'MessageID_1',
                receiptHandle: 'MessageReceiptHandle',
                body: '{"eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","requestId":"43143-233Ds-2823-283-dj299j1","sessionId":"c222c1ec","clientId":"some-client","timestamp":1609462861,"timestampFormatted":"2021-01-23T15:43:21.842","eventName":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ipAddress":"100.100.100.100"},"platform":{"xrayTraceId":"24727sda4192"},"restricted":{"experianRef":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistentSessionId":"SomeSessionId"}',
                md5OfBody: 'fce0ea8dd236ccb3ed9b37dae260836f',
                eventSourceARN: 'arn:aws:sqs:us-west-2:123456789012:SQSQueue',
                eventSource: 'aws:sqs',
                awsRegion: 'us-west-2',
                attributes: {
                    ApproximateReceiveCount: '2',
                    SentTimestamp: '1520621625029',
                    SenderId: 'AROAIWPX5BD2BHG722MW4:sender',
                    ApproximateFirstReceiveTimestamp: '1520621634884',
                },
                messageAttributes: {
                    Attribute3: {
                        binaryValue: 'MTEwMA==',
                        stringListValues: ['abc', '123'],
                        binaryListValues: ['MA==', 'MQ==', 'MA=='],
                        dataType: 'Binary',
                    },
                    Attribute2: {
                        stringValue: '123',
                        stringListValues: [],
                        binaryListValues: ['MQ==', 'MA=='],
                        dataType: 'Number',
                    },
                    Attribute1: {
                        stringValue: 'AttributeValue1',
                        stringListValues: [],
                        binaryListValues: [],
                        dataType: 'String',
                    },
                },
            },
        ];

        const result = await handler(snsEvent);

        expect(result).toEqual(JSON.stringify(snsEvent));
    });

    it('throws error when validation fails', async () => {
        const result = await handler(sqsEvent);
    });
});
