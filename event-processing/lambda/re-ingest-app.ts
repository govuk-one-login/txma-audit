import AWS from 'aws-sdk';
import {FirehoseService} from "./services/firehose-service";

export const handler = async (event: any, context: any): Promise<void> => {
    const bucket = event['Records'][0]['s3']['bucket']['name'];
    const key = decodeURI(event['Records'][0]['s3']['object']['key']);

    const streamName = ''; //Environment var stream name
    const maxIngest = 9;
    const firehose = new AWS.Firehose({ region: 'eu-west-2' }); //Environment variable region
    const s3 = new AWS.S3({ region: 'eu-west-2' }); //Environment variable region

    try{
        //get s3 object
        const s3Response = await s3
            .getObject({
                Bucket: bucket,
                Key: key,
            })
            .promise();

        const eventRecord = s3Response.Body?.toString('utf-8');

        if (eventRecord) {
            let recordBatch = [];
            let destinationS3 = 0;
            let destinationFH = 0;
            const s3Payload = {};

            for (const line in eventRecord.split('\n')) {
                let dest = 'FH';
                if (line.length <= 0) {
                    continue;
                }

                const data = JSON.parse(line);
                const message = Buffer.from(data['rawData'], 'base64').toString('utf-8');
                for (let messageLine in message.split('\n')) {
                    if (messageLine.length <= 0) {
                        continue;
                    }

                    const jsonData = JSON.parse(messageLine);
                    let fieldsToReIngest: any;
                    let reIngestCount = 1;
                    let messageBucket = '';
                    let source = 'aws:reingested';
                    let sourceType = 'aws:firehose';
                    let s3Payload = {}; //Type?
                    let reIngestJson = {};

                    try {

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

                            if (s3Payload['messageBucket'] === '' || s3Payload['messageBucket'] === undefined){
                                s3Payload['messageBucket'] = JSON.stringify(jsonData['event']) + '\n'
                            } else {
                                s3Payload['messageBucket'] = s3Payload['messageBucket'] + JSON.stringify(jsonData['event']) + '\n'
                            }

                            dest = 's3'
                        } else {
                            if (jsonData['time'] === '' || jsonData['time'] === undefined){
                                reIngestJson = {'sourcetype':sourceType, 'source':source, 'event':jsonData['event'], 'fields': fieldsToReIngest}
                            } else {
                                reIngestJson = {'sourcetype':sourceType, 'source':source, 'event':jsonData['event'], 'fields': fieldsToReIngest, 'time':jsonData['time']}
                            }
                        }
                    }catch(e){
                        console.log(e);
                        reIngestJson = {'reingest':jsonData['fields'], 'sourcetype':sourceType, 'source':'reingest'+reIngestCount, 'event':jsonData['event'], 'detail-type':'Reingested Firehose Message', 'fields': fieldsToReIngest, 'time':jsonData['time']}
                    }

                    if (dest=='FH') {
                        messageLine = JSON.stringify(reIngestJson);
                        const encoder = new TextEncoder();
                        const messageBytes = encoder.encode(messageLine);
                        recordBatch.push({'Data': messageBytes})
                        destinationFH += 1
                        if (destinationFH > 499) {
                            //flush max batch
                            await FirehoseService.putRecordsToFirehoseStream(streamName, recordBatch, firehose, 0, 20)
                            destinationFH = 0
                            recordBatch = []
                        }
                    }
                }
            }
        }
    }catch(e){
        console.log(e);
        throw;
    }
};


