import crypto from 'crypto';
import { AuditEvent, IAuditEvent } from '../models/audit-event';

export class ObfuscationService {
    static async obfuscateEvent(auditEvent : IAuditEvent, hmacKey : string): Promise<IAuditEvent> {
        if(auditEvent.user) {
            let user = auditEvent.user as any;
            for (const k in user) {
                if(k === "ip_address")
                    continue;
                user[k] = this.obfuscate(user[k], hmacKey)
            }
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