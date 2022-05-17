import {
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
} from 'aws-lambda';

import { AuditEvent, IAuditEvent } from './models/audit-event';
import { ObfuscatedEvent } from './models/obfuscated-event';

export const handler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    /* Process the list of records and transform them */
    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData : string = Buffer.from(record.data, 'base64').toString('ascii');
        const auditEvent : IAuditEvent = AuditEvent.fromJSONString(plaintextData);
        let obfuscatedEvent = ObfuscatedEvent.fromAuditEvent(auditEvent);

        return {
            recordId: record.recordId,
            result: 'Ok',
            data: Buffer.from(JSON.stringify(obfuscatedEvent)).toString('base64'),
        } as FirehoseTransformationResultRecord;
    });
    console.log(`Processing completed.  Successful records ${output.length}.`);
    return { records: output };
};