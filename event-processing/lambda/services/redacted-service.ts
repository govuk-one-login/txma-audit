import {IRedactedAuditEvent,  RedactedAuditEvent} from '../models/redacted-event';

export class AccountsRedactedService {

    public static applyRedaction(snsMessage: string): IRedactedAuditEvent {
        const events: unknown[] = JSON.parse(snsMessage.toString());
        const redactedEvent: IRedactedAuditEvent = RedactedAuditEvent.accountsDataExtractor(events);
        return  redactedEvent;
    }
}
