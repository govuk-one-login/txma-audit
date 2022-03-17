import {
    AuditEvent_extensionsMessage,
    AuditEvent_platformMessage,
    AuditEvent_restrictedMessage,
    AuditEvent_userMessage,
} from '../protobuf/audit-event';
import { IUnknownFields } from './unknown-fields.interface';

export interface IAuditEventUnknownFields {
    event_id: string;
    request_id: string;
    session_id: string;
    client_id: string;
    timestamp: Date | undefined;
    timestamp_formatted: string;
    event_name: string;
    user: AuditEvent_userMessage | undefined;
    platform: AuditEvent_platformMessage | undefined;
    restricted: AuditEvent_restrictedMessage | undefined;
    extensions: AuditEvent_extensionsMessage | undefined;
    persistent_session_id: string;
    _unknownFields: IUnknownFields;
}
