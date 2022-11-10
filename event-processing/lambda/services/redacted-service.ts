import {IRedactedAuditEvent,  RedactedAuditEvent} from '../models/redacted-event';

export class RedactedService {

    static redactedEvent(auditEvent: IRedactedAuditEvent): IRedactedAuditEvent {
        return new RedactedAuditEvent(
            auditEvent.event_id,
            auditEvent.event_name,
            auditEvent.timestamp,
            auditEvent.timestamp_formatted,
            auditEvent.reIngestCount,
            auditEvent.user,
        );
    }

    public static applyRedaction(snsMessage: string): IRedactedAuditEvent {
        const events: unknown[] = JSON.parse(snsMessage.toString());
        const redactedEvent: IRedactedAuditEvent = RedactedAuditEvent.accountsDataExtractor(events);
        return  redactedEvent;
    }
}
