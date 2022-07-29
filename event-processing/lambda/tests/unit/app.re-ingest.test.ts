/* eslint-disable */
import {handler} from '../../re-ingest-app';
import {S3Event} from "aws-lambda/trigger/s3";
import {ReIngestHelper} from "../test-helpers/re-ingest-helper";
import { mockClient } from "aws-sdk-client-mock";
import {DeleteObjectCommand, GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {FirehoseClient, PutRecordBatchCommand} from "@aws-sdk/client-firehose";
import {TestHelper} from "../test-helpers/test-helper";
import {EventProcessorHelper} from "../test-helpers/event-processor-helper";
import * as stream from "stream";
import {IReIngestRecordInterface} from "../../models/re-ingest-record.interface";

describe('Unit test for re-ingest app handler', function () {
    let consoleWarningMock: jest.SpyInstance;
    const s3Mock = mockClient(S3Client);
    const fireHoseMock = mockClient(FirehoseClient);

    beforeEach(() => {
        consoleWarningMock = jest.spyOn(global.console, 'log');
        s3Mock.reset();
        fireHoseMock.reset();

        process.env.fireHoseStreamName = 'TestStreamName';
        process.env.maxIngestion = '14';
    });

    afterEach(() => {
        consoleWarningMock.mockRestore();
    });

    it('picks up a new failed message and sends back into firehose', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = ReIngestHelper.createReadableStream(s3ObjectString);

        exampleMessage.reIngestCount = 1;
        const encoder = new TextEncoder();
        const messageBytes = encoder.encode(JSON.stringify(exampleMessage));
        const recordsArray: Array<IReIngestRecordInterface> = [
            {
                Data: messageBytes
            },
            {
                Data: messageBytes
            },
        ];

        let getCommand = new GetObjectCommand({
            Bucket: 'sourcebucket',
            Key: 'Happy Face.jpg',
        });

        let deleteCommand = new GetObjectCommand({
            Bucket: 'sourcebucket',
            Key: 'Happy Face.jpg',
        });

        let putRecordBatchCommand = new PutRecordBatchCommand({
            DeliveryStreamName: 'TestStreamName',
            Records: recordsArray
        })

        s3Mock.on(GetObjectCommand).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '1',
                extendedRequestId: '1',
                cfId: '1',
                attempts: 1,
            },
            Body: readableStream
        });

        s3Mock.on(DeleteObjectCommand).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            }
        });

        fireHoseMock.on(PutRecordBatchCommand).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            }
        });

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await handler(s3Event);

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(1);
        expect(JSON.stringify(s3Mock.commandCalls(GetObjectCommand)[0]['args'][0])).toEqual(JSON.stringify(getCommand));
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(JSON.stringify(s3Mock.commandCalls(DeleteObjectCommand)[0]['args'][0])).toEqual(JSON.stringify(deleteCommand));
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(1);
        expect(JSON.stringify(fireHoseMock.commandCalls(PutRecordBatchCommand)[0]['args'][0])).toEqual(JSON.stringify(putRecordBatchCommand));
    });

    it('picks up a message and fails to send to firehose, error is thrown', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = ReIngestHelper.createReadableStream(s3ObjectString);

        exampleMessage.reIngestCount = 1;
        const encoder = new TextEncoder();
        const messageBytes = encoder.encode(JSON.stringify(exampleMessage));
        const recordsArray: Array<IReIngestRecordInterface> = [
            {
                Data: messageBytes
            },
            {
                Data: messageBytes
            },
        ];

        let getCommand = new GetObjectCommand({
            Bucket: 'sourcebucket',
            Key: 'Happy Face.jpg',
        });

        let deleteCommand = new GetObjectCommand({
            Bucket: 'sourcebucket',
            Key: 'Happy Face.jpg',
        });

        let putRecordBatchCommand = new PutRecordBatchCommand({
            DeliveryStreamName: 'TestStreamName',
            Records: recordsArray
        })

        s3Mock.on(GetObjectCommand).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '1',
                extendedRequestId: '1',
                cfId: '1',
                attempts: 1,
            },
            Body: readableStream
        });

        s3Mock.on(DeleteObjectCommand).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            }
        });

        fireHoseMock.on(PutRecordBatchCommand).rejects({
            $metadata: {
                httpStatusCode: 200,
                requestId: '2',
                extendedRequestId: '2',
                cfId: '2',
                attempts: 1,
            }
        });

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await handler(s3Event);

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(1);
        expect(JSON.stringify(s3Mock.commandCalls(GetObjectCommand)[0]['args'][0])).toEqual(JSON.stringify(getCommand));
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(1);
        fireHoseMock.rejectsOnce();
        expect(JSON.stringify(fireHoseMock.commandCalls(PutRecordBatchCommand)[0]['args'][0])).toEqual(JSON.stringify(putRecordBatchCommand));
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