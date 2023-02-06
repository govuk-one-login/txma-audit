/* istanbul ignore file */
import { FirehoseTransformationEvent, FirehoseTransformationEventRecord } from 'aws-lambda';
import { Readable } from 'stream';
import { TEST_S3_OBJECT_DATA_STRING } from '../testConstants';

export class TestHelper {
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

    static encodeAuditEvent(message: object): string {
        return JSON.stringify(message);
    }
}

export const createDataStream = (testData: string) => {
    const dataStream = new Readable();
    dataStream.push(testData);
    dataStream.push(null);
    return dataStream;
};
