import { DeleteObjectCommand, DeleteObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { deleteS3Object } from '../../s3Services/deleteS3Object';
import { TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY } from '../testConstants';
import 'aws-sdk-client-mock-jest';

const s3Mock = mockClient(S3Client);

const putObjectCommandInput: DeleteObjectCommandInput = {
    Bucket: TEST_TEMPORARY_BUCKET_NAME,
    Key: TEST_S3_OBJECT_KEY,
};

describe('deleteS3Object', () => {
    it('deletes an object', async () => {
        await deleteS3Object(TEST_TEMPORARY_BUCKET_NAME, TEST_S3_OBJECT_KEY);

        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, putObjectCommandInput);
    });
});
