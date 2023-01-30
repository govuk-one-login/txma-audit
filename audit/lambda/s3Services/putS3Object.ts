import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export const putS3Object = async (bucket: string, fileKey: string, data: string): Promise<string> => {
    const client = new S3Client({ region: 'eu-west-2' });

    const body = createDataStream(data);

    const input = {
        Bucket: bucket,
        Key: fileKey,
        Body: body,
    } as PutObjectCommandInput;

    await client.send(new PutObjectCommand(input));

    return 'done';
};

const createDataStream = (data: string) => {
    const dataStream = new Readable();
    dataStream.push(data);
    dataStream.push(null);
    return dataStream;
};
