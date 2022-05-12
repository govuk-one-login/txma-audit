import { AuditEventUnknownFields, IAuditEventUnknownFields } from './audit-event-unknown-fields';
import { IUserUnknownFields, UserUnknownFields } from './user-unknown-fields.interface';

export interface IAuditEvent {
    event_id?: string;
    request_id?: string;
    session_id?: string;
    client_id?: string;
    timestamp: number;
    timestamp_formatted?: string;
    event_name: string;
    user?: IAuditEventUserMessage | undefined;
    platform?: IAuditEventPlatformMessage | undefined;
    restricted?: IAuditEventRestrictedMessage | undefined;
    extensions?: IAuditEventExtensionsMessage | undefined;
    persistent_session_id?: string;
}

export interface IAuditEventUserMessage {
    id: string;
    email: string;
    phone: string;
    ip_address: string;
}

export interface IAuditEventKeyValuePairMessage {
    key: string;
    value: string;
}

export interface IAuditEventPlatformMessage {
    keyValuePair: IAuditEventKeyValuePairMessage[];
}

export interface IAuditEventRestrictedMessage {
    keyValuePair: IAuditEventKeyValuePairMessage[];
}

export interface IAuditEventExtensionsMessage {
    keyValuePair: IAuditEventKeyValuePairMessage[];
}

function createBaseAuditEvent(): IAuditEvent {
    return {
        event_id: '',
        request_id: '',
        session_id: '',
        client_id: '',
        timestamp: 0,
        timestamp_formatted: '',
        event_name: '',
        user: undefined,
        platform: undefined,
        restricted: undefined,
        extensions: undefined,
        persistent_session_id: '',
    };
}

export class AuditEvent {
    static fromJSONString(object: string) {
        const event = createBaseAuditEvent();
        const jsonObject = JSON.parse(object);
        const unknown_fields = new Map<string, unknown>();
        for (const value in jsonObject) {
            switch (value) {
                case 'event_id':
                    event.event_id = jsonObject[value];
                    break;
                case 'request_id':
                    event.request_id = jsonObject[value];
                    break;
                case 'session_id':
                    event.session_id = jsonObject[value];
                    break;
                case 'client_id':
                    event.client_id = jsonObject[value];
                    break;
                case 'timestamp':
                    event.timestamp = jsonObject[value];
                    break;
                case 'timestamp_formatted':
                    event.timestamp_formatted = jsonObject[value];
                    break;
                case 'event_name':
                    event.event_name = jsonObject[value];
                    break;
                case 'user':
                    event.user = AuditEventUserMessage.fromObject(jsonObject[value]);
                    break;
                case 'platform':
                    event.platform = jsonObject[value];
                    break;
                case 'restricted':
                    event.restricted = jsonObject[value];
                    break;
                case 'extensions':
                    event.extensions = jsonObject[value];
                    break;
                case 'persistent_session_id':
                    event.persistent_session_id = jsonObject[value];
                    break;
                default:
                    unknown_fields.set(value, jsonObject[value]);
                    break;
            }
        }

        if (unknown_fields.size > 0)
            return AuditEventUnknownFields.fromAuditMessage(event, unknown_fields) as IAuditEventUnknownFields;
        return event;
    }

    static toJSON(message: IAuditEvent): unknown {
        const obj: any = {};
        message.event_id !== undefined && (obj.event_id = message.event_id);
        message.request_id !== undefined && (obj.request_id = message.request_id);
        message.session_id !== undefined && (obj.session_id = message.session_id);
        message.client_id !== undefined && (obj.client_id = message.client_id);
        message.timestamp !== undefined && (obj.timestamp = Math.round(message.timestamp));
        message.timestamp_formatted !== undefined && (obj.timestamp_formatted = message.timestamp_formatted);
        message.event_name !== undefined && (obj.event_name = message.event_name);
        message.user !== undefined &&
            (obj.user = message.user ? AuditEventUserMessage.toJSON(message.user) : undefined);
        message.platform !== undefined &&
            (obj.platform = message.platform ? AuditEventPlatformMessage.toJSON(message.platform) : undefined);
        message.restricted !== undefined &&
            (obj.restricted = message.restricted ? AuditEventRestrictedMessage.toJSON(message.restricted) : undefined);
        message.extensions !== undefined &&
            (obj.extensions = message.extensions ? AuditEventExtensionsMessage.toJSON(message.extensions) : undefined);
        message.persistent_session_id !== undefined && (obj.persistent_session_id = message.persistent_session_id);
        return obj;
    }
}

