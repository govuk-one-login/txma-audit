import crypto from 'crypto';
import { AuditEvent, IAuditEvent } from '../models/audit-event';

export class ObfuscationService {
    static async obfuscateEvent(auditEvent : IAuditEvent, hmacKey : string): Promise<IAuditEvent> {
        if(auditEvent.user) {
            auditEvent.user.transaction_id = this.obfuscate(auditEvent.user.transaction_id, hmacKey);
            auditEvent.user.email = this.obfuscate(auditEvent.user.email, hmacKey);
            auditEvent.user.phone = this.obfuscate(auditEvent.user.phone, hmacKey);
        }
        if(auditEvent.restricted) {
            let restricted = auditEvent.restricted as any;
            for (const k in restricted) {
                restricted[k] = this.obfuscate(restricted[k], hmacKey)
            }
        }
        return auditEvent;
    }

    public static obfuscate(value : any, key : string): string {
        if(typeof value != 'string')
            value = JSON.stringify(value);
        return crypto.createHmac('sha256', key)
            .update(value)
            .digest('hex');
    }
}