/* eslint-disable */
import { handler } from '../../obfuscation-app';
import { TestHelper } from '../test-helpers/test-helper';
import { FirehoseTransformationResult } from 'aws-lambda';
import { AuditEvent, IAuditEvent } from '../../models/audit-event';
import { ObfuscationService } from '../../services/obfuscation-service';
import { ObfuscationHelper } from '../test-helpers/obfuscation-helper';
import { EventProcessorHelper } from '../test-helpers/event-processor-helper';
import { mockClient } from 'aws-sdk-client-mock';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

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

        process.env.SECRET_ARN = 'secret-string';
    });

    afterEach(() => {
        consoleWarningMock.mockRestore();
    });

    it('accepts a bare minimum payload and stringifies', async () => {
        const exampleMessage: IAuditEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage)).toString('base64');
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

    it('obfuscates all expected fields when receiving an array', async () => {
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();

        const data: string = Buffer.from(TestHelper.encodeAuditEventArray(expectedData)).toString('base64');
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
            TestHelper.encodeAuditEventArray(EventProcessorHelper.exampleAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('obfuscates all expected fields when receiving an object in restricted fields', async () => {
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();

        expectedData.restricted = {
            someField: ObfuscationService.obfuscateField('value', 'secret-1-value'),
            nestedObject: {
                nestedObject2: {
                    field: ObfuscationService.obfuscateField('field', 'secret-1-value'),
                },
            },
            address: [
                {
                    buildingName: ObfuscationService.obfuscateField('some name', 'secret-1-value'),
                    buildingNumber: ObfuscationService.obfuscateField('10', 'secret-1-value'),
                    street: ObfuscationService.obfuscateField('Blue Avenue', 'secret-1-value'),
                    postTown: ObfuscationService.obfuscateField('Leeds', 'secret-1-value'),
                    postcode: ObfuscationService.obfuscateField('LS1 1BA', 'secret-1-value'),
                    additionalProperties: {
                        property1: ObfuscationService.obfuscateField('property value', 'secret-1-value'),
                    },
                },
                {
                    buildingName: ObfuscationService.obfuscateField('some name 2', 'secret-1-value'),
                    buildingNumber: ObfuscationService.obfuscateField('101', 'secret-1-value'),
                    street: ObfuscationService.obfuscateField('Red Avenue', 'secret-1-value'),
                    postTown: ObfuscationService.obfuscateField('Leeds', 'secret-1-value'),
                    postcode: ObfuscationService.obfuscateField('LS1 2BA', 'secret-1-value'),
                },
            ],
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEventArray(expectedData)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const message = EventProcessorHelper.exampleAuditMessage();

        message.restricted = {
            someField: 'value',
            nestedObject: {
                nestedObject2: {
                    field: 'field',
                },
            },
            address: [
                {
                    buildingName: 'some name',
                    buildingNumber: '10',
                    street: 'Blue Avenue',
                    postTown: 'Leeds',
                    postcode: 'LS1 1BA',
                    additionalProperties: {
                        property1: 'property value',
                    },
                },
                {
                    buildingName: 'some name 2',
                    buildingNumber: '101',
                    street: 'Red Avenue',
                    postTown: 'Leeds',
                    postcode: 'LS1 2BA',
                },
            ],
        };

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEventArray(message),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('obfuscates expected fields when receiving a single event using the secret string', async () => {
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64');
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
            TestHelper.encodeAuditEvent(EventProcessorHelper.exampleAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('obfuscates all expected fields when receiving a single event using a secret binary', async () => {
        process.env.SECRET_ARN = 'secret-binary';
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64');
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
            TestHelper.encodeAuditEvent(EventProcessorHelper.exampleAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('Records marked as processing failed if no secret arn', async () => {
        delete process.env.SECRET_ARN;

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(EventProcessorHelper.exampleAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(
            1,
            'An error occurred getting the hmac key.  Failed with Error: Unable to load secret ARN from environment',
        );
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed. Failed records 1.');
    });

    it('marks records as processing failed if no secret arn is present in secret manager', async () => {
        process.env.SECRET_ARN = 'unknown_arn';

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(EventProcessorHelper.exampleAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(
            1,
            'An error occurred getting the hmac key.  Failed with Error: Unable to load secret from secret manager. InnerException: Error: secret not found',
        );
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed. Failed records 1.');
    });

    it('marks records as processing failed if no data in response from secret manager', async () => {
        process.env.SECRET_ARN = 'no-data-secret';

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(
            TestHelper.encodeAuditEvent(EventProcessorHelper.exampleAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(
            1,
            'An error occurred getting the hmac key.  Failed with Error: Secret does not contain a secret value',
        );
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed. Failed records 1.');
    });

    it('has expected data in obfuscated result', async () => {
        process.env.SECRET_ARN = 'secret-binary';
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64');
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
            TestHelper.encodeAuditEvent(EventProcessorHelper.exampleAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);

        const resultData = Buffer.from(result.records[0].data, 'base64').toString('utf-8');
        const resultAuditEvent: IAuditEvent = AuditEvent.fromJSONString(resultData);

        expect(resultAuditEvent).toEqual(expectedData);
    });

    it('has the expected result when using HMAC obfuscation method', async () => {
        const message: string = 'My Secret String';
        const key: string = 'My secret key';
        const expectedResult = '5d224b25388f72dc5e329dd68385680535f6d9bda65c5f830631d72e255b9f95';

        const result: string = ObfuscationService.obfuscateField(message, key);

        expect(result).toEqual(expectedResult);
    });

    it('does not obfuscate empty fields', async () => {
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();
        delete expectedData.user!.email;
        const data: string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const event = EventProcessorHelper.exampleAuditMessage();
        event.user!.email = '';
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(event));

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
        const resultData = Buffer.from(result.records[0].data, 'base64').toString('utf-8');
        const resultAuditEvent: unknown = JSON.parse(resultData);
        expect(resultAuditEvent).toEqual(expectedData);
    });

    it('does not obfuscate undefined fields', async () => {
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();
        expectedData.user!.email = undefined;
        const data: string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const event = EventProcessorHelper.exampleAuditMessage();
        event.user!.email = undefined;
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(event));

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
        const resultData = Buffer.from(result.records[0].data, 'base64').toString('utf-8');
        const resultAuditEvent: unknown = JSON.parse(resultData);
        expect(resultAuditEvent).toEqual(expectedData);
    });

    it('handles obfuscating boolean fields', async () => {
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();
        expectedData.user!.email = ObfuscationService.obfuscateField(false, 'secret-1-value');
        const data: string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64');
        const expectedResult: FirehoseTransformationResult = {
            records: [
                {
                    data: data,
                    recordId: '7041e12f-c772-41e4-a05f-8bf25cc6f4bb',
                    result: 'Ok',
                },
            ],
        };

        const event = EventProcessorHelper.exampleAuditMessage();
        // @ts-ignore
        event.user!.email = false;
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(event));

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
        const resultData = Buffer.from(result.records[0].data, 'base64').toString('utf-8');
        const resultAuditEvent: unknown = JSON.parse(resultData);
        expect(resultAuditEvent).toEqual(expectedData);
    });

    it('do not obfuscates when reIngestCount is not 0', async () => {
        const expectedData: IAuditEvent = ObfuscationHelper.exampleObfuscatedMessage();
        expectedData.reIngestCount = 1;
        const data: string = Buffer.from(TestHelper.encodeAuditEventArray(expectedData)).toString('base64');
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
            TestHelper.encodeAuditEventArray(EventProcessorHelper.exampleReIngestAuditMessage()),
        );

        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });
});
