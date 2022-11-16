/* eslint-disable */
import { TestHelper } from '../test-helpers/test-helper';
import { IAuditEvent } from "../../models/audit-event";
import { mockClient } from 'aws-sdk-client-mock';
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import { S3Client } from "@aws-sdk/client-s3";
import {handler} from "../../retry-app";


describe('Unit test for app retryHandler', function () {
    let consoleMock: jest.SpyInstance;
    const snsMock = mockClient(SNSClient);
    const s3Mock = mockClient(S3Client);



    beforeEach(() => {
        consoleMock = jest.spyOn(global.console, 'log');
        snsMock.reset();
        s3Mock.reset();

        process.env.publishToAccountsFailureBucketARN = 'bucket:some:value:given:for:s3:arn';
        process.env.publishToAccountsARN = 'bucket:some:value:given:for:sqs:arn'
        process.env.maxRetry = '3'
    });

    afterEach(() => {
        consoleMock.mockRestore();
        jest.clearAllMocks();
    });

    it('does not send a message if the Lambda errors', async () => {
        const exampleMessage: IAuditEvent = {
            timestamp: 1609464356546575462861, //Incorrect timestamp value
            event_name: 'AUTH_AUTH_CODE_ISSUED',
            event_id: '1234',
            reIngestCount:0,
        };

        const sqsEvent = TestHelper.createSQSEventWithEncodedMessage(TestHelper.encodeAuditEvent(exampleMessage));
        await handler(sqsEvent);
        expect(snsMock.commandCalls(PublishCommand).length).toEqual(0);
    });

});
