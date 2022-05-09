import {
    AuditEvent_extensionsMessage,
    AuditEvent_platformMessage,
    AuditEvent_restrictedMessage,
} from './audit-event';
import { IUserUnknownFields } from './user-unknown-fields.interface';

export interface IAuditEventUnknownFields {
    event_id: string;
    request_id: string;
    session_id: string;
    client_id: string;
    timestamp: number;
    timestamp_formatted: string;
    event_name: string;
    user: IUserUnknownFields | undefined;
    platform: AuditEvent_platformMessage | undefined;
    restricted: AuditEvent_restrictedMessage | undefined;
    extensions: AuditEvent_extensionsMessage | undefined;
    persistent_session_id: string;
    _unknownFields: Map<string, unknown>;
}

export const IAuditEventUnknownFields = {
    fromAuditMessage(object: any, unknown_fields: Map<string, unknown> ) {
        return {
            event_id: isSet(object.event_id) ? String(object.event_id) : '',
            request_id: isSet(object.request_id) ? String(object.request_id) : '',
            session_id: isSet(object.session_id) ? String(object.session_id) : '',
            client_id: isSet(object.client_id) ? String(object.client_id) : '',
            timestamp: isSet(object.timestamp) ? Number(object.timestamp) : 0,
            timestamp_formatted: isSet(object.timestamp_formatted) ? String(object.timestamp_formatted) : '',
            event_name: isSet(object.event_name) ? String(object.event_name) : '',
            user: isSet(object.user) ? object.user: undefined,
            platform: isSet(object.platform) ? object.platform : undefined,
            restricted: isSet(object.restricted) ? object.restricted : undefined,
            extensions: isSet(object.extensions) ? object.extensions : undefined,
            persistent_session_id: isSet(object.persistent_session_id) ? String(object.persistent_session_id) : '',
            _unknownFields: unknown_fields,
        };
    }
}

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}