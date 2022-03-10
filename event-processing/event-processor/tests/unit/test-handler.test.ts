import { SQSEvent } from 'aws-lambda';
import { handler } from '../../app';

describe('Unit test for app handler', function () {
    const event: SQSEvent = {
        Records: [
            {
                messageId: 'MessageID_1',
                receiptHandle: 'MessageReceiptHandle',
                body: 'Message Body',
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

    it('successfully stringifies the event', async () => {
        const result = await handler(event);

        const expectedResult = [
            {
                messageId: 'MessageID_1',
                receiptHandle: 'MessageReceiptHandle',
                body: 'Message Body',
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

        expect(result).toEqual(JSON.stringify(expectedResult));
    });
});
