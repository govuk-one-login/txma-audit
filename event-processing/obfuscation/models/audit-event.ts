export interface IAuditEvent {
    event_id?: string;
    govuk_signin_journey_id?: string;
    session_id?: string;
    client_id?: string;
    timestamp: number;
    timestamp_formatted?: string;
    event_name: string;
    component_id: string;
    user?: IAuditEventUserMessage | undefined;
    platform?: unknown | undefined;
    restricted?: unknown | undefined;
    extensions?: unknown | undefined;
    service_name?: string;
    persistent_session_id?: string;
}

export interface IAuditEventUserMessage {
    transaction_id?: string;
    email?: string;
    phone?: string;
    ip_address: string;
}

function createBaseAuditEvent(): IAuditEvent {
    return {
        event_id: '',
        govuk_signin_journey_id: '',
        session_id: '',
        client_id: '',
        timestamp: 0,
        timestamp_formatted: '',
        event_name: '',
        component_id: '',
        user: undefined,
        platform: undefined,
        restricted: undefined,
        extensions: undefined,
        persistent_session_id: '',
        service_name: '',
    };
}

export class AuditEvent {
    static fromJSONString(object: string): IAuditEvent {
        const event = createBaseAuditEvent();
        const jsonObject = JSON.parse(object);
        const unknown_fields = new Map<string, unknown>();
        for (const value in jsonObject) {
            switch (value) {
                case 'event_id':
                    event.event_id = jsonObject[value];
                    break;
                case 'govuk_signin_journey_id':
                    event.govuk_signin_journey_id = jsonObject[value];
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
                case 'component_id':
                    event.component_id = jsonObject[value];
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
                case 'service_name':
                    event.service_name = jsonObject[value];
                    break;
            }
        }
        return event;
    }
}

function createBaseAuditEventUserMessage(): IAuditEventUserMessage {
    return { transaction_id: '', email: '', phone: '', ip_address: '' };
}

export class AuditEventUserMessage {
    static fromObject(object: any): IAuditEventUserMessage {
        const unknown_fields = new Map<string, any>();
        const user = createBaseAuditEventUserMessage();
        for (const value in object) {
            switch (value) {
                case 'transaction_id':
                    user.transaction_id = object.transaction_id;
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
            }
        }
        return user;
    }
}
