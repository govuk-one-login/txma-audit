import { IReIngestRecordInterface } from '../models/re-ingest-record.interface';
import { FirehoseClient, PutRecordBatchCommand, PutRecordBatchCommandOutput } from '@aws-sdk/client-firehose';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ErrorService } from './error-service';

export class FirehoseService {
    static client = new FirehoseClient({ region: 'eu-west-2' });

    static async putRecordsToFirehoseStream(
        streamName: string,
        records: Array<IReIngestRecordInterface>,
        attemptsMade: number,
        maxAttempts: number,
    ): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let failedRecords: Array<IReIngestRecordInterface> = [];
            const codes = [];
            let errMsg = '';
            // if putRecordBatch throws for whatever reason, response['xx'] will error out, adding a check for a valid
            // response will prevent this
            let response: PutRecordBatchCommandOutput = { $metadata: {}, FailedPutCount: 0, RequestResponses: [] };
            try {
                response = await this.client.send(
                    new PutRecordBatchCommand({
                        DeliveryStreamName: streamName,
                        Records: records,
                    }),
                );
            } catch (e) {
                failedRecords = records;
                errMsg = String(e);
            }

            // if there are no failedRecords (putRecordBatch succeeded), iterate over the response to gather results
            if (
                failedRecords.length <= 0 &&
                response &&
                response.FailedPutCount &&
                response.RequestResponses &&
                response.FailedPutCount > 0
            ) {
                for (let idx = 0; idx < response.RequestResponses.length; idx++) {
                    const res = response.RequestResponses[idx];

                    if (!res.ErrorCode || res.ErrorCode == undefined || res.ErrorCode == '') {
                        continue;
                    }

                    codes.push(res.ErrorCode);
                    failedRecords.push(records[idx]);
                }

                errMsg = 'Individual error codes: ' + codes.join(',');
            }

            if (failedRecords.length > 0) {
                if (attemptsMade + 1 < maxAttempts) {
                    console.log(
                        `Some records failed while calling PutRecordBatch to Firehose stream, retrying. ${errMsg}`,
                    );

                    try {
                        await this.putRecordsToFirehoseStream(streamName, failedRecords, attemptsMade + 1, maxAttempts);
                    } catch (error) {
                        console.log(`Error sending records to firehose. ${error}`);
                    }
                } else {
                    reject(`Could not put records after ${maxAttempts} attempts. ${errMsg}`);
                }
            }

            resolve();
        });
    }
}
