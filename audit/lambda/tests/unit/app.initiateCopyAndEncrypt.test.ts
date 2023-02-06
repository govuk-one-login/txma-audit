/* eslint-disable */
import { handler } from '../../initiateCopyAndEncrypt-app';
import { getS3ObjectAsStream } from '../../s3Services/getS3Object';
import { putS3Object } from '../../s3Services/putS3Object';
import { deleteS3Object } from '../../s3Services/deleteS3Object';
import { testS3SqsEvent, wrongBucketTestS3SqsEvent } from '../testEvents/testS3SqsEvent';
import {
    TEST_TEMPORARY_BUCKET_NAME,
    TEST_PERMANENT_BUCKET_NAME,
    TEST_S3_OBJECT_DATA_STRING,
    TEST_S3_OBJECT_KEY,
    TEST_WRONG_S3_BUCKET,
    TEST_ENCRYPTED_S3_OBJECT_DATA_STRING,
    TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
} from '../testConstants';
import { encryptS3Object } from '../../kmsServices/encryptS3Object';
import { createDataStream } from '../test-helpers/test-helper';

jest.mock('../../s3Services/getS3Object', () => ({
    getS3ObjectAsStream: jest.fn(),
}));
jest.mock('../../s3Services/putS3Object', () => ({
    putS3Object: jest.fn(),
}));
jest.mock('../../s3Services/deleteS3Object', () => ({
    deleteS3Object: jest.fn(),
}));
jest.mock('../../kmsServices/encryptS3Object', () => ({
    encryptS3Object: jest.fn(),
}));

const mockGetS3ObjectAsStream = getS3ObjectAsStream as jest.Mock;
const mockPutS3Object = putS3Object as jest.Mock;
const mockDeleteS3Object = deleteS3Object as jest.Mock;
const mockEncryptS3Object = encryptS3Object as jest.Mock;

describe('InitiateCopyAndEncrypt', function () {
    beforeEach(() => {
        jest.resetAllMocks();

        process.env.TEMPORARY_BUCKET_NAME = TEST_TEMPORARY_BUCKET_NAME;
        process.env.PERMANENT_BUCKET_NAME = TEST_PERMANENT_BUCKET_NAME;
    });

    it('retrieves and copies an S3 object', async () => {
        const s3ObjectStream = createDataStream(TEST_S3_OBJECT_DATA_STRING);
        mockGetS3ObjectAsStream.mockResolvedValue(s3ObjectStream);
        mockEncryptS3Object.mockResolvedValue(TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER);

        await handler(testS3SqsEvent);

        expect(mockGetS3ObjectAsStream).toHaveBeenCalledWith(TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY);
        expect(mockEncryptS3Object).toHaveBeenCalledWith(s3ObjectStream);
        expect(mockPutS3Object).toHaveBeenCalledWith(
            TEST_PERMANENT_BUCKET_NAME,
            TEST_S3_OBJECT_KEY,
            TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
        );
        expect(mockDeleteS3Object).toHaveBeenCalledWith(TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY);
    });

    it('throws an error if there is no data in the SQS Event', async () => {
        expect(handler({ Records: [] })).rejects.toThrow('No data in event');
        expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled();
        expect(mockPutS3Object).not.toHaveBeenCalled();
        expect(mockDeleteS3Object).not.toHaveBeenCalled();
    });

    it('throws an error if the SQS event comes from the wrong S3 bucket', async () => {
        expect(handler(wrongBucketTestS3SqsEvent)).rejects.toThrow(`Incorrect source bucket - ${TEST_WRONG_S3_BUCKET}`);
        expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled();
        expect(mockPutS3Object).not.toHaveBeenCalled();
        expect(mockDeleteS3Object).not.toHaveBeenCalled();
    });
});
