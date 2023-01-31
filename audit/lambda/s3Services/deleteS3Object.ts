import { S3Client, DeleteObjectCommand, DeleteObjectCommandInput } from '@aws-sdk/client-s3';

export const deleteS3Object = async (bucket: string, fileKey: string): Promise<void> => {
    const client = new S3Client({ region: 'eu-west-2' });

    const input = {
        Bucket: bucket,
        Key: fileKey,
    } as DeleteObjectCommandInput;

    const result = await client.send(new DeleteObjectCommand(input));

    console.log(result);

    return;
};
