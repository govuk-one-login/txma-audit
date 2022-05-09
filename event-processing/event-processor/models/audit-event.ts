import { IAuditEventUnknownFields } from './audit-event-unknown-fields';
import { IUserUnknownFields } from './user-unknown-fields.interface';

export interface AuditEvent {
    event_id: string;
    request_id: string;
    session_id: string;
    client_id: string;
    timestamp: number;
    timestamp_formatted: string;
    event_name: string;
    user: AuditEvent_userMessage | IUserUnknownFields | undefined;
    platform: AuditEvent_platformMessage | undefined;
    restricted: AuditEvent_restrictedMessage | undefined;
    extensions: AuditEvent_extensionsMessage | undefined;
    persistent_session_id: string;
}

export interface AuditEvent_userMessage {
    id: string;
    email: string;
    phone: string;
    ip_address: string;
}

export interface AuditEvent_keyValuePairMessage {
    key: string;
    value: string;
}

export interface AuditEvent_platformMessage {
    keyValuePair: AuditEvent_keyValuePairMessage[];
}

export interface AuditEvent_restrictedMessage {
    keyValuePair: AuditEvent_keyValuePairMessage[];
}

export interface AuditEvent_extensionsMessage {
    keyValuePair: AuditEvent_keyValuePairMessage[];
}

