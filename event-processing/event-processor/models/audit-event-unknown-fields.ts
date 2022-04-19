import {
    AuditEvent_extensionsMessage,
    AuditEvent_platformMessage,
    AuditEvent_restrictedMessage,
} from '../protobuf/audit-event';
import { IUnknownFields } from './unknown-fields.interface';

export interface IAuditEventUnknownFields {
    event_id: string;
    request_id: string;
    session_id: string;
    client_id: string;
    timestamp: number;
    timestamp_formatted: string;
    event_name: string;
    user: IAuditEventUnknownFields | undefined;
    platform: AuditEvent_platformMessage | undefined;
    restricted: AuditEvent_restrictedMessage | undefined;
    extensions: AuditEvent_extensionsMessage | undefined;
    persistent_session_id: string;
    _unknownFields: IUnknownFields;
}
