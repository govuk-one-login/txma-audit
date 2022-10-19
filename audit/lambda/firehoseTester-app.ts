import { config, Firehose } from 'aws-sdk';
import { IAuditEvent } from './models/audit-event';

export const handler = async (record: IAuditEvent): Promise<void> => {
    config.update({ region: process.env.AWS_REGION });

    let params: Firehose.PutRecordInput = {
        DeliveryStreamName: '',
        Record: { Data: '' },
    };

    const firehose = new Firehose({ apiVersion: '2015-08-04' });

    if (process.env.firehoseName) {
        params = {
            DeliveryStreamName: process.env.firehoseName,
            Record: { Data: JSON.stringify(record) },
        };
    } else {
        console.error('[ERROR] ENV VAR MISSING: \n missing firehose name environment variable');
        throw new Error('[ERROR] ENV VAR MISSING: \n missing firehose name environment variable');
    }

    try {
        const response = await firehose.putRecord(params).promise();
        console.log(`MessageID is ${response.RecordId}`);
    } catch (error) {
        console.error('failed to put record into firehose. stack trace below');
        console.error(error);
    }
    return;
};
