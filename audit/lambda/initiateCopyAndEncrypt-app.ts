import { SQSEvent } from 'aws-lambda';
import { deleteS3Object } from './s3Services/deleteS3Object';
import { getS3ObjectAsString } from './s3Services/getS3Object';
import { putS3Object } from './s3Services/putS3Object';
import { tryParseJSON } from './utils/helpers';

export const handler = async (event: SQSEvent): Promise<void> => {
    /* copy and encrypt data */
    console.log('Handling initiate copy and encrypt SQS event', JSON.stringify(event, null, 2));

    if (event.Records.length === 0) {
        throw new Error('No data in event');
    }

    const eventData = tryParseJSON(event.Records[0].body);

    if (!eventData.Records[0].s3) {
        throw new Error('No s3 data in event');
    }

    const s3data = eventData.Records[0].s3;
    const bucket = s3data.bucket.name;
    const key = s3data.object.key;

    if (bucket !== process.env.TEMPORARY_BUCKET_NAME) {
        throw new Error(`Incorrect source bucket - ${bucket}`);
    }

    const temporaryData = await getS3ObjectAsString(bucket, key);

    // //to do - encrypt temporaryData;

    const permanentBucket = !process.env.PERMANENT_BUCKET_NAME ? '' : process.env.PERMANENT_BUCKET_NAME;

    await putS3Object(permanentBucket, key, temporaryData);

    await deleteS3Object(bucket, key);

    return;
};
