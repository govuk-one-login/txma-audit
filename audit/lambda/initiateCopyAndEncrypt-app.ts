import { SQSEvent } from 'aws-lambda';
import { getS3ObjectAsString } from './s3Services/getS3ObjectAsString';

export const handler = async (event: SQSEvent): Promise<string> => {
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

    console.log(s3data);

    const bucket = s3data.bucket.name;
    const key = s3data.object.key;

    if (bucket !== process.env.TEMPORARY_BUCKET_NAME) {
        throw new Error(`Incorrect source bucket - ${bucket}`);
    }

    console.log(`Bucket: ${bucket}, Key: ${key}`);

    const temporaryData = getS3ObjectAsString(bucket, key);

    // //to do - encrypt temporaryData;

    // putS3Object(temporaryData);

    return temporaryData;
};

const tryParseJSON = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON: ', error);
        return {};
    }
};
