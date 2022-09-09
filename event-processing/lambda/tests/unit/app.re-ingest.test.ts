/* eslint-disable */
import {handler} from '../../re-ingest-app';
import {S3Event} from "aws-lambda/trigger/s3";
import {ReIngestHelper} from "../test-helpers/re-ingest-helper";
import { mockClient } from "aws-sdk-client-mock";
import {DeleteObjectCommand, GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {FirehoseClient, PutRecordBatchCommand} from "@aws-sdk/client-firehose";
import {EventProcessorHelper} from "../test-helpers/event-processor-helper";
import {IReIngestRecordInterface} from "../../models/re-ingest-record.interface";

describe('Unit test for re-ingest app handler', function () {
    let consoleMock: jest.SpyInstance;
    const s3Mock = mockClient(S3Client);
    const fireHoseMock = mockClient(FirehoseClient);

    beforeEach(() => {
        consoleMock = jest.spyOn(global.console, 'log');
        s3Mock.reset();
        fireHoseMock.reset();

        process.env.performanceBucketName = 'perfBucket';
        process.env.fraudBucketName = 'fraudBucket';
        process.env.performanceStreamName = 'perfStream';
        process.env.fraudStreamName = 'fraudStream';
        process.env.maxIngestion = '14';
    });

    afterEach(() => {
        consoleMock.mockRestore();
    });

    it('picks up a new failed message and sends back into firehose then deletes from S3', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

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
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(1);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: recordsArray
        });
    });

    it('picks up a new failed message for fraudStream and sends back into firehose then deletes from S3', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

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
        s3Event.Records[0].s3.bucket.name = 'fraudBucket';

        await handler(s3Event);

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'fraudBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'fraudBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(1);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'fraudStream',
            Records: recordsArray
        });
    });

    it('picks up a message and fails to send to firehose, error is thrown', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

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
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        //Fails to send so does not delete from S3
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        //Wil try the maximum amount of times
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(20);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: recordsArray
        });
        expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining('[ERROR] FIREHOSE DELIVERY ERROR:\n Error: "Could not put records after 20 attempts.'), expect.anything());
        expect(consoleMock).toHaveBeenCalledWith( expect.stringContaining('[ERROR] REINGEST ERROR:\n Error: "Could not put records after 20 attempts.'), expect.anything());
    });

    it('pick up a previously re-ingested message and correctly adjusts the reIngest count', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();
        exampleMessage.reIngestCount=3;

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

        exampleMessage.reIngestCount = 4;
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
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(1);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: recordsArray
        });
    });

    it('pick up a message and does not try and reIngest if the maximum retry amount has been reached and deletes from S3', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();
        exampleMessage.reIngestCount=14;

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

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
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });

    it('rejects when an error occurs when getting an object via the s3 service', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        exampleMessage.reIngestCount = 1;

        s3Mock.on(GetObjectCommand).rejects({
            $metadata: {
                httpStatusCode: 200,
                requestId: '1',
                extendedRequestId: '1',
                cfId: '1',
                attempts: 1,
            }
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
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
        expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("[ERROR] GET FROM S3 ERROR:\n Error: "), expect.anything())
        expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("[ERROR] REINGEST ERROR:\n Error: "), expect.anything())
    });

    it('rejects when an error occurs when deleting an object via the s3 service', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

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

        s3Mock.on(DeleteObjectCommand).rejects({
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
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(1);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: recordsArray
        });
        expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("[ERROR] DELETE FROM S3 ERROR:\n Error: "), expect.anything())
        expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining("[ERROR] REINGEST ERROR:\n Error: "), expect.anything())
    });

    it('will handle response errors from firehose service', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

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
            },
            FailedPutCount: 1,
            RequestResponses: [{
                RecordId: '1',
                ErrorCode: '1234',
                ErrorMessage: 'some error occurred',
            }]
        });

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await handler(s3Event);

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(20);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: recordsArray
        });
        expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining('[ERROR] FIREHOSE DELIVERY ERROR:\n Error: "Could not put records after 20 attempts. Individual error codes: 1234"'), expect.anything());
        expect(consoleMock).toHaveBeenCalledWith(expect.stringContaining('[ERROR] REINGEST ERROR:\n Error: "Could not put records after 20 attempts. Individual error codes: 1234"'), expect.anything());
    });

    it('will handle response errors from firehose where the error code is not defined', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();

        const s3ObjectString = JSON.stringify(exampleMessage) + '\n' + JSON.stringify(exampleMessage) + '\n';
        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

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
            },
            FailedPutCount: 1,
            RequestResponses: [{
                RecordId: '1',
                ErrorCode: undefined,
                ErrorMessage: 'some error occurred',
            }]
        });

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await handler(s3Event);

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(1);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: recordsArray
        });
    });

    it('throws an error when "performanceStreamName" is empty', async () => {
        delete process.env.performanceStreamName;

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await expect(handler(s3Event)).rejects.toThrow(expect.objectContaining({
            message: expect.stringContaining('[ERROR] MISSING ENVIRONMENT VARIABLES:\n The following variables were not provided: performanceStreamName')
        }));

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(0);
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });

    it('throws an error when "fraudStreamName" is empty', async () => {
        delete process.env.fraudStreamName;

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await expect(handler(s3Event)).rejects.toThrow(expect.objectContaining({
            message: expect.stringContaining('[ERROR] MISSING ENVIRONMENT VARIABLES:\n The following variables were not provided: fraudStreamName')
        }));

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(0);
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });


    it('throws an error when "performanceBucketName" is empty', async () => {
        delete process.env.performanceBucketName;

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await expect(handler(s3Event)).rejects.toThrow(expect.objectContaining({
            message: expect.stringContaining('[ERROR] MISSING ENVIRONMENT VARIABLES:\n The following variables were not provided: performanceBucketName')
        }));

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(0);
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });


    it('throws an error when "fraudBucketName" is empty', async () => {
        delete process.env.fraudBucketName;

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await expect(handler(s3Event)).rejects.toThrow(expect.objectContaining({
            message: expect.stringContaining('[ERROR] MISSING ENVIRONMENT VARIABLES:\n The following variables were not provided: fraudBucketName')
        }));

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(0);
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });


    it('throws an error when "maxIngestion" is empty', async () => {
        delete process.env.maxIngestion;

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await expect(handler(s3Event)).rejects.toThrow(expect.objectContaining({
            message: expect.stringContaining('[ERROR] MISSING ENVIRONMENT VARIABLES:\n The following variables were not provided: maxIngestion')
        }));

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(0);
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });

    it('throws an error when the bucketName does not match an expected value', async () => {
        const s3Event: S3Event = ReIngestHelper.exampleS3Event();
        s3Event.Records[0].s3.bucket.name = 'wrongBucket';

        await expect(handler(s3Event)).rejects.toThrow(expect.objectContaining({
            message: expect.stringContaining('[ERROR] NO MATCHING BUCKET FOUND:\n We could not match the S3 object bucket name to an expected value: wrongBucket')
        }));

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(0);
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(0);
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });


    it('picks up an s3 object with no messages within and does not fail', async () => {
        const readableStream = await ReIngestHelper.createGzipStream('');

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

        const s3Event: S3Event = ReIngestHelper.exampleS3Event();

        await handler(s3Event);

        expect(s3Mock.commandCalls(GetObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(0);
    });

    it('correctly flushes batches when nearing the 500 max limit', async () => {
        const exampleMessage = EventProcessorHelper.exampleAuditMessage();
        let s3ObjectString = '';

        for(let i = 0; i < 505; i++){
            s3ObjectString += JSON.stringify(exampleMessage) + '\n';
        }

        const readableStream = await ReIngestHelper.createGzipStream(s3ObjectString);

        exampleMessage.reIngestCount = 1;
        const encoder = new TextEncoder();
        const messageBytes = encoder.encode(JSON.stringify(exampleMessage));
        const firstRecordsArray: Array<IReIngestRecordInterface> = [];
        const secondRecordsArray: Array<IReIngestRecordInterface> = [];

        for(let i = 0; i < 500; i++){
            firstRecordsArray.push({
                Data: messageBytes
            });
        }

        for(let i = 0; i < 5; i++){
            secondRecordsArray.push({
                Data: messageBytes
            });
        }

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
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toEqual(1);
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
            Bucket: 'perfBucket',
            Key: 'Happy Face.jpg',
        });
        expect(fireHoseMock.commandCalls(PutRecordBatchCommand).length).toEqual(2);
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: firstRecordsArray
        });
        expect(fireHoseMock).toHaveReceivedCommandWith(PutRecordBatchCommand, {
            DeliveryStreamName: 'perfStream',
            Records: secondRecordsArray
        });
    });
});