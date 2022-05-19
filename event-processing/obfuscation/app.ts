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
        let events : unknown[] = JSON.parse(plaintextData)
        let obfuscatedEvents : ObfuscatedEvent[] = [];
        let data : string;
        if(events.length > 0) {
            for(let i = 0; i < events.length; i++ ) {
                const auditEvent : IAuditEvent = AuditEvent.fromJSONString(JSON.stringify(events[0]));
                obfuscatedEvents.push(ObfuscatedEvent.fromAuditEvent(auditEvent));
            }
            data = Buffer.from(JSON.stringify(obfuscatedEvents)).toString('base64')
        } else {
            const auditEvent : IAuditEvent = AuditEvent.fromJSONString(plaintextData);
            data = Buffer.from(JSON.stringify(ObfuscatedEvent.fromAuditEvent(auditEvent))).toString('base64')
        }
        return {
            recordId: record.recordId,
            result: 'Ok',
            data: data
        } as FirehoseTransformationResultRecord;
    });
    console.log(`Processing completed.  Successful records ${output.length}.`);
    return { records: output };
};
