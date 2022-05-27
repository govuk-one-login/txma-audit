import {
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
} from 'aws-lambda';
import { AuditEvent, IAuditEvent } from './models/audit-event';
import { ObfuscatedEvent } from './models/obfuscated-event';
import { KeyService } from './services/key-service';
import { ObfuscationService } from './services/obfuscation-service';

export const handler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    /* Process the list of records and transform them */
    const hmacKey : string = await KeyService.getHmacKey();
    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData: string = Buffer.from(record.data, 'base64').toString('ascii');
        const events: unknown[] = JSON.parse(plaintextData);
        const obfuscatedEvents: ObfuscatedEvent[] = [];
        let data: string;
        if (events.length > 0) {
            for (let i = 0; i < events.length; i++) {
                let auditEvent: IAuditEvent = AuditEvent.fromJSONString(JSON.stringify(events[i]));
                ObfuscationService.obfuscateEvent(auditEvent, hmacKey)
                obfuscatedEvents.push(auditEvent);
            }
            data = Buffer.from(JSON.stringify(obfuscatedEvents)).toString('base64');
        } else {
            let auditEvent: IAuditEvent = AuditEvent.fromJSONString(plaintextData);
            ObfuscationService.obfuscateEvent(auditEvent, hmacKey);
            data = Buffer.from(JSON.stringify(auditEvent)).toString('base64');
        }
        return {
            recordId: record.recordId,
            result: 'Ok',
            data: data,
        } as FirehoseTransformationResultRecord;
    });
    console.log(`Processing completed.  Successful records ${output.length}.`);
    return { records: output };
};

