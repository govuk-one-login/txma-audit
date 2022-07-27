import AWS from 'aws-sdk';
import { FirehoseService } from './services/firehose-service';
import { Context } from 'aws-lambda';
import { S3Event } from 'aws-lambda/trigger/s3';
import { DestinationEnum } from './enums/destination.enum';
import { AuditEvent } from './models/audit-event';
import { IReIngestRecordInterface } from './models/re-ingest-record.interface';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const handler = async (event: S3Event, context?: Context): Promise<void> => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    const streamName = ''; //Environment var stream name
    const maxIngest = 5;
    const firehose = new AWS.Firehose({ region: 'eu-west-2' }); //Environment variable region
    const s3 = new S3Client({ region: 'eu-west-2' });

    try {
        //get s3 object
        const s3Response = await s3.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            }),
        );

        const eventRecord = s3Response.Body?.toString('utf-8');

        if (eventRecord) {
            let recordBatch: Array<IReIngestRecordInterface> = [];
            let destinationS3 = 0;
            let destinationFH = 0;
            const s3Payload = {};

            for (const line in eventRecord.split('\n')) {
                let destination = DestinationEnum.fireHose;
                if (line.length <= 0) {
                    continue;
                }

                const data = JSON.parse(line);
                const message = Buffer.from(data['rawData'], 'base64').toString('utf-8');
                for (let messageLine in message.split('\n')) {
                    if (messageLine.length <= 0) {
                        continue;
                    }

                    const jsonData = AuditEvent.fromJSONString(JSON.parse(messageLine));
                    const reIngestCount = 1;
                    let s3Payload = {}; //Type?

                    if (jsonData.reIngestCount) {
                        jsonData.reIngestCount++;
                    } else {
                        jsonData.reIngestCount = 1;
                    }

                    if (reIngestCount > maxIngest) {
                        destinationS3 += 1;
                        destination = DestinationEnum.s3;
                        s3Payload = s3Payload + JSON.stringify(jsonData) + '\n';
                    }

                    if (destination === DestinationEnum.fireHose) {
                        messageLine = JSON.stringify(jsonData);
                        const encoder = new TextEncoder();
                        const messageBytes = encoder.encode(messageLine);
                        recordBatch.push({ Data: messageBytes });
                        destinationFH += 1;
                        if (destinationFH > 499) {
                            //flush max batch
                            await FirehoseService.putRecordsToFirehoseStream(streamName, recordBatch, firehose, 0, 20);
                            destinationFH = 0;
                            recordBatch = [];
                        }
                    }
                }
            }

            if (destinationFH > 0) {
                await FirehoseService.putRecordsToFirehoseStream(streamName, recordBatch, firehose, 0, 20);
            }
            if (destinationS3 > 0) {
                console.log(
                    '[WARN] MAXIMUM RE-INGEST LIMIT REACHED\n' +
                        'One or more event records has been unsuccessfully delivered to splunk: ',
                );

                try {
                    const destParams = {
                        Bucket: 'bucketforfailures', //rename
                        Key: 'reIngest-failure-' + key,
                        Body: s3Payload,
                    };

                    const putResult = await s3.putObject(destParams).promise();

                    if (putResult.$response.error) {
                        console.log(
                            `[ERROR] UPLOAD TO S3 ERROR:\n Response Error: ${putResult.$response.error}`,
                            putResult.$response.error.stack,
                        );
                    } else {
                        console.log(putResult.$response.data);
                    }

                    if (putResult.$response.httpResponse.statusCode === 200) {
                        const deleteParams = {
                            Bucket: bucket,
                            Key: key,
                        };

                        const deleteResult = await s3.deleteObject(deleteParams).promise();

                        if (deleteResult.$response.error) {
                            console.log(
                                `[ERROR] DELETE FROM S3 ERROR:\n Response Error: ${deleteResult.$response.error}`,
                                deleteResult.$response.error.stack,
                            );
                        } else {
                            console.log(deleteResult.$response.data);
                        }
                    }
                } catch (error) {
                    console.log(error);
                    return;
                }
            }
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
};
