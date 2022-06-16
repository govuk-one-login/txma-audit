import crypto from 'crypto';
import { IAuditEvent } from '../models/audit-event';

export class ObfuscationService {
    static async obfuscateEvent(auditEvent: IAuditEvent, hmacKey: string): Promise<IAuditEvent> {
        if (auditEvent.user) {
            const user = auditEvent.user as any;
            for (const k in user) {
                if (['transaction_id', 'email', 'phone'].indexOf(k) !== -1) user[k] = this.obfuscate(user[k], hmacKey);
            }
        }

        if (auditEvent.restricted) {
            const restricted = auditEvent.restricted as any;
            for (const k in restricted) {
                restricted[k] = this.obfuscate(restricted[k], hmacKey);
            }
        }

        return auditEvent;
    }

    public static obfuscate(value: any, key: string): string {
        if (typeof value != 'string') value = JSON.stringify(value);

        return crypto.createHmac('sha256', key).update(value).digest('hex');
    }
}
