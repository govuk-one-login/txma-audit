import {
    FirehoseRecordTransformationStatus,
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
} from 'aws-lambda';
import { AuditEvent, IAuditEvent } from './models/audit-event';
import { KeyService } from './services/key-service';
import { ObfuscationService } from './services/obfuscation-service';

export const handler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    /* Process the list of records and transform them */
    let transformationResult : FirehoseRecordTransformationStatus = 'Ok';
    let hmacKey : string = "";
    
    try {
        hmacKey = await KeyService.getHmacKey();
    }
    catch(e) {
        transformationResult = 'ProcessingFailed';
        console.log("An error occured getting the hmac key.  Failed with error: " + e);
    }

    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData: string = Buffer.from(record.data, 'base64').toString('ascii');
        const events: unknown[] = JSON.parse(plaintextData);
        const obfuscatedEvents: IAuditEvent[] = [];
        let data: string;
        if(transformationResult === 'ProcessingFailed')
            return {
                recordId: record.recordId,
                result: transformationResult,
                data: record.data
            } as FirehoseTransformationResultRecord;
        
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
            result: transformationResult,
            data: data,
        } as FirehoseTransformationResultRecord;
    });
    if(transformationResult === 'ProcessingFailed')
        console.log(`Processing completed.  Failed records ${output.length}.`);
    else
        console.log(`Processing completed.  Successful records ${output.length}.`);
    return { records: output };
};
