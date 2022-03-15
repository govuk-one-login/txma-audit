import { handler } from '../../app';
import { TestHelper } from './test-helper';
import { ValidationException } from '../../Exceptions/validation-exception';

describe('Unit test for app handler', function () {
    it('successfully stringifies an SQS event', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":"2021-01-01T01:01:01.000Z","timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"keyValuePair":[{"key":"xray_trace_id","value":"24727sda4192"}]},"restricted":{"keyValuePair":[{"key":"experian_ref","value":"DSJJSEE29392"}]},"extensions":{"keyValuePair":[{"key":"response","value":"Authentication successful"}]},"persistent_session_id":"some session id"}]';

        const exampleMessage: object = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: {
                seconds: 1609462861,
                nanos: 0,
            },
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            user: {
                id: 'a52f6f87',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
            },
            platform: {
                keyValuePair: [
                    {
                        key: 'xray_trace_id',
                        value: '24727sda4192',
                    },
                ],
            },
            restricted: {
                keyValuePair: [
                    {
                        key: 'experian_ref',
                        value: 'DSJJSEE29392',
                    },
                ],
            },
            extensions: {
                keyValuePair: [
                    {
                        key: 'response',
                        value: 'Authentication successful',
                    },
                ],
            },
            persistent_session_id: 'some session id',
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(exampleMessage);

        const result = await handler(sqsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('successfully stringifies an SNS event', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":"2021-01-01T01:01:01.000Z","timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"keyValuePair":[{"key":"xray_trace_id","value":"24727sda4192"}]},"restricted":{"keyValuePair":[{"key":"experian_ref","value":"DSJJSEE29392"}]},"extensions":{"keyValuePair":[{"key":"response","value":"Authentication successful"}]},"persistent_session_id":"some session id"}]';

        const exampleMessage: object = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: {
                seconds: 1609462861,
                nanos: 0,
            },
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            user: {
                id: 'a52f6f87',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
            },
            platform: {
                keyValuePair: [
                    {
                        key: 'xray_trace_id',
                        value: '24727sda4192',
                    },
                ],
            },
            restricted: {
                keyValuePair: [
                    {
                        key: 'experian_ref',
                        value: 'DSJJSEE29392',
                    },
                ],
            },
            extensions: {
                keyValuePair: [
                    {
                        key: 'response',
                        value: 'Authentication successful',
                    },
                ],
            },
            persistent_session_id: 'some session id',
        };

        const snsEvent = TestHelper.createSNSEventWithEncodedMessage(exampleMessage);

        const result = await handler(snsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('successfully stringifies multiple events', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":"2021-01-01T01:01:01.000Z","timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"keyValuePair":[{"key":"xray_trace_id","value":"24727sda4192"}]},"restricted":{"keyValuePair":[{"key":"experian_ref","value":"DSJJSEE29392"}]},"extensions":{"keyValuePair":[{"key":"response","value":"Authentication successful"}]},"persistent_session_id":"some session id"},' +
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":"2021-01-01T01:01:01.000Z","timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"keyValuePair":[{"key":"xray_trace_id","value":"24727sda4192"}]},"restricted":{"keyValuePair":[{"key":"experian_ref","value":"DSJJSEE29392"}]},"extensions":{"keyValuePair":[{"key":"response","value":"Authentication successful"}]},"persistent_session_id":"some session id"}]';

        const exampleMessage: object = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: {
                seconds: 1609462861,
                nanos: 0,
            },
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            user: {
                id: 'a52f6f87',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
            },
            platform: {
                keyValuePair: [
                    {
                        key: 'xray_trace_id',
                        value: '24727sda4192',
                    },
                ],
            },
            restricted: {
                keyValuePair: [
                    {
                        key: 'experian_ref',
                        value: 'DSJJSEE29392',
                    },
                ],
            },
            extensions: {
                keyValuePair: [
                    {
                        key: 'response',
                        value: 'Authentication successful',
                    },
                ],
            },
            persistent_session_id: 'some session id',
        };

        const snsEvent = TestHelper.createSNSEventWithEncodedMessage(exampleMessage, 2);

        const result = await handler(snsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('successfully removes unrecognised elements and logs to cloudwatch', async () => {
        const expectedResult =
            '[{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","request_id":"43143-233Ds-2823-283-dj299j1","session_id":"c222c1ec","client_id":"some-client","timestamp":"2021-01-01T01:01:01.000Z","timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","user":{"id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"keyValuePair":[{"key":"xray_trace_id","value":"24727sda4192"}]},"restricted":{"keyValuePair":[{"key":"experian_ref","value":"DSJJSEE29392"}]},"extensions":{"keyValuePair":[{"key":"response","value":"Authentication successful"}]},"persistent_session_id":"some session id"}]';

        const exampleMessage: object = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            some_random_property: 'please delete me',
            request_id: '43143-233Ds-2823-283-dj299j1',
            session_id: 'c222c1ec',
            client_id: 'some-client',
            timestamp: {
                seconds: 1609462861,
                nanos: 0,
            },
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            user: {
                id: 'a52f6f87',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
            },
            platform: {
                keyValuePair: [
                    {
                        key: 'xray_trace_id',
                        value: '24727sda4192',
                    },
                ],
            },
            restricted: {
                keyValuePair: [
                    {
                        key: 'experian_ref',
                        value: 'DSJJSEE29392',
                    },
                ],
            },
            extensions: {
                keyValuePair: [
                    {
                        key: 'response',
                        value: 'Authentication successful',
                    },
                ],
            },
            persistent_session_id: 'some session id',
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(exampleMessage);

        const result = await handler(sqsEvent);

        expect(result).toEqual(expectedResult);
    });

    it('throws error when validation fails', async () => {
        await expect(handler(TestHelper.createSNSEventWithEncodedMessage({}))).rejects.toThrowError(
            ValidationException,
        );
    });
});
