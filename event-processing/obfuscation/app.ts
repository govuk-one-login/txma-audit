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
    console.log("Recieved Event: "+ JSON.stringify(event));
    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData : string = Buffer.from(record.data, 'base64').toString('ascii');
        console.log("Record Data: " + plaintextData);
        const auditEvent : IAuditEvent = AuditEvent.fromJSONString(plaintextData);
        let obfuscatedEvent = ObfuscatedEvent.fromAuditEvent(auditEvent);
        console.log("Obfuscated Data: " + JSON.stringify(obfuscatedEvent));
        return {
            recordId: record.recordId,
            result: 'Ok',
            data: Buffer.from(JSON.stringify(obfuscatedEvent)).toString('base64'),
        } as FirehoseTransformationResultRecord;
    });
    console.log(`Processing completed.  Successful records ${output.length}.`);
    console.log("Output message: " + JSON.stringify(output));
    return { records: output };
};
