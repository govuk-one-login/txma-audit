import { DeleteObjectCommand, DeleteObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { deleteS3Object } from '../../s3Services/deleteS3Object';
import 'aws-sdk-client-mock-jest';

const s3Mock = mockClient(S3Client);

const putObjectCommandInput: DeleteObjectCommandInput = {
    Bucket: 'testBucket',
    Key: 'testKey',
};

describe('deleteS3Object', () => {
    it('deletes an object', async () => {
        await deleteS3Object('testBucket', 'testKey');

        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, putObjectCommandInput);
    });
});
