/* istanbul ignore file */
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { AuditEvent } from '../../protobuf/audit-event';
import { AuditEvent as UnknownAuditEvent } from '../../tests/test-protobuf/unknown-audit-event';

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

    static createSQSEventWithEncodedMessage(message: Uint8Array, numberOfRecords = 1): SQSEvent {
        const sqsEvent = {
            Records: Array<SQSRecord>(),
        };

        for (let i = 0; i < numberOfRecords; i++) {
            const sqsRecord: SQSRecord = JSON.parse(JSON.stringify(this.sqsRecord));
            sqsRecord.body = JSON.stringify(JSON.parse(JSON.stringify(message)).data);

            sqsEvent.Records.push(sqsRecord);
        }

        return sqsEvent;
    }

    static encodeAuditEvent(message: AuditEvent): Uint8Array {
        return AuditEvent.encode(message).finish();
    }

    static encodeAuditEventWithUnknownField(message: UnknownAuditEvent): Uint8Array {
        return UnknownAuditEvent.encode(message).finish();
    }
}
