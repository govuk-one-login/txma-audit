import { GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { getS3ObjectAsString } from '../../initiateCopyAndEncrypt/getS3ObjectAsString';
import 'aws-sdk-client-mock-jest';
import { Readable } from 'stream';

const s3Mock = mockClient(S3Client);
const getObjectCommandInput: GetObjectCommandInput = {
    Bucket: 'testBucket',
    Key: 'testKey',
};
const testData = 'event1\nevent2';

const createDataStream = () => {
    const dataStream = new Readable();
    dataStream.push(testData);
    dataStream.push(null);
    return dataStream;
};
const givenDataAvailable = () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: createDataStream() } as GetObjectCommandOutput);
};

describe('getS3ObjectAsString', () => {
    it('returns a string read from the file', async () => {
        givenDataAvailable();

        const returnedData = await getS3ObjectAsString('testBucket', 'testKey');

        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, getObjectCommandInput);
        expect(returnedData).toEqual(testData);
    });
});
