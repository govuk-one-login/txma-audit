import { GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { getS3ObjectAsString } from './getS3Object';
import 'aws-sdk-client-mock-jest';
import { Readable } from 'stream';
import {
    TEST_TEMPORARY_BUCKET_NAME,
    TEST_S3_OBJECT_KEY,
    TEST_S3_OBJECT_DATA_STRING,
} from '../utils/tests/testConstants';

process.env.AWS_REGION = 'eu-west-2';
const s3Mock = mockClient(S3Client);
const getObjectCommandInput: GetObjectCommandInput = {
    Bucket: TEST_TEMPORARY_BUCKET_NAME,
    Key: TEST_S3_OBJECT_KEY,
};
const testData = TEST_S3_OBJECT_DATA_STRING;

const createDataStream = () => {
    const dataStream = new Readable();
    dataStream.push(testData);
    dataStream.push(null);
    return dataStream;
};
const givenDataAvailable = () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: createDataStream() } as GetObjectCommandOutput);
};

describe('getS3Object - ', () => {
    it('getS3ObjectAsString returns a string read from the file', async () => {
        givenDataAvailable();

        const returnedData = await getS3ObjectAsString(TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY);

        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, getObjectCommandInput);
        expect(returnedData).toEqual(testData);
    });
});
