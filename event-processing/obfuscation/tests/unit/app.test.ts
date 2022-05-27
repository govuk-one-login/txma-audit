/* eslint-disable */
import AWS from "aws-sdk";
import { handler } from '../../app';
import { TestHelper } from './test-helper';
import { FirehoseTransformationResult } from 'aws-lambda';
import { AuditEvent, IAuditEvent } from '../../models/audit-event';
import { ObfuscationService } from '../../services/obfuscation-service';

jest.mock("aws-sdk");

const mockgetSecretValue = jest.fn((SecretId) => {
    switch (SecretId) {
        case "secreet-string":
            return {
                SecretString: "secret-1-value",
            };
        case "secreet-binary":
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
              promise: () => mockgetSecretValue(SecretId),
            };
          }),
        };
      }),
    };
  });

describe('Unit test for app handler', function () {
    let consoleWarningMock: jest.SpyInstance;
    let awsSpy : jest.SpyInstance;
    
    beforeEach(() => {
        consoleWarningMock = jest.spyOn(global.console, 'log');
        awsSpy = jest.spyOn(AWS, 'SecretsManager');
        process.env.SECRET_ARN = "secreet-string";
    });

    afterEach(() => {
       consoleWarningMock.mockRestore();
    });

    it('accepts a bare minimum payload and stringifies', async () => {
        const exampleMessage: IAuditEvent = {
            event_id: "",
            request_id: "",
            session_id: "",
            client_id: "",
            timestamp: 1609462861,
            timestamp_formatted: "2021-01-23T15:43:21.842",
            event_name: "AUTHENTICATION_ATTEMPT",
            persistent_session_id: ""
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

    it('removes all additional fields if its an array', async () => {
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

    it('removes all additional fields if its a single event with secret string', async () => {
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

    it('removes all additional fields if its a single event with secret binary', async () => {
        process.env.SECRET_ARN = "secreet-binary";
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
        const expectedData: IAuditEvent = TestHelper.exampleObfuscatedMessage;

        const data : string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "ProcessingFailed"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);
        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(1, 'An error occured getting the hmac key.  Failed with error: Unable to load secret from environment');
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed.  Failed records 1.');
    });

    it('Records marked as processing failed if no secret arn not present in secret manager', async () => {
        process.env.SECRET_ARN = "unknown_arn";
        const expectedData: IAuditEvent = TestHelper.exampleObfuscatedMessage;

        const data : string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "ProcessingFailed"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);
        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(1, 'An error occured getting the hmac key.  Failed with error: Unable to load secret from secret manager');
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed.  Failed records 1.');
    });

    it('Records marked as processing failed if no data in response from secret manager', async () => {
        process.env.SECRET_ARN = "no-data-secret";
        const expectedData: IAuditEvent = TestHelper.exampleObfuscatedMessage;

        const data : string = Buffer.from(TestHelper.encodeAuditEvent(expectedData)).toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: data,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "ProcessingFailed"
            }]
        }
        
        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(TestHelper.exampleMessage));
        
        const result = await handler(firehoseEvent);
        expect(result.records[0].result).toEqual('ProcessingFailed');
        expect(consoleWarningMock).toHaveBeenCalledTimes(2);
        expect(consoleWarningMock).toHaveBeenNthCalledWith(1, 'An error occured getting the hmac key.  Failed with error: Unable to load secret from data');
        expect(consoleWarningMock).toHaveBeenNthCalledWith(2, 'Processing completed.  Failed records 1.');
    });

    it('Check data matches obfuscated result', async () => {
        process.env.SECRET_ARN = "secreet-binary";
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
        var resultData = Buffer.from(result.records[0].data, 'base64').toString('ascii');
        var resultAuditEvent : IAuditEvent = AuditEvent.fromJSONString(resultData);
        expect(resultAuditEvent).toEqual(expectedData);
    });

    it('HMAC obfuscation method gives expected result', async () => {
        const message : string = "My Secret String";
        const key : string = "My secret key";
        const expectedResult = "5d224b25388f72dc5e329dd68385680535f6d9bda65c5f830631d72e255b9f95"

        var result : string = ObfuscationService.obfuscate(message, key);
        expect(result).toEqual(expectedResult);
    });
});