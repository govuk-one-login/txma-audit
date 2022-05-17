import {
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
} from 'aws-lambda';

export const handler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    /* Process the list of records and transform them */
    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData = Buffer.from(record.data, 'base64').toString('ascii');
        console.log(plaintextData);
        return {
            recordId: record.recordId,
            result: 'Ok',
            data: record.data,
        } as FirehoseTransformationResultRecord;
    });
    console.log(`Processing completed.  Successful records ${output.length}.`);
    return { records: output };
};
