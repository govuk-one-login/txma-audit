import { IAuditEvent } from '../models/audit-event';
import { createHmac } from 'crypto';

export class ObfuscationService {
    static async obfuscateEvent(auditEvent: IAuditEvent, hmacKey: string): Promise<IAuditEvent> {
        if (auditEvent.user) {
            const user = auditEvent.user as any;
            for (const k in user) {
                if (
                    ['ip_address', 'session_id', 'persistent_session_id', 'govuk_signin_journey_id', 'user_id'].indexOf(
                        k,
                    ) == -1
                )
                    user[k] = this.obfuscateField(user[k], hmacKey);
            }
        }

        if (auditEvent.restricted) {
            const restricted = auditEvent.restricted as any;
            for (const k in restricted) {
                if (typeof restricted[k] === 'object') {
                    restricted[k] = this.obfuscateObject(restricted[k], hmacKey);
                } else {
                    restricted[k] = this.obfuscateField(restricted[k], hmacKey);
                }
            }
        }

        return auditEvent;
    }

    public static obfuscateObject(value: any, key: string): any {
        for (const k in value) {
            if (typeof value[k] === 'object') {
                value[k] = this.obfuscateObject(value[k], key);
            } else {
                value[k] = this.obfuscateField(value[k], key);
            }
        }

        return value;
    }

    public static obfuscateField(value: any, key: string): string {
        if (value.length < 1) return value;
        if (typeof value != 'string') value = JSON.stringify(value);
        return createHmac('sha256', key).update(value).digest('hex');
    }

    public static removeEmpty(obj : any) : unknown {
        for (var propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined  || obj[propName] == "") {
            delete obj[propName];
          } else if(Array.isArray(obj[propName])) {
            obj[propName].forEach((value : Object, index: string | number) => {
                obj[propName][index] = this.removeEmpty(value);
            });
          } else if(typeof obj[propName] === 'object') {
            obj[propName] = this.removeEmpty(obj[propName]);
          }
        }
        return obj
    }

    public static removeEmpty(obj : any) : unknown {
        for (var propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined  || obj[propName] == "") {
            delete obj[propName];
          } else if(obj[propName] === typeof Array) {
            obj[propName].forEach((value : Object, index: string | number) => {
                obj[propName][index] = this.removeEmpty(value);
            });
          } else if(obj[propName] === typeof Object) {
            obj[propName] = this.removeEmpty(obj[propName]);
          }
        }
        return obj
    }
}