function createBaseAuditEvent(): AuditEvent {
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

export const AuditEvent = {
    fromJSONString(object: string) {
        let event = createBaseAuditEvent();
        let jsonObject = JSON.parse(object);
        let unknown_fields = new Map<string, unknown>();
        for (var value in jsonObject) {  
            switch(value) {
                case "event_id":
                    event.event_id = jsonObject[value];
                    break;
                case "request_id":
                    event.request_id = jsonObject[value];
                    break;
                case "session_id":
                    event.session_id = jsonObject[value];
                    break;
                case "client_id":
                    event.client_id = jsonObject[value];
                    break;
                case "timestamp":
                    event.timestamp = jsonObject[value];
                    break;
                case "timestamp_formatted":
                    event.timestamp_formatted = jsonObject[value];
                    break;
                case "event_name":
                    event.event_name = jsonObject[value];
                    break;
                case "user":
                    event.user = AuditEvent_userMessage.fromObject(jsonObject[value]);
                    break;
                case "platform":
                    event.platform = jsonObject[value];
                    break;
                case "restricted":
                    event.restricted = jsonObject[value];
                    break;
                case "extensions":
                    event.extensions = jsonObject[value];
                    break;
                case "persistent_session_id":
                    event.persistent_session_id = jsonObject[value];
                    break;
                default:
                    unknown_fields.set(value, jsonObject[value]);
                    break;
            }
        }

        if (unknown_fields.size > 0) 
            return IAuditEventUnknownFields.fromAuditMessage(event, unknown_fields)
        return event
    },

    toJSON(message: AuditEvent): unknown {
        const obj: any = {};
        message.event_id !== undefined && (obj.event_id = message.event_id);
        message.request_id !== undefined && (obj.request_id = message.request_id);
        message.session_id !== undefined && (obj.session_id = message.session_id);
        message.client_id !== undefined && (obj.client_id = message.client_id);
        message.timestamp !== undefined && (obj.timestamp = Math.round(message.timestamp));
        message.timestamp_formatted !== undefined && (obj.timestamp_formatted = message.timestamp_formatted);
        message.event_name !== undefined && (obj.event_name = message.event_name);
        message.user !== undefined &&
            (obj.user = message.user ? AuditEvent_userMessage.toJSON(message.user) : undefined);
        message.platform !== undefined &&
            (obj.platform = message.platform ? AuditEvent_platformMessage.toJSON(message.platform) : undefined);
        message.restricted !== undefined &&
            (obj.restricted = message.restricted ? AuditEvent_restrictedMessage.toJSON(message.restricted) : undefined);
        message.extensions !== undefined &&
            (obj.extensions = message.extensions ? AuditEvent_extensionsMessage.toJSON(message.extensions) : undefined);
        message.persistent_session_id !== undefined && (obj.persistent_session_id = message.persistent_session_id);
        return obj;
    },
};

function createBaseAuditEvent_userMessage(): AuditEvent_userMessage {
    return { id: '', email: '', phone: '', ip_address: '' };
}

export const AuditEvent_userMessage = {
    fromObject(object: any): AuditEvent_userMessage {
        let unknown_fields = new Map<string, any>();
        let user = createBaseAuditEvent_userMessage();
        for (var value in object) {
            switch(value) {
                case "id":
                    user.id = object.id;
                    break;
                case "email":
                    user.email = object.email;
                    break;
                case "phone":
                    user.phone = object.phone;
                    break;
                case "ip_address":
                    user.ip_address = object.ip_address;
                    break;
                default:
                    unknown_fields.set(value, object[value]);
                    break;
            }
        }
        if(unknown_fields.size > 0){
            return IUserUnknownFields.fromAuditEvent(user, unknown_fields)
        }
        return user;
    },
    
    toJSON(message: AuditEvent_userMessage): unknown {
        const obj: any = {};
        message.id !== undefined && (obj.id = message.id);
        message.email !== undefined && (obj.email = message.email);
        message.phone !== undefined && (obj.phone = message.phone);
        message.ip_address !== undefined && (obj.ip_address = message.ip_address);
        return obj;
    },
};

function createBaseAuditEvent_keyValuePairMessage(): AuditEvent_keyValuePairMessage {
    return { key: '', value: '' };
}

export const AuditEvent_keyValuePairMessage = {
    fromJSON(object: any): AuditEvent_keyValuePairMessage {
        return {
            key: isSet(object.key) ? String(object.key) : '',
            value: isSet(object.value) ? String(object.value) : '',
        };
    },

    toJSON(message: AuditEvent_keyValuePairMessage): unknown {
        const obj: any = {};
        message.key !== undefined && (obj.key = message.key);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
};

function createBaseAuditEvent_platformMessage(): AuditEvent_platformMessage {
    return { keyValuePair: [] };
}

export const AuditEvent_platformMessage = {
    fromJSON(object: any): AuditEvent_platformMessage {
        return {
            keyValuePair: Array.isArray(object?.keyValuePair)
                ? object.keyValuePair.map((e: any) => AuditEvent_keyValuePairMessage.fromJSON(e))
                : [],
        };
    },

    toJSON(message: AuditEvent_platformMessage): unknown {
        const obj: any = {};
        if (message.keyValuePair) {
            obj.keyValuePair = message.keyValuePair.map((e) =>
                e ? AuditEvent_keyValuePairMessage.toJSON(e) : undefined,
            );
        } else {
            obj.keyValuePair = [];
        }
        return obj;
    },
};

function createBaseAuditEvent_restrictedMessage(): AuditEvent_restrictedMessage {
    return { keyValuePair: [] };
}

export const AuditEvent_restrictedMessage = {
    fromJSON(object: any): AuditEvent_restrictedMessage {
        return {
            keyValuePair: Array.isArray(object?.keyValuePair)
                ? object.keyValuePair.map((e: any) => AuditEvent_keyValuePairMessage.fromJSON(e))
                : [],
        };
    },

    toJSON(message: AuditEvent_restrictedMessage): unknown {
        const obj: any = {};
        if (message.keyValuePair) {
            obj.keyValuePair = message.keyValuePair.map((e) =>
                e ? AuditEvent_keyValuePairMessage.toJSON(e) : undefined,
            );
        } else {
            obj.keyValuePair = [];
        }
        return obj;
    },
};

function createBaseAuditEvent_extensionsMessage(): AuditEvent_extensionsMessage {
    return { keyValuePair: [] };
}

export const AuditEvent_extensionsMessage = {
    fromJSON(object: any): AuditEvent_extensionsMessage {
        return {
            keyValuePair: Array.isArray(object?.keyValuePair)
                ? object.keyValuePair.map((e: any) => AuditEvent_keyValuePairMessage.fromJSON(e))
                : [],
        };
    },

    toJSON(message: AuditEvent_extensionsMessage): unknown {
        const obj: any = {};
        if (message.keyValuePair) {
            obj.keyValuePair = message.keyValuePair.map((e) =>
                e ? AuditEvent_keyValuePairMessage.toJSON(e) : undefined,
            );
        } else {
            obj.keyValuePair = [];
        }
        return obj;
    },
};

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}
