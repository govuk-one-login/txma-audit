/* istanbul ignore file */
import {
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord, SNSEvent,
    SNSEventRecord,
    SQSEvent,
    SQSRecord
} from 'aws-lambda';
import { IAuditEvent } from '../../models/audit-event';
import { AuditEvent as UnknownAuditEvent } from '../test-events/unknown-audit-event';
import { ICleansedEvent } from '../../models/cleansed-event';
import { IEnrichedAuditEvent } from '../../models/enriched-audit-event';
import {SNSMessage} from "aws-lambda/trigger/sns";
import {IRedactedAuditEvent} from "../../models/redacted-event";

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

    private static snsMessage: SNSMessage = {
        SignatureVersion: "1",
        Timestamp: "2022-10-25T21:45:07.000Z",
        MessageId: "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        Signature:"",
        Message: "",
        MessageAttributes: {
            Attribute1: {
                Type: "String",
                Value: "TestString"
            },
            Attribute2: {
                Type: "Binary",
                Value: "TestBinary"
            },
        },
        Type: "Notification",
        TopicArn: "arn:aws:sns:eu-west-2:248098332657:EventProcessorSNSTopic-dev",
        Subject: "TestInvoke",
        Token: "",
        SigningCertUrl: "",
        UnsubscribeUrl: "",
    }

    private static snsEventRecord: SNSEventRecord = {
        EventVersion: "1.0",
        EventSubscriptionArn: "arn:aws:sns:eu-west-2:248098332657:EventProcessorSNSTopic-dev:7ba774f7-78cf-43b7-93f4-553e7836640e",
        EventSource: "aws:sns",
        Sns: this.snsMessage,
    }



    private static firehoseTransformationEvent: FirehoseTransformationEvent = {
        invocationId: 'bb5d7530-f7b7-44aa-bc0f-01b76248fbb8',
        deliveryStreamArn: 'arn:aws:firehose:eu-west-2:123456789012:Firehose',
        region: 'eu-west-2',
        records: [],
    };

    private static firehoseTransformationEventRecord: FirehoseTransformationEventRecord = {
        recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
        approximateArrivalTimestamp: 1520621625029,
        /** Base64 encoded */
        data: '',
    };

    static createFirehoseEventWithEncodedMessage(message: string, numberOfRecords = 1): FirehoseTransformationEvent {
        const event = JSON.parse(JSON.stringify(this.firehoseTransformationEvent));
        const encodedMessage: string = Buffer.from(message).toString('base64');

        for (let i = 0; i < numberOfRecords; i++) {
            const record = this.firehoseTransformationEventRecord;
            record.data = encodedMessage;
            event.records.push(record);
        }

        return event;
    }

    static encodeAuditEventArray(message: unknown): string {
        const messages: unknown[] = [];
        messages.push(message);
        return JSON.stringify(messages);
    }

    static createSQSEventWithEncodedMessage(message: string, numberOfRecords = 1): SQSEvent {
        const sqsEvent = {
            Records: Array<SQSRecord>(),
        };

        for (let i = 0; i < numberOfRecords; i++) {
            const sqsRecord: SQSRecord = JSON.parse(JSON.stringify(this.sqsRecord));
            sqsRecord.body = message;

            sqsEvent.Records.push(sqsRecord);
        }

        return sqsEvent;
    }



    static encodeAuditEvent(message: IAuditEvent | ICleansedEvent | IEnrichedAuditEvent | IRedactedAuditEvent ): string {
        return JSON.stringify(message);
    }

    static encodeAuditEventWithUnknownField(message: UnknownAuditEvent): string {
        return JSON.stringify(message);
    }

    static createSNSEventWithEncodedMessage(message: string, numberOfRecords = 1): SNSEvent {
        const snsEvent = {
            Records: Array<SNSEventRecord>(),
        };

        for (let i = 0; i < numberOfRecords; i++) {
            const snsRecord: SNSEventRecord = JSON.parse(JSON.stringify(this.snsEventRecord));
            snsRecord.Sns.Message = message;

            snsEvent.Records.push(snsRecord);
        }

        return snsEvent;
    }
}
