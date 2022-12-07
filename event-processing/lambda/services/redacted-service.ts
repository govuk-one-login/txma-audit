import { IRedactedAuditEvent, RedactedAuditEvent } from '../models/redacted-event-accounts';
import { IRedactedBillingAuditEvent, RedactedBillingAuditEvent } from '../models/redacted-event-billing';

export class RedactedService {

    public static applyRedactionForAccounts(snsMessage: string): IRedactedAuditEvent {
        const events: unknown[] = JSON.parse(snsMessage.toString());
        const redactedEvent: IRedactedAuditEvent = RedactedAuditEvent.accountsDataExtractor(events);
        return redactedEvent;
    }

    public static applyRedactionForBilling(snsMessage: string): IRedactedBillingAuditEvent {
        console.log("SnsMessage for Billing " + snsMessage);
        const events: unknown[] = JSON.parse(snsMessage.toString());
        const redactedEvent: IRedactedBillingAuditEvent = RedactedBillingAuditEvent.billingDataExtractor(events);
        return redactedEvent;
    }

}
