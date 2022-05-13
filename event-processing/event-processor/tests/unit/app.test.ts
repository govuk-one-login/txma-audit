/* eslint-disable */
import { handler } from '../../app';
import { TestHelper } from './test-helper';
import { IAuditEvent } from '../../models/audit-event';
import { AuditEvent as UnknownAuditEvent } from '../../tests/test-events/unknown-audit-event';

describe('Unit test for app handler', function () {
    let consoleWarningMock: jest.SpyInstance;

    beforeEach(() => {
        consoleWarningMock = jest.spyOn(global.console, 'log');
    });

    afterEach(() => {
       consoleWarningMock.mockRestore();
    });

    it('accepts a bare minimum payload and stringifies', async () => {
        const expectedResult =
            '[{"event_id":"","request_id":"","session_id":"","client_id":"","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","persistent_session_id":""}]';

        const exampleMessage: IAuditEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        const result = await handler(sqsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('successfully stringifies an SQS event', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"}]';

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
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
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        const result = await handler(sqsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('successfully stringifies multiple events', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"},' +
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"}]';

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
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
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage), 2);

        const result = await handler(sqsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('successfully removes unrecognised elements from an audit event and user field and then logs to cloudwatch', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"}]';

        const exampleMessage: UnknownAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            user: {
                transaction_id: 'a52f6f87',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                unknown_user_field: 'some unknown user field'
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
            new_unknown_field: "an unknown field"
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEventWithUnknownField(exampleMessage));

        const result = await handler(sqsEvent);
        
        expect(result).toEqual(expectedResult);
        expect(consoleWarningMock).toHaveBeenCalledTimes(1);
        expect(consoleWarningMock).toHaveBeenCalledWith('[WARN] UNKNOWN FIELDS\n{"sqsResourceName":"arn:aws:sqs:us-west-2:123456789012:SQSQueue","eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","eventName":"AUTHENTICATION_ATTEMPT","timestamp":"1609462861","message":"Unknown fields in message.","unknownFields":[{"key":"new_unknown_field","fieldName":"AuditEvent"},{"key":"unknown_user_field","fieldName":"User"}]}');
    });

    it('successfully populates missing formatted timestamp fields', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-01T01:01:01.000Z","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"}]';

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '',
            event_name: 'AUTHENTICATION_ATTEMPT',
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
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        const result = await handler(sqsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('logs an error when validation fails on event name', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"},' +
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"}]';

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
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
        };

        const exampleInvalidMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: '',
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
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage), 2);
        const sqsEventWithInvalidMessage = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleInvalidMessage));

        sqsEvent.Records.push(...sqsEventWithInvalidMessage.Records)

        const result = await handler(sqsEvent);

        expect(consoleWarningMock).toHaveBeenCalledTimes(1);
        expect(consoleWarningMock).toHaveBeenCalledWith('[ERROR] VALIDATION ERROR\n{"requireFieldErrors":[{"sqsResourceName":"arn:aws:sqs:us-west-2:123456789012:SQSQueue","eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","eventName":"","timestamp":"1609462861","requiredField":"event_name","message":"event_name is a required field."}]}')
        expect(result).toEqual(expectedResult);
    });

    it('logs an error when validation fails on timestamp', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"},' +
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"},"persistent_session_id":"some session id"}]';

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
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
        };

        const exampleInvalidMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: 0,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
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
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage), 2);
        const sqsEventWithInvalidMessage = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleInvalidMessage));

        sqsEvent.Records.push(...sqsEventWithInvalidMessage.Records)

        const result = await handler(sqsEvent);

        expect(consoleWarningMock).toHaveBeenCalledTimes(1);
        expect(consoleWarningMock).toHaveBeenCalledWith('[ERROR] VALIDATION ERROR\n{"requireFieldErrors":[{"sqsResourceName":"arn:aws:sqs:us-west-2:123456789012:SQSQueue","eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","eventName":"AUTHENTICATION_ATTEMPT","requiredField":"timestamp","message":"timestamp is a required field."}]}')
        expect(result).toEqual(expectedResult);
    });
});
