import {
    FirehoseRecordTransformationStatus,
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
} from 'aws-lambda';
import { HmacKeysEnum } from './enums/hmac-key.enum';
import { EnrichedAuditEvent, IEnrichedAuditEvent } from './models/enriched-audit-event';
import { CleansingService } from './services/cleansing-service';
import { getHmacKey } from './services/key-service';
import { ObfuscationService } from './services/obfuscation-service';

export const handler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    /* Process the list of records and transform them */
    let transformationResult: FirehoseRecordTransformationStatus = 'Ok';
    let hmacKey = '';

    try {
        hmacKey = await getHmacKey(HmacKeysEnum.performance);
    } catch (e) {
        transformationResult = 'ProcessingFailed';
        console.log('An error occurred getting the cleanser hmac key.  Failed with ' + e);
    }

    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData: string = Buffer.from(record.data, 'base64').toString('utf-8');
        const events: unknown[] = JSON.parse(plaintextData);
        const cleansedEvents: unknown[] = [];
        let data: string;

        if (transformationResult === 'ProcessingFailed')
            return {
                recordId: record.recordId,
                result: transformationResult,
                data: record.data,
            } as FirehoseTransformationResultRecord;

        if (events.length > 0) {
            for (const k in events) {
                const auditEvent: IEnrichedAuditEvent = EnrichedAuditEvent.fromJSONString(JSON.stringify(events[k]));
                const cleansedEvent = CleansingService.cleanseEvent(auditEvent);
                const obfuscatedEvent = ObfuscationService.obfuscateCleansedEvent(cleansedEvent, hmacKey);
                cleansedEvents.push(obfuscatedEvent);
            }
            data = Buffer.from(JSON.stringify(cleansedEvents)).toString('base64');
        } else {
            const auditEvent: IEnrichedAuditEvent = EnrichedAuditEvent.fromJSONString(plaintextData);
            const cleansedEvent = CleansingService.cleanseEvent(auditEvent);
            const obfuscatedEvent = ObfuscationService.obfuscateCleansedEvent(cleansedEvent, hmacKey);
            data = Buffer.from(JSON.stringify(obfuscatedEvent)).toString('base64');
        }

        return {
            recordId: record.recordId,
            result: transformationResult,
            data: data,
        } as FirehoseTransformationResultRecord;
    });

    return { records: output };
};