function createBaseAuditEventUserMessage(): IAuditEventUserMessage {
    return { id: '', email: '', phone: '', ip_address: '' };
}

export class AuditEventUserMessage {
    static fromObject(object: any): IAuditEventUserMessage {
        const unknown_fields = new Map<string, any>();
        const user = createBaseAuditEventUserMessage();
        for (const value in object) {
            switch (value) {
                case 'id':
                    user.id = object.id;
                    break;
                case 'email':
                    user.email = object.email;
                    break;
                case 'phone':
                    user.phone = object.phone;
                    break;
                case 'ip_address':
                    user.ip_address = object.ip_address;
                    break;
                default:
                    unknown_fields.set(value, object[value]);
                    break;
            }
        }
        if (unknown_fields.size > 0) {
            return UserUnknownFields.fromAuditEvent(user, unknown_fields) as IUserUnknownFields;
        }
        return user;
    }

    static toJSON(message: IAuditEventUserMessage): unknown {
        const obj: any = {};
        message.id !== undefined && (obj.id = message.id);
        message.email !== undefined && (obj.email = message.email);
        message.phone !== undefined && (obj.phone = message.phone);
        message.ip_address !== undefined && (obj.ip_address = message.ip_address);
        return obj;
    }
}

export const AuditEventKeyValuePairMessage = {
    fromJSON(object: any): IAuditEventKeyValuePairMessage {
        return {
            key: isSet(object.key) ? String(object.key) : '',
            value: isSet(object.value) ? String(object.value) : '',
        };
    },

    toJSON(message: IAuditEventKeyValuePairMessage): unknown {
        const obj: any = {};
        message.key !== undefined && (obj.key = message.key);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
};

export class AuditEventPlatformMessage {
    static fromJSON(object: any): IAuditEventPlatformMessage {
        return {
            keyValuePair: Array.isArray(object?.keyValuePair)
                ? object.keyValuePair.map((e: any) => AuditEventKeyValuePairMessage.fromJSON(e))
                : [],
        };
    }

    static toJSON(message: IAuditEventPlatformMessage): unknown {
        const obj: any = {};
        if (message.keyValuePair) {
            obj.keyValuePair = message.keyValuePair.map((e) =>
                e ? AuditEventKeyValuePairMessage.toJSON(e) : undefined,
            );
        } else {
            obj.keyValuePair = [];
        }
        return obj;
    }
}

export class AuditEventRestrictedMessage {
    static fromJSON(object: any): IAuditEventRestrictedMessage {
        return {
            keyValuePair: Array.isArray(object?.keyValuePair)
                ? object.keyValuePair.map((e: any) => AuditEventKeyValuePairMessage.fromJSON(e))
                : [],
        };
    }

    static toJSON(message: IAuditEventRestrictedMessage): unknown {
        const obj: any = {};
        if (message.keyValuePair) {
            obj.keyValuePair = message.keyValuePair.map((e) =>
                e ? AuditEventKeyValuePairMessage.toJSON(e) : undefined,
            );
        } else {
            obj.keyValuePair = [];
        }
        return obj;
    }
}

export class AuditEventExtensionsMessage {
    static fromJSON(object: any): IAuditEventExtensionsMessage {
        return {
            keyValuePair: Array.isArray(object?.keyValuePair)
                ? object.keyValuePair.map((e: any) => AuditEventKeyValuePairMessage.fromJSON(e))
                : [],
        };
    }

    static toJSON(message: IAuditEventExtensionsMessage): unknown {
        const obj: any = {};
        if (message.keyValuePair) {
            obj.keyValuePair = message.keyValuePair.map((e) =>
                e ? AuditEventKeyValuePairMessage.toJSON(e) : undefined,
            );
        } else {
            obj.keyValuePair = [];
        }
        return obj;
    }
}

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}
