import { IAuditEvent } from './audit-event';

export interface IAuditEventUnknownFields extends IAuditEvent {
    _unknownFields: Map<string, unknown>;
}

export class AuditEventUnknownFields {
    static fromAuditMessage(object: any, unknown_fields: Map<string, unknown>): IAuditEventUnknownFields {
        return {
            event_id: isSet(object.event_id) ? String(object.event_id) : '',
            request_id: isSet(object.request_id) ? String(object.request_id) : '',
            session_id: isSet(object.session_id) ? String(object.session_id) : '',
            client_id: isSet(object.client_id) ? String(object.client_id) : '',
            timestamp: isSet(object.timestamp) ? Number(object.timestamp) : 0,
            timestamp_formatted: isSet(object.timestamp_formatted) ? String(object.timestamp_formatted) : '',
            event_name: isSet(object.event_name) ? String(object.event_name) : '',
            user: isSet(object.user) ? object.user : undefined,
            platform: isSet(object.platform) ? object.platform : undefined,
            restricted: isSet(object.restricted) ? object.restricted : undefined,
            extensions: isSet(object.extensions) ? object.extensions : undefined,
            persistent_session_id: isSet(object.persistent_session_id) ? String(object.persistent_session_id) : '',
            service_name: isSet(object.service_name) ? object.service_name : '',
            _unknownFields: unknown_fields,
        };
    }
}

function isSet(value: unknown): boolean {
    return value !== null && value !== undefined;
}
