/* eslint-disable */
/* istanbul ignore file */ 
export interface AuditEvent {
    event_id: string;
    request_id: string;
    session_id: string;
    client_id: string;
    timestamp: number;
    timestamp_formatted: string;
    event_name: string;
    user: IAuditEventUserMessage | undefined;
    platform: unknown | undefined;
    restricted: unknown | undefined;
    extensions: unknown | undefined;
    persistent_session_id: string;
    new_unknown_field: string;
}

export interface IAuditEventUserMessage {
    transaction_id: string;
    email: string;
    phone: string;
    ip_address: string;
    unknown_user_field: string;
}

export class AuditEvent {
    static fromJSON(object: any): AuditEvent {
        return {
            event_id: isSet(object.event_id) ? String(object.event_id) : '',
            request_id: isSet(object.request_id) ? String(object.request_id) : '',
            session_id: isSet(object.session_id) ? String(object.session_id) : '',
            client_id: isSet(object.client_id) ? String(object.client_id) : '',
            timestamp: isSet(object.timestamp) ? Number(object.timestamp) : 0,
            timestamp_formatted: isSet(object.timestamp_formatted) ? String(object.timestamp_formatted) : '',
            event_name: isSet(object.event_name) ? String(object.event_name) : '',
            user: isSet(object.user) ? AuditEventUserMessage.fromJSON(object.user) : undefined,
            platform: isSet(object.platform) ? object.platform : undefined,
            restricted: isSet(object.restricted) ? object.restricted : undefined,
            extensions: isSet(object.extensions) ? object.extensions : undefined,
            persistent_session_id: isSet(object.persistent_session_id) ? String(object.persistent_session_id) : '',
            new_unknown_field: isSet(object.new_unknown_field) ? String(object.new_unknown_field) : '',
        };
    }

    static toJSON(message: AuditEvent): unknown {
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
            (obj.platform = message.platform ? message.platform : undefined);
        message.restricted !== undefined &&
            (obj.restricted = message.restricted ? message.restricted : undefined);
        message.extensions !== undefined &&
            (obj.extensions = message.extensions ? message.extensions : undefined);
        message.persistent_session_id !== undefined && (obj.persistent_session_id = message.persistent_session_id);
        message.new_unknown_field !== undefined && (obj.new_unknown_field = message.new_unknown_field);
        return obj;
    }
}

export class AuditEventUserMessage {
    static fromJSON(object: any): IAuditEventUserMessage {
        return {
            transaction_id: isSet(object.transaction_id) ? String(object.transaction_id) : '',
            email: isSet(object.email) ? String(object.email) : '',
            phone: isSet(object.phone) ? String(object.phone) : '',
            ip_address: isSet(object.ip_address) ? String(object.ip_address) : '',
            unknown_user_field: isSet(object.unknown_user_field) ? String(object.unknown_user_field) : '',
        };
    }

    static toJSON(message: IAuditEventUserMessage): unknown {
        const obj: any = {};
        message.transaction_id !== undefined && (obj.transaction_id = message.transaction_id);
        message.email !== undefined && (obj.email = message.email);
        message.phone !== undefined && (obj.phone = message.phone);
        message.ip_address !== undefined && (obj.ip_address = message.ip_address);
        message.unknown_user_field !== undefined && (obj.unknown_user_field = message.unknown_user_field);
        return obj;
    }
}

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}
