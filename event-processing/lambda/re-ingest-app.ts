import { ISplunkDeliveryFailureRecord } from './models/splunk-delivery-failure-record';
import AWS from 'aws-sdk';
import { PutRecordInput } from 'aws-sdk/clients/firehose';
import { GetObjectOutput } from 'aws-sdk/clients/s3';

export const handler = async (event: any, context: any): Promise<string> => {
    const bucket = event['Records'][0]['s3']['bucket']['name'];
    const key = decodeURI(event['Records'][0]['s3']['object']['key']);

    const streamName = ''; //Environment var stream name
    const maxIngest = 9;
    const firehose = new AWS.Firehose({ region: 'eu-west-2' }); //Environment variable region
    const s3 = new AWS.S3({ region: 'eu-west-2' }); //Environment variable region

    //get s3 object
    const s3Response = await s3
        .getObject({
            Bucket: bucket,
            Key: key,
        })
        .promise();

    const eventRecord = s3Response.Body?.toString('utf-8');

    if (eventRecord) {
        let destinationS3 = 0;
        const s3Payload = {};

        for (const line in eventRecord.split('\n')) {
            if (line.length <= 0) {
                continue;
            }

            const data = JSON.parse(line);
            const message = Buffer.from(data['rawData'], 'base64').toString('utf-8');
            for (const messageLine in message.split('\n')) {
                if (messageLine.length <= 0) {
                    continue;
                }

                try {
                    const jsonData = JSON.parse(messageLine);
                    let fieldsToReIngest: any;
                    let reIngestCount = 1;
                    let messageBucket = '';
                    let source = 'aws:reingested';
                    let sourceType = 'aws:firehose';

                    //Get the metadata
                    if (jsonData['source'] && jsonData['source'] != 'None') {
                        source = jsonData['source'];
                    }
                    if (jsonData['sourcetype'] && jsonData['sourcetype'] != 'None') {
                        sourceType = jsonData['sourcetype'];
                    }

                    if (jsonData['fields'] && jsonData['fields'] != 'None') {

                        fieldsToReIngest = jsonData['fields'] //get reingest fields
                        reIngestCount = parseInt(fieldsToReIngest['reingest']) + 1 //advance counter

                        fieldsToReIngest['reingest'] = String(reIngestCount);
                        messageBucket = fieldsToReIngest["frombucket"]
                    } else {
                        fieldsToReIngest['reingest'] = '1';
                        fieldsToReIngest['frombucket'] = bucket;
                        messageBucket = bucket;
                        reIngestCount = 1;
                    }

                    if (reIngestCount > maxIngest) {
                        destinationS3 += 1;

                        if()
                    }
                }
            }
        }
    }

    const putRecordRequest: PutRecordInput = {
        Record: {
            Data: '',
        },
        DeliveryStreamName: '',
    };

    firehose.putRecord();

    return record.rawData;
};
