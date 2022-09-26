export interface IAuditEvent {
    event_id?: string;
    client_id?: string;
    timestamp: number;
    timestamp_formatted?: string;
    event_name: string;
    component_id?: string;
    user?: IAuditEventUserMessage | undefined;
    platform?: unknown | undefined;
    restricted?: unknown | undefined;
    extensions?: unknown | undefined;
}

export interface IAuditEventUserMessage {
    transaction_id?: string;
    user_id?: string;
    email?: string;
    phone?: string;
    ip_address?: string;
    session_id?: string;
    persistent_session_id?: string;
    govuk_signin_journey_id?: string;
    device_id?: string;
}
