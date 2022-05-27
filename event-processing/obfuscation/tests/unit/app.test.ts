/* eslint-disable */
jest.mock("aws-sdk");

import { handler } from '../../app';
import { TestHelper } from './test-helper';
import { FirehoseTransformationResult } from 'aws-lambda';
import AWS from "aws-sdk";
import { IAuditEvent } from '../../models/audit-event';

const mockgetSecretValue = jest.fn((SecretId) => {
    switch (SecretId) {
      case "arn:aws:secretsmanager:eu-west-2:248098332657:secret:ObfuscationHMACSecret-LaDT1y":
        return {
          SecretString: "secret-1-value",
        };
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
        var resultData = Buffer.from(result.records[0].data, 'base64').toString('ascii');
    });

    it('removes all additional fields if its a single event', async () => {
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
    });
});