import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getEnv } from '../utils/helpers';

export const getS3ObjectAsStream = async (bucket: string, fileKey: string): Promise<Readable> => {
    const client = new S3Client({ region: getEnv('AWS_REGION') });

    const input = {
        Bucket: bucket,
        Key: fileKey,
    } as GetObjectCommandInput;

    const { Body } = await client.send(new GetObjectCommand(input));

    return Body as Readable;

    // const dataChunks = [];
    // for await (const chunk of Body as Readable) {
    //     dataChunks.push(chunk);
    // }
    // const data = Buffer.concat(dataChunks);

    // return data.toString();

    // Note - consumers not availble in Node 14, only from Node 16.
    // return consumers.text(Body as Readable);
};
