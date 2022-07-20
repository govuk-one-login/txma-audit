import { Firehose } from 'aws-sdk';

export class FirehoseService {
    static async putRecordsToFirehoseStream(
        streamName,
        records,
        client: Firehose,
        attemptsMade,
        maxAttempts,
    ): Promise<void> {
        let failedRecords = [];
        const codes = [];
        let errMsg = '';
        // if put_record_batch throws for whatever reason, response['xx'] will error out, adding a check for a valid
        // response will prevent this
        let response;
        try {
            response = client.putRecordBatch({
                DeliveryStreamName: streamName,
                Records: records,
            });
        } catch (e) {
            failedRecords = records;
            errMsg = String(e);
        }

        // if there are no failedRecords (put_record_batch succeeded), iterate over the response to gather results
        if (failedRecords.length <= 0 && response && response['FailedPutCount'] > 0) {
            response['RequestResponses'].forEach();

            for (let idx = 0; idx < response['RequestResponses'].length; idx++) {
                const res = response['RequestResponses'][idx];

                if (!res['ErrorCode'] || res['ErrorCode'] == undefined || res['ErrorCode'] == '') {
                    continue;
                }

                codes.push(res['ErrorCode']);
                failedRecords.push(records[idx]);
            }

            errMsg = 'Individual error codes: ' + codes.join(',');
        }

        if (failedRecords.length > 0) {
            if (attemptsMade + 1 < maxAttempts) {
                console.log(`Some records failed while calling PutRecordBatch to Firehose stream, retrying. ${errMsg}`);
                await this.putRecordsToFirehoseStream(streamName, failedRecords, client, attemptsMade + 1, maxAttempts);
            } else {
                throw new Error(`Could not put records after ${maxAttempts} attempts. ${errMsg}`);
            }
        }
    }
}
