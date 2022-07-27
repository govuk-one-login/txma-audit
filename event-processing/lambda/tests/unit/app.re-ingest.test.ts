/* eslint-disable */
import {handler} from '../../re-ingest-app';
import {S3Event} from "aws-lambda/trigger/s3";
import {ReIngestHelper} from "../test-helpers/re-ingest-helper";
import {Firehose, S3, SNS} from "aws-sdk";
import s3 = require('aws-sdk/clients/s3');

jest.mock("aws-sdk");

jest.mock("aws-sdk", () => {
    const mockFireHoseInstance = {
        putRecordBatch: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    const mockFireHose = jest.fn(() => mockFireHoseInstance);

    const mockS3Instance = {

        deleteObject: jest.fn().mockReturnThis(),
        putObject: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    const mockS3 = jest.fn(() => mockS3Instance);

    return {
        config: {
            update() {
                return {};
            },
        },

        Firehose: mockFireHose,
        s3: mockS3
    };
});

describe('Unit test for re-ingest app handler', function () {
    let consoleWarningMock: jest.SpyInstance;
    let s3: S3;
    let s3PutSpy: jest.SpyInstance;
    let s3DeleteSpy: jest.SpyInstance;
    let fireHose: Firehose;
    let fireHosePutSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleWarningMock = jest.spyOn(global.console, 'log');
        // s3PutSpy = jest.spyOn(s3, 'putObject');
        // s3DeleteSpy = jest.spyOn(s3, 'deleteObject');
        // fireHosePutSpy = jest.spyOn(fireHose, 'putRecordBatch');
    });

    afterEach(() => {
        consoleWarningMock.mockRestore();
    });

    it('picks up a new failed message and sends back into firehose', async () => {
        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await handler(s3Event);

        //spy on s3 and firehose

    });

    it('picks up a message and fails to send to firehose, error is thrown', async () => {

    });

    it('pick up a previously re-ingested message and correctly adjusts the reIngest count', async () => {

    });

    it('pick up a message and does not try and reIngest if the maximum retry amount has been reached', async () => {

    });

    it('deletes records from s3 that have been sent to firehose', async () => {

    });

    it('deletes records from s3 that have reached the maximum retry count', async () => {

    });
});