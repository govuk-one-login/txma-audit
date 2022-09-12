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
        console.error('[ERROR] ENV VAR MISSING: \n missing firehose name enironment variable');
        throw new Error('[ERROR] ENV VAR MISSING: \n missing firehose name enironment variable');
    }

    const sendTextPromise = firehose.putRecord(params).promise();

    await sendTextPromise
        .then((data) => {
            console.log('MessageID is ' + data.RecordId);
        })
        .catch((err) => {
            console.error(err, err.stack);
        });

    return;
};
