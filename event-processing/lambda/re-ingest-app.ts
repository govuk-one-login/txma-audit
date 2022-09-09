import { FirehoseService } from './services/firehose-service';
import { S3Event } from 'aws-lambda/trigger/s3';
import { DestinationEnum } from './enums/destination.enum';
import { AuditEvent } from './models/audit-event';
import { IReIngestRecordInterface } from './models/re-ingest-record.interface';
import { S3Service } from './services/s3-service';
import { ErrorService } from './services/error-service';

export const handler = async (event: S3Event): Promise<void> => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing Starting....\n BucketName: ${bucket}\nBucketKey: ${key}`);
    //validate env vars
    validateEnvironmentVariables();

    const streamName = getStreamName(bucket);
    const maxIngest = Number(process.env.maxIngestion);
    console.log(`Stream Details....\n StreamName: ${streamName}\nMaxIngest: ${maxIngest}`);

    try {
        const s3Object = await S3Service.getObject(bucket, key);

        if (s3Object) {
            let recordBatch: Array<IReIngestRecordInterface> = [];
            let destinationFH = 0;
            const s3ObjectLines = s3Object.split('\n');

            console.log(`message count in object: ${s3ObjectLines.length}`);
            for (let lineIndex = 0; lineIndex < s3ObjectLines.length; lineIndex++) {
                console.log(`Processing message: ${lineIndex + 1}`);
                let destination = DestinationEnum.fireHose;

                const currentLine = s3ObjectLines[lineIndex];

                if (currentLine.length <= 0) {
                    console.log(`Blank line, continuing....`);
                    continue;
                }

                const jsonData = AuditEvent.fromJSONString(currentLine);

                if (jsonData.reIngestCount) {
                    jsonData.reIngestCount++;
                } else {
                    jsonData.reIngestCount = 1;
                }

                console.log(`Current ReIngest count: ${jsonData.reIngestCount}`);

                if (jsonData.reIngestCount > maxIngest) {
                    console.log(`Max ReIngest reached... archive to S3`);
                    destination = DestinationEnum.s3;
                }

                if (destination === DestinationEnum.fireHose) {
                    console.log(`Push message to FireHose for ReProcessing...`);
                    const eventString = JSON.stringify(jsonData);
                    const encoder = new TextEncoder();
                    const messageBytes = encoder.encode(eventString);
                    recordBatch.push({ Data: messageBytes });
                    destinationFH++;
                    if (destinationFH > 499) {
                        console.log(`Flush batch...`);
                        //flush max batch
                        await FirehoseService.putRecordsToFirehoseStream(streamName, recordBatch, 0, 20);
                        destinationFH = 0;
                        recordBatch = [];
                    }
                }
            }

            if (destinationFH > 0) {
                try {
                    console.log(`Push message to FireHose for ReProcessing...`);
                    await FirehoseService.putRecordsToFirehoseStream(streamName, recordBatch, 0, 20);
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }

            console.log(`Delete object from S3... Bucket: ${bucket}, key: ${key}`);
            await S3Service.deleteObject(bucket, key);
        } else {
            console.log(`Delete object from S3... Bucket: ${bucket}, key: ${key}`);
            await S3Service.deleteObject(bucket, key);
        }
    } catch (error) {
        const errorWithMessage = ErrorService.toErrorWithMessage(error);
        console.log(`[ERROR] REINGEST ERROR:\n Error: ${errorWithMessage.message}`, errorWithMessage.stack);
    }
};

//Move to a service?
function getStreamName(bucketName: string): string {
    const fraudBucketName = String(process.env.fraudBucketName);
    const performanceBucketName = String(process.env.performanceBucketName);

    let stream = '';
    const streams = {
        [fraudBucketName]: () => {
            stream = String(process.env.fraudStreamName);
        },
        [performanceBucketName]: () => {
            stream = String(process.env.performanceStreamName);
        },
        default: () => {
            throw new Error(
                `[ERROR] NO MATCHING BUCKET FOUND:\n We could not match the S3 object bucket name to an expected value: ${bucketName}`,
            );
        },
    };

    (streams[bucketName] || streams['default'])();

    return stream;
}

//Move to validation service?
function validateEnvironmentVariables(): void {
    const missingEnvironmentVariables: Array<string> = [];
    if (!('performanceBucketName' in process.env)) {
        missingEnvironmentVariables.push('performanceBucketName');
    }
    if (!('fraudBucketName' in process.env)) {
        missingEnvironmentVariables.push('fraudBucketName');
    }
    if (!('maxIngestion' in process.env)) {
        missingEnvironmentVariables.push('maxIngestion');
    }
    if (!('performanceStreamName' in process.env)) {
        missingEnvironmentVariables.push('performanceStreamName');
    }
    if (!('fraudStreamName' in process.env)) {
        missingEnvironmentVariables.push('fraudStreamName');
    }
    if (missingEnvironmentVariables.length > 0) {
        throw new Error(
            `[ERROR] MISSING ENVIRONMENT VARIABLES:\n The following variables were not provided: ${missingEnvironmentVariables.join(
                '\n',
            )}`,
        );
    }
}
