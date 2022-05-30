/* istanbul ignore file */
import { FirehoseTransformationEvent, FirehoseTransformationEventRecord } from 'aws-lambda';
import { IAuditEvent } from '../../models/audit-event';

export class TestHelper {
    static exampleMessage: IAuditEvent = {
        event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
        govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
        session_id: 'c222c1ec',
        client_id: 'some-client',
        timestamp: 1609462861,
        timestamp_formatted: '2021-01-23T15:43:21.842',
        event_name: 'AUTHENTICATION_ATTEMPT',
        component_id: '1234',
        user: {
            transaction_id: 'a52f6f87',
            email: 'foo@bar.com',
            phone: '07711223344',
            ip_address: '100.100.100.100',
        },
        platform: {
            xray_trace_id: '24727sda4192',
        },
        restricted: {
            experian_ref: 'DSJJSEE29392',
        },
        extensions: {
            response: 'Authentication successful',
        },
        persistent_session_id: 'some session id',
        service_name: '',
    };

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

    static encodeAuditEvent(message: unknown): string {
        return JSON.stringify(message);
    }
}
