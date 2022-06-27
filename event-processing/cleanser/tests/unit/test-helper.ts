/* istanbul ignore file */
import { FirehoseTransformationEvent, FirehoseTransformationEventRecord } from 'aws-lambda';
import { IEnrichedAuditEvent } from '../../models/enriched-audit-event';
import {ICleansedEvent} from "../../models/cleansed-event";

export class TestHelper {
    static exampleMessage: IEnrichedAuditEvent = {
        event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
        client_id: 'some-client',
        timestamp: 1609462861,
        timestamp_formatted: '2021-01-23T15:43:21.842',
        event_name: 'AUTHENTICATION_ATTEMPT',
        component_id: 'AUTH',
        user: {
            transaction_id: 'a52f6f87',
            email: 'foo@bar.com',
            phone: '07711223344',
            ip_address: '100.100.100.100',
            session_id: 'c222c1ec',
            persistent_session_id: 'some session id',
            govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
        },
        platform: {
            xray_trace_id: '24727sda4192',
        },
        restricted: {
            experian_ref: 'DSJJSEE29392',
            passport_number: 1040349934,
        },
        extensions: {
            response: 'Authentication successful',
        },
    };

    static exampleResultMessage: ICleansedEvent = {
        event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
        event_name: 'AUTHENTICATION_ATTEMPT',
        component_id: 'AUTH',
        timestamp: 1609462861,
        timestamp_formatted: '2021-01-23T15:43:21.842'
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

    static encodeAuditEvent(message: unknown): string {
        return JSON.stringify(message);
    }
}
