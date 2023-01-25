import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import consumers from 'stream/consumers';
import { Readable } from 'stream';

export const getS3ObjectAsString = async (bucket: string, fileKey: string): Promise<string> => {
    const client = new S3Client({ region: 'eu-west-2' });

    const input = {
        Bucket: bucket,
        Key: fileKey,
    } as GetObjectCommandInput;

    const { Body } = await client.send(new GetObjectCommand(input));

    return consumers.text(Body as Readable);
};
