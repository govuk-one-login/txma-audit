/* eslint-disable */
import { handler } from '../../delimiter-app';
import { TestHelper } from '../test-helpers/test-helper';
import { SNS } from "aws-sdk";
import {FirehoseTransformationResult} from "aws-lambda";

jest.mock('aws-sdk', () => {
    const mockSNSInstance = {
        publish: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    const mockSNS = jest.fn(() => mockSNSInstance);

    return {
        SNS: mockSNS,
        config: {
            update: jest.fn()
        }
    };
});

jest.mock('crypto', () => {
    return {
        randomUUID: jest.fn(() => {
            return "58339721-64c9-486b-903f-ad7e63fc45de"
        })
    };
});

describe('Unit test for app eventProcessorHandler', function () {
    let consoleMock: jest.SpyInstance;
    let sns: SNS;

    beforeEach(() => {
        consoleMock = jest.spyOn(global.console, 'log');
        sns = new SNS();

        process.env.topicArn = 'SOME-SNS-TOPIC';
        process.env.defaultComponentId = 'SOME-COMPONENT-ID'
    });

    afterEach(() => {
        consoleMock.mockRestore();
        jest.clearAllMocks();
    });

    it('accepts a payload and stringifies', async () => {
        const exampleMessage = {
            timestamp: 1609462861,
            timestamp_formatted: "2021-01-23T15:43:21.842",
            event_name: "AUTHENTICATION_ATTEMPT",
            component_id: "AUTH"
        }

        const expectedData : string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage) + "\n").toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: [{
                data: expectedData,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "Ok"
            }]
        }

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));

        const result = await handler(firehoseEvent);
        expect(result).toEqual(expectedResult);
    });

    it('accepts a payload with multiple messages and stringifies', async () => {
        const exampleMessage = {
            timestamp: 1609462861,
            timestamp_formatted: "2021-01-23T15:43:21.842",
            event_name: "AUTHENTICATION_ATTEMPT",
            component_id: "AUTH"
        }

        const expectedData : string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage) + "\n").toString('base64')
        const expectedResult : FirehoseTransformationResult = {
            records: []
        };

        for(let i = 0; i < 5; i++){
            expectedResult.records.push({
                data: expectedData,
                recordId: "7041e12f-c772-41e4-a05f-8bf25cc6f4bb",
                result: "Ok"
            });
        }

        const firehoseEvent = TestHelper.createFirehoseEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage), 5);

        const result = await handler(firehoseEvent);
        expect(result).toEqual(expectedResult);
    });
});
