import {EnrichedAuditEvent, IEnrichedAuditEvent} from '../models/enriched-audit-event';
import {IRedactedAuditEvent, RedactedAuditEvent} from '../models/redacted-event';
import {AuditEvent, IAuditEvent} from "../models/audit-event";
import {CleansedEvent, ICleansedEvent} from "../models/cleansed-event";

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


    public static applyRedaction(snsMessage: string): IRedactedAuditEvent[] {

        const events: unknown[] = JSON.parse(snsMessage);
        const redactedEvents: IRedactedAuditEvent[] = [];
        let data: string;
        if (events.length > 0) {
            for (const k in events) {
                const redactedEvent: IRedactedAuditEvent = RedactedAuditEvent.fromJSONString(JSON.stringify(events[k]));
                redactedEvents.push(this.redactedEvent(redactedEvent));
            }
            data = Buffer.from(JSON.stringify(redactedEvents)).toString('base64');
        } else {
            const redactedEvent: IRedactedAuditEvent = RedactedAuditEvent.fromJSONString(snsMessage);
            redactedEvents.push(this.redactedEvent(redactedEvent));
            data = Buffer.from(JSON.stringify(redactedEvents)).toString('base64');
        }

        return redactedEvents;
    }


}
