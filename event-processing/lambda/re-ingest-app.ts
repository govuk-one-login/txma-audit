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

    //validate env vars
    validateEnvironmentVariables();

    const streamName = getStreamName(bucket);
    const maxIngest = Number(process.env.maxIngestion);

    try {
        const s3Object = await S3Service.getObject(bucket, key);

        if (s3Object) {
            let recordBatch: Array<IReIngestRecordInterface> = [];
            let deleteFromS3 = 0;
            let destinationFH = 0;
            const s3ObjectLines = s3Object.split('\n');

            for (let lineIndex = 0; lineIndex < s3ObjectLines.length; lineIndex++) {
                let destination = DestinationEnum.fireHose;

                const currentLine = s3ObjectLines[lineIndex];

                if (currentLine.length <= 0) {
                    continue;
                }

                const jsonData = AuditEvent.fromJSONString(currentLine);
                let s3Payload = {}; //Type?

                if (jsonData.reIngestCount) {
                    jsonData.reIngestCount++;
                } else {
                    jsonData.reIngestCount = 1;
                }

                if (jsonData.reIngestCount > maxIngest) {
                    deleteFromS3 += 1;
                    destination = DestinationEnum.s3;
                    s3Payload = s3Payload + JSON.stringify(jsonData) + '\n';
                }

                if (destination === DestinationEnum.fireHose) {
                    const eventString = JSON.stringify(jsonData);
                    const encoder = new TextEncoder();
                    const messageBytes = encoder.encode(eventString);
                    recordBatch.push({ Data: messageBytes });
                    destinationFH++;
                    if (destinationFH > 499) {
                        //flush max batch
                        await FirehoseService.putRecordsToFirehoseStream(streamName, recordBatch, 0, 20);
                        destinationFH = 0;
                        recordBatch = [];
                    }
                }
            }

            if (destinationFH > 0) {
                try {
                    await FirehoseService.putRecordsToFirehoseStream(streamName, recordBatch, 0, 20);
                } catch (e) {
                    console.log(e);
                    throw e;
                }

                //only delete if sent or limit reached
                await S3Service.deleteObject(bucket, key);
            }

            if (deleteFromS3 > 0) {
                console.log(
                    '[WARN] MAXIMUM RE-INGEST LIMIT REACHED\n' +
                        'One or more event records has been unsuccessfully delivered to splunk: ',
                );

                await S3Service.deleteObject(bucket, key);
            }
        } else {
            await S3Service.deleteObject(bucket, key);
        }
    } catch (error) {
        const errorWithMessage = ErrorService.toErrorWithMessage(error);
        console.log(`[ERROR] REINGEST ERROR:\n Error: ${errorWithMessage.message}`, errorWithMessage.stack);
    }
};

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
