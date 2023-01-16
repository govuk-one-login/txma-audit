/* eslint-disable */
import { handler } from '../../cleanser-app';
import { FirehoseTransformationResult } from 'aws-lambda';
import { IEnrichedAuditEvent, IAuditEventUserMessage } from '../../models/enriched-audit-event';
import { ICleansedEvent } from '../../models/cleansed-event';
import { TestHelper } from '../test-helpers/test-helper';
import { CleanserHelper } from '../test-helpers/cleanser-helper';
import { mockClient } from 'aws-sdk-client-mock';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ObfuscationService } from '../../services/obfuscation-service';

describe('Unit test for app handler', function () {
    let consoleWarningMock: jest.SpyInstance;
    const secretManagerMock = mockClient(SecretsManagerClient);

    beforeEach(() => {
        consoleWarningMock = jest.spyOn(global.console, 'log');
        secretManagerMock.reset();

        secretManagerMock.on(GetSecretValueCommand, { SecretId: 'no-data-secret' }).resolves({});

        secretManagerMock.on(GetSecretValueCommand, { SecretId: 'secret-binary' }).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '1',
                extendedRequestId: '1',
                cfId: '1',
                attempts: 1,
            },
            SecretBinary: Buffer.from(Buffer.from('secret-1-value').toString('base64')),
        });

        secretManagerMock.on(GetSecretValueCommand, { SecretId: 'secret-string' }).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '1',
                extendedRequestId: '1',
                cfId: '1',
                attempts: 1,
            },
            SecretString: 'secret-1-value',
        });

        secretManagerMock.on(GetSecretValueCommand, { SecretId: 'unknown_arn' }).rejects(new Error('secret not found'));

        process.env.PERFORMANCE_SECRET_ARN = 'secret-string';
    });

    afterEach(() => {
        consoleWarningMock.mockRestore();
    });

    it('cleanses a simple event without user object', async () => {
        const exampleMessage: IEnrichedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
        };

        const outputMessage: ICleansedEvent = {
            event_id: '123456789',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            client_id: 'My-client-id',
            reIngestCount: 0,
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(outputMessage)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(exampleMessage),
        );

        const result = await handler(firehoseEvent);
        expect(result).toEqual(expectedResult);
    });

    it('cleanses a complex event with a user object', async () => {
        const user: IAuditEventUserMessage = {
            transaction_id: 'aaaa-bbbb-cccc-dddd-1234',
            user_id: 'some_user_id',
            email: 'user@test.com',
            phone: '020 8888 8888',
            ip_address: '192.168.0.1',
            session_id: 'aaaa-bbbb-cccc-dddd-1234',
            persistent_session_id: 'aaaa-bbbb-cccc-dddd-1234',
            govuk_signin_journey_id: 'aaaa-bbbb-cccc-dddd-1234',
            device_id: 'some known device',
        };

        const exampleMessage: IEnrichedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
            user,
        };

        const outputMessage: ICleansedEvent = {
            event_id: '123456789',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            client_id: 'My-client-id',
            reIngestCount: 0,
            user: {
                govuk_signin_journey_id: 'aaaa-bbbb-cccc-dddd-1234',
                user_id: ObfuscationService.obfuscateField('some_user_id', 'secret-1-value'),
            },
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(outputMessage)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(exampleMessage),
        );

        const result = await handler(firehoseEvent);
        expect(result).toEqual(expectedResult);
    });

    it('cleanses all messages when receiving an array including evidence to be kept in the extensions field', async () => {
        const expectedData: string = Buffer.from(
            TestHelper.encodeAuditEventArray(CleanserHelper.exampleCleansedAndObfuscatedMessage()),
        ).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: expectedData,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEventArray(CleanserHelper.exampleEnrichedMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('cleanses all messages when receiving an array including one piece evidence to be kept in the extensions field and one to be removed', async () => {
        const expectedData: string = Buffer.from(
            TestHelper.encodeAuditEventArray(CleanserHelper.exampleCleansedAndObfuscatedMessage()),
        ).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: expectedData,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEventArray(CleanserHelper.exampleEnrichedMessageWithScoresInOneEvidence()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('cleanses all messages when receiving an array including two pieces of evidence to be kept in the extensions field', async () => {
        const expectedData: string = Buffer.from(
            TestHelper.encodeAuditEventArray(CleanserHelper.exampleCleansedMessageWithTwoEvidence()),
        ).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: expectedData,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEventArray(CleanserHelper.exampleEnrichedMessageWithTwoEvidence()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('cleanses an event with only additional evidence', async () => {
        const exampleMessage: IEnrichedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
            extensions: {
                evidence: [
                    {
                        additional_evidence: 'evidence',
                    },
                ],
            },
        };

        const outputMessage: ICleansedEvent = {
            event_id: '123456789',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            client_id: 'My-client-id',
            reIngestCount: 0,
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(outputMessage)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(exampleMessage),
        );

        const result = await handler(firehoseEvent);
        expect(result).toEqual(expectedResult);
    });

    it('cleanses an event with no evidence in the extension', async () => {
        const exampleMessage: IEnrichedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
            extensions: {
                other_extension: 'value',
            },
        };

        const outputMessage: ICleansedEvent = {
            event_id: '123456789',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            client_id: 'My-client-id',
            reIngestCount: 0,
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(outputMessage)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(exampleMessage),
        );

        const result = await handler(firehoseEvent);
        expect(result).toEqual(expectedResult);
    });
});
