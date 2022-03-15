/* istanbul ignore file */
import { SNSEvent, SQSEvent, SQSRecord, SNSEventRecord } from 'aws-lambda';
import { AuditEvent } from '../../protobuf/audit-event';

export class TestHelper {
    private static sqsRecord: SQSRecord = {
        messageId: 'MessageID_1',
        receiptHandle: 'MessageReceiptHandle',
        body: '',
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
    };

    private static snsEventRecord: SNSEventRecord = {
        EventVersion: '1',
        EventSubscriptionArn: 'SubscriptionArn',
        EventSource: 'Source',
        Sns: {
            SignatureVersion: '1',
            Signature: 'SignatureValue',
            Timestamp: '1609462861',
            SigningCertUrl: 'some/Url',
            Message: '',
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
    };

    static createSNSEventWithEncodedMessage(message: object, numberOfRecords = 1): SNSEvent {
        const encoded = AuditEvent.encode(AuditEvent.fromJSON(message)).finish();

        const snsEvent = {
            Records: Array<SNSEventRecord>(),
        };

        for (let i = 0; i < numberOfRecords; i++) {
            const snsEventRecord: SNSEventRecord = JSON.parse(JSON.stringify(this.snsEventRecord));
            snsEventRecord.Sns.Message = JSON.stringify(JSON.parse(JSON.stringify(encoded)).data);

            snsEvent.Records.push(snsEventRecord);
        }

        return snsEvent;
    }

    static createSQSEventWithEncodedMessage(message: object, numberOfRecords = 1): SQSEvent {
        const encoded = AuditEvent.encode(AuditEvent.fromJSON(message)).finish();

        const sqsEvent = {
            Records: Array<SQSRecord>(),
        };

        for (let i = 0; i < numberOfRecords; i++) {
            const sqsRecord: SQSRecord = JSON.parse(JSON.stringify(this.sqsRecord));
            sqsRecord.body = JSON.stringify(JSON.parse(JSON.stringify(encoded)).data);

            sqsEvent.Records.push(sqsRecord);
        }

        return sqsEvent;
    }
}
