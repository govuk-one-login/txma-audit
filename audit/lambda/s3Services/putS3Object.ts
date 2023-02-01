import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';

export const putS3Object = async (bucket: string, fileKey: string, data: string): Promise<void> => {
    const client = new S3Client({ region: process.env.AWS_REGION });

    const input = {
        Bucket: bucket,
        Key: fileKey,
        Body: data,
    } as PutObjectCommandInput;

    console.log(input);

    const result = await client.send(new PutObjectCommand(input));

    console.log(result);

    return;
};
