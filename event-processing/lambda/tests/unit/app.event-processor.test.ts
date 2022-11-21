/* eslint-disable */
import { handler } from '../../event-processor-app';
import { TestHelper } from '../test-helpers/test-helper';
import { IAuditEvent } from '../../models/audit-event';
import { AuditEvent as UnknownAuditEvent } from '../../tests/test-events/unknown-audit-event';
import { randomUUID } from 'crypto';
import { EventProcessorHelper } from '../test-helpers/event-processor-helper';
import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

jest.mock('crypto', () => {
    return {
        randomUUID: jest.fn(() => {
            return '58339721-64c9-486b-903f-ad7e63fc45de';
        }),
    };
});

describe('Unit test for app eventProcessorHandler', function () {
    let consoleMock: jest.SpyInstance;
    const snsMock = mockClient(SNSClient);

    beforeEach(() => {
        consoleMock = jest.spyOn(global.console, 'log');
        snsMock.reset();

        process.env.topicArn = 'SOME-SNS-TOPIC';
        process.env.defaultComponentId = 'SOME-COMPONENT-ID';
    });

    afterEach(() => {
        consoleMock.mockRestore();
        jest.clearAllMocks();
    });

    it('does not send a message if the Lambda errors', async () => {
        const exampleMessage: IAuditEvent = {
            timestamp: 1609464356546575462861, //Incorrect timestamp value
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: '1234',
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await handler(sqsEvent);

        expect(snsMock.commandCalls(PublishCommand).length).toEqual(0);
    });

    it('does not send a message if the Lambda only contains invalid messages', async () => {
        const exampleMessage = {
            event_name: 'AUTHENTICATION_ATTEMPT',
        }; //Missing required field

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(exampleMessage as IAuditEvent),
        );

        await handler(sqsEvent);

        expect(snsMock.commandCalls(PublishCommand).length).toEqual(0);
    });

    it('throws an error if SNS publish fails', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '58339721-64c9-486b-903f-ad7e63fc45de',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'SOME-COMPONENT-ID',
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            reIngestCount: 0,
        };

        snsMock.on(PublishCommand).rejectsOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
        });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await expect(handler(sqsEvent)).rejects.toThrow();

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(randomUUID).toHaveBeenCalledTimes(1);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenCalledWith(
            expect.stringContaining('[ERROR] Publish to SNS error:\n Error: '),
            expect.anything(),
        );
    });

    it('accepts a bare minimum payload and stringifies', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '58339721-64c9-486b-903f-ad7e63fc45de',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'SOME-COMPONENT-ID',
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            reIngestCount: 0,
        };

        snsMock.on(PublishCommand).resolvesOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
            MessageId: '1',
        });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(randomUUID).toHaveBeenCalledTimes(1);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
    });

    it('does not add empty fields', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
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
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
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
            reIngestCount: 0,
        };

        snsMock.on(PublishCommand).resolvesOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
            MessageId: '1',
        });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
    });

    it('does not remove fields with value of 0', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: '1234',
            extensions: {
                evidence: [
                    {
                        validityScore: 0,
                    },
                ],
            },
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: '1234',
            extensions: {
                evidence: [
                    {
                        validityScore: 0,
                    },
                ],
            },
        };

        snsMock.on(PublishCommand).resolvesOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
            MessageId: '1',
        });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
    });

    it('does not remove fields with value of false', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: '1234',
            extensions: {
                booleanValue: false,
            },
            reIngestCount: 0,
        };
        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: '1234',
            extensions: {
                booleanValue: false,
            },
        };

        snsMock.on(PublishCommand).resolvesOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
            MessageId: '1',
        });
        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
    });

    it('successfully stringifies an SQS event', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = EventProcessorHelper.exampleAuditMessage();

        snsMock.on(PublishCommand).resolvesOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
            MessageId: '1',
        });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
    });

    it('successfully stringifies multiple events', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = EventProcessorHelper.exampleAuditMessage();

        snsMock
            .on(PublishCommand)
            .resolvesOnce({
                $metadata: {
                    httpStatusCode: 200,
                    requestId: '2',
                    extendedRequestId: '2',
                    cfId: '2',
                    attempts: 1,
                },
                MessageId: '1',
            })
            .resolvesOnce({
                $metadata: {
                    httpStatusCode: 200,
                    requestId: '2',
                    extendedRequestId: '2',
                    cfId: '2',
                    attempts: 1,
                },
                MessageId: '2',
            });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage), 2);

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(4);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
        expect(consoleMock).toHaveBeenNthCalledWith(3, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(4, 'MessageID is 2');
    });

    it('successfully removes unrecognised elements from an audit event and user field and then logs to cloudwatch', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
            reIngestCount: 0,
        };

        const exampleMessage: UnknownAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                unknown_user_field: 'some unknown user field',
                device_id: 'some known device',
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
            new_unknown_field: 'an unknown field',
        };

        snsMock.on(PublishCommand).resolvesOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
            MessageId: '1',
        });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(
            TestHelper.encodeAuditEventWithUnknownField(exampleMessage),
        );

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(3);
        expect(consoleMock).toHaveBeenNthCalledWith(
            1,
            '[WARN] UNKNOWN FIELDS\n{"resourceName":"arn:aws:sqs:us-west-2:123456789012:SQSQueue","eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","eventName":"AUTHENTICATION_ATTEMPT","timestamp":"1609462861","message":"Unknown fields in message.","unknownFields":[{"key":"new_unknown_field","fieldName":"AuditEvent"},{"key":"unknown_user_field","fieldName":"User"}]}',
        );
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(3, 'MessageID is 1');
    });

    it('successfully populates missing formatted timestamp fields', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-01T01:01:01.000Z',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
        };

        snsMock.on(PublishCommand).resolvesOnce({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            },
            MessageId: '1',
        });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        await handler(sqsEvent);

        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
        expect(consoleMock).toHaveBeenCalledTimes(2);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
    });

    it('logs an error when validation fails on event name', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = EventProcessorHelper.exampleAuditMessage();

        const exampleInvalidMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: '',
            component_id: '1234',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
        };

        snsMock
            .on(PublishCommand)
            .resolvesOnce({
                $metadata: {
                    httpStatusCode: 200,
                    requestId: '2',
                    extendedRequestId: '2',
                    cfId: '2',
                    attempts: 1,
                },
                MessageId: '1',
            })
            .resolvesOnce({
                $metadata: {
                    httpStatusCode: 200,
                    requestId: '2',
                    extendedRequestId: '2',
                    cfId: '2',
                    attempts: 1,
                },
                MessageId: '2',
            });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage), 2);
        const sqsEventWithInvalidMessage = TestHelper.createSQSEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(exampleInvalidMessage),
        );

        sqsEvent.Records.push(...sqsEventWithInvalidMessage.Records);

        await handler(sqsEvent);

        expect(consoleMock).toHaveBeenCalledTimes(5);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
        expect(consoleMock).toHaveBeenNthCalledWith(3, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(4, 'MessageID is 2');
        expect(consoleMock).toHaveBeenNthCalledWith(
            5,
            '[ERROR] VALIDATION ERROR\n{"requireFieldError":{"resourceName":"arn:aws:sqs:us-west-2:123456789012:SQSQueue","eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","eventName":"","timestamp":"1609462861","requiredField":"event_name","message":"event_name is a required field."}}',
        );
        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
    });

    it('logs an error when validation fails on timestamp', async () => {
        const expectedResult: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
            reIngestCount: 0,
        };

        const exampleMessage: IAuditEvent = EventProcessorHelper.exampleAuditMessage();

        const exampleInvalidMessage: IAuditEvent = {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 0,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: '1234',
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
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
        };

        snsMock
            .on(PublishCommand)
            .resolvesOnce({
                $metadata: {
                    httpStatusCode: 200,
                    requestId: '2',
                    extendedRequestId: '2',
                    cfId: '2',
                    attempts: 1,
                },
                MessageId: '1',
            })
            .resolvesOnce({
                $metadata: {
                    httpStatusCode: 200,
                    requestId: '2',
                    extendedRequestId: '2',
                    cfId: '2',
                    attempts: 1,
                },
                MessageId: '2',
            });

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage), 2);
        const sqsEventWithInvalidMessage = TestHelper.createSQSEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(exampleInvalidMessage),
        );

        sqsEvent.Records.push(...sqsEventWithInvalidMessage.Records);

        await handler(sqsEvent);

        expect(consoleMock).toHaveBeenCalledTimes(5);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(2, 'MessageID is 1');
        expect(consoleMock).toHaveBeenNthCalledWith(3, 'Topic ARN: SOME-SNS-TOPIC');
        expect(consoleMock).toHaveBeenNthCalledWith(4, 'MessageID is 2');
        expect(consoleMock).toHaveBeenNthCalledWith(
            5,
            '[ERROR] VALIDATION ERROR\n{"requireFieldError":{"resourceName":"arn:aws:sqs:us-west-2:123456789012:SQSQueue","eventId":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","eventName":"AUTHENTICATION_ATTEMPT","requiredField":"timestamp","message":"timestamp is a required field."}}',
        );
        expect(snsMock).toHaveReceivedCommandWith(PublishCommand, {
            Message: JSON.stringify(expectedResult),
            TopicArn: 'SOME-SNS-TOPIC',
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: 'AUTHENTICATION_ATTEMPT',
                },
            },
        });
    });
});
