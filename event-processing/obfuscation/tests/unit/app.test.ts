/* eslint-disable */
import { handler } from '../../app';
import { TestHelper } from './test-helper';
import { FirehoseTransformationResult } from 'aws-lambda';
import { AuditEvent, IAuditEvent } from '../../models/audit-event';
import { ObfuscationService } from '../../services/obfuscation-service';

jest.mock("aws-sdk");

const mockGetSecretValue = jest.fn((SecretId) => {
    switch (SecretId) {
        case "secret-string":
            return {
                SecretString: "secret-1-value",
            };
        case "secret-binary":
            return {
              SecretBinary: Buffer.from("secret-1-value").toString('base64'),
            };
        case "no-data-secret":
            return {  };
        default:
            throw Error("secret not found");
    }
});

jest.mock("aws-sdk", () => {
    return {
      config: {
        update() {
          return {};
        },
      },
      SecretsManager: jest.fn(() => {
        return {
          getSecretValue: jest.fn(({ SecretId }) => {
            return {
              promise: () => mockGetSecretValue(SecretId),
            };
          }),
        };
      }),
    };
  });

describe('Unit test for app handler', function () {
    let consoleWarningMock: jest.SpyInstance;
    
    beforeEach(() => {
        consoleWarningMock = jest.spyOn(global.console, 'log');
        process.env.SECRET_ARN = "secret-string";
    });

    afterEach(() => {
       consoleWarningMock.mockRestore();
    });

    it('accepts a bare minimum payload and stringifies', async () => {
        const exampleMessage: IAuditEvent = {
            event_id: "",
            client_id: "",
            timestamp: 1609462861,
            timestamp_formatted: "2021-01-23T15:43:21.842",
            event_name: "AUTHENTICATION_ATTEMPT",
            component_id: "AUTH"
        }

        const data : string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "Ok"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));
        
        const result = await handler(firehoseEvent);
        expect(result).toEqual(expectedResult);
    });

    it('obfuscates all expected fields when receiving an array', async () => {
        const expectedData: IAuditEvent = TestHelper.exampleObfuscatedMessage;

        const data : string = Buffer.from(TestHelper.encodeAuditEventArray(expectedData)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "Ok"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEventArray(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('obfuscates expected fields when receiving a single event using the secret string', async () => {
        const expectedData: IAuditEvent = TestHelper.exampleObfuscatedMessage;

        const data : string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "Ok"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('obfuscates all expected fields when receiving a single event using a secret binary', async () => {
        process.env.SECRET_ARN = "secret-binary";
        const expectedData: IAuditEvent = TestHelper.exampleObfuscatedMessage;

        const data : string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "Ok"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);
    });

    it('Records marked as processing failed if no secret arn', async () => {
        delete process.env.SECRET_ARN;

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);

        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(1, 'An error occurred getting the hmac key.  Failed with Error: Unable to load secret ARN from environment');
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed. Failed records 1.');
    });

    it('marks records as processing failed if no secret arn is present in secret manager', async () => {
        process.env.SECRET_ARN = "unknown_arn";
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);

        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(1, 'An error occurred getting the hmac key.  Failed with Error: Unable to load secret from secret manager. InnerException: Error: secret not found');
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed. Failed records 1.');
    });

    it('marks records as processing failed if no data in response from secret manager', async () => {
        process.env.SECRET_ARN = "no-data-secret";
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);

        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(1, 'An error occurred getting the hmac key.  Failed with Error: Secret does not contain a secret value');
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed. Failed records 1.');
    });

    it('has expected data in obfuscated result', async () => {
        process.env.SECRET_ARN = "secret-binary";
        const expectedData: IAuditEvent = TestHelper.exampleObfuscatedMessage;

        const data : string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "Ok"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);

        expect(result).toEqual(expectedResult);

        const resultData = Buffer.from(result.records[0].data, 'base64').toString('ascii');
        const resultAuditEvent: IAuditEvent = AuditEvent.fromJSONString(resultData);

        expect(resultAuditEvent).toEqual(expectedData);
    });

    it('has the expected result when using HMAC obfuscation method', async () => {
        const message : string = "My Secret String";
        const key : string = "My secret key";
        const expectedResult = "5d224b25388f72dc5e329dd68385680535f6d9bda65c5f830631d72e255b9f95"

        const result: string = ObfuscationService.obfuscate(message, key);

        expect(result).toEqual(expectedResult);
    });
});