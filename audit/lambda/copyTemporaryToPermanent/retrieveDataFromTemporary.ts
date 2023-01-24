import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import consumers from 'stream/consumers';
import { Readable } from 'stream';

export const retrieveDataFromTemporary = async (fileKey: string): Promise<string> => {
    const client = new S3Client({ region: 'eu-west-2' });

    const input = {
        Bucket: 'temporrayBuvketname',
        Key: fileKey,
    } as GetObjectCommandInput;

    const { Body } = await client.send(new GetObjectCommand(input));

    console.log(Body);

    return consumers.text(Body as Readable);
};
