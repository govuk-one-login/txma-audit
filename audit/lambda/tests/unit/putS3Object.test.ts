import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { putS3Object } from '../../s3Services/putS3Object';
import 'aws-sdk-client-mock-jest';
import { Readable } from 'stream';

const s3Mock = mockClient(S3Client);
const createDataStream = (data: string) => {
    const dataStream = new Readable();
    dataStream.push(data);
    dataStream.push(null);
    return dataStream;
};
const testBody = createDataStream('encryptedData');
const putObjectCommandInput: PutObjectCommandInput = {
    Bucket: 'testBucket',
    Key: 'testKey',
    Body: testBody,
};

describe('putS3Object', () => {
    it('uploads an object', async () => {
        await putS3Object('testBucket', 'testKey', 'encryptedData');

        expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, putObjectCommandInput);
    });
});
