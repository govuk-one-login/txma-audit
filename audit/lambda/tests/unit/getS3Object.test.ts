import { GetObjectCommand, GetObjectCommandInput, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { getS3ObjectAsStream } from '../../s3Services/getS3Object';
import 'aws-sdk-client-mock-jest';
import { TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY, TEST_S3_OBJECT_DATA_STRING } from '../testConstants';
import { createDataStream } from '../test-helpers/test-helper';

const s3Mock = mockClient(S3Client);
const getObjectCommandInput: GetObjectCommandInput = {
    Bucket: TEST_TEMPORARY_BUCKET_NAME,
    Key: TEST_S3_OBJECT_KEY,
};

const givenDataAvailable = () => {
    s3Mock
        .on(GetObjectCommand)
        .resolves({ Body: createDataStream(TEST_S3_OBJECT_DATA_STRING) } as GetObjectCommandOutput);
};

describe('getS3Object - ', () => {
    it('getS3ObjectAsStream returns a stream read from the file', async () => {
        givenDataAvailable();
        const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING);

        const returnedData = await getS3ObjectAsStream(TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY);

        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, getObjectCommandInput);
        expect(returnedData).toEqual(testDataStream);
    });
});
