import {
    FirehoseRecordTransformationStatus,
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
} from 'aws-lambda';
import { AuditEvent, IAuditEvent } from './models/audit-event';
import { CleansingService } from './services/cleansing-service';
import { ICleansedEvent } from './models/cleansed-event';

export const handler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    /* Process the list of records and transform them */
    const transformationResult: FirehoseRecordTransformationStatus = 'Ok';

    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData: string = Buffer.from(record.data, 'base64').toString('ascii');
        const events: unknown[] = JSON.parse(plaintextData);
        const cleansedEvents: ICleansedEvent[] = [];
        let data: string;

        if (events.length > 0) {
            for (let i = 0; i < events.length; i++) {
                const auditEvent: IAuditEvent = AuditEvent.fromJSONString(JSON.stringify(events[i]));
                cleansedEvents.push(CleansingService.cleanseEvent(auditEvent));
            }
            data = Buffer.from(JSON.stringify(cleansedEvents)).toString('base64');
        } else {
            const auditEvent: IAuditEvent = AuditEvent.fromJSONString(plaintextData);
            const cleansedEvent = CleansingService.cleanseEvent(auditEvent);
            data = Buffer.from(JSON.stringify(cleansedEvent)).toString('base64');
        }

        return {
            recordId: record.recordId,
            result: transformationResult,
            data: data,
        } as FirehoseTransformationResultRecord;
    });

    return { records: output };
};
