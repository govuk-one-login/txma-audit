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
    user: AuditEvent_userMessage | undefined;
    platform: AuditEvent_platformMessage | undefined;
    restricted: AuditEvent_restrictedMessage | undefined;
    extensions: AuditEvent_extensionsMessage | undefined;
    persistent_session_id: string;
    new_unknown_field: string;
}

export interface AuditEvent_userMessage {
    id: string;
    email: string;
    phone: string;
    ip_address: string;
    unknown_user_field: string;
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
        new_unknown_field: '',
    };
}

export const AuditEvent = {
    fromJSON(object: any): AuditEvent {
        return {
            event_id: isSet(object.event_id) ? String(object.event_id) : '',
            request_id: isSet(object.request_id) ? String(object.request_id) : '',
            session_id: isSet(object.session_id) ? String(object.session_id) : '',
            client_id: isSet(object.client_id) ? String(object.client_id) : '',
            timestamp: isSet(object.timestamp) ? Number(object.timestamp) : 0,
            timestamp_formatted: isSet(object.timestamp_formatted) ? String(object.timestamp_formatted) : '',
            event_name: isSet(object.event_name) ? String(object.event_name) : '',
            user: isSet(object.user) ? AuditEvent_userMessage.fromJSON(object.user) : undefined,
            platform: isSet(object.platform) ? AuditEvent_platformMessage.fromJSON(object.platform) : undefined,
            restricted: isSet(object.restricted) ? AuditEvent_restrictedMessage.fromJSON(object.restricted) : undefined,
            extensions: isSet(object.extensions) ? AuditEvent_extensionsMessage.fromJSON(object.extensions) : undefined,
            persistent_session_id: isSet(object.persistent_session_id) ? String(object.persistent_session_id) : '',
            new_unknown_field: isSet(object.new_unknown_field) ? String(object.new_unknown_field) : '',
        };
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
        message.new_unknown_field !== undefined && (obj.new_unknown_field = message.new_unknown_field);
        return obj;
    },

    fromPartial(object: DeepPartial<AuditEvent>): AuditEvent {
        const message = createBaseAuditEvent();
        message.event_id = object.event_id ?? '';
        message.request_id = object.request_id ?? '';
        message.session_id = object.session_id ?? '';
        message.client_id = object.client_id ?? '';
        message.timestamp = object.timestamp ?? 0;
        message.timestamp_formatted = object.timestamp_formatted ?? '';
        message.event_name = object.event_name ?? '';
        message.user =
            object.user !== undefined && object.user !== null
                ? AuditEvent_userMessage.fromPartial(object.user)
                : undefined;
        message.platform =
            object.platform !== undefined && object.platform !== null
                ? AuditEvent_platformMessage.fromPartial(object.platform)
                : undefined;
        message.restricted =
            object.restricted !== undefined && object.restricted !== null
                ? AuditEvent_restrictedMessage.fromPartial(object.restricted)
                : undefined;
        message.extensions =
            object.extensions !== undefined && object.extensions !== null
                ? AuditEvent_extensionsMessage.fromPartial(object.extensions)
                : undefined;
        message.persistent_session_id = object.persistent_session_id ?? '';
        message.new_unknown_field = object.new_unknown_field ?? '';
        return message;
    },
};

function createBaseAuditEvent_userMessage(): AuditEvent_userMessage {
    return { id: '', email: '', phone: '', ip_address: '', unknown_user_field: '' };
}

export const AuditEvent_userMessage = {
    fromJSON(object: any): AuditEvent_userMessage {
        return {
            id: isSet(object.id) ? String(object.id) : '',
            email: isSet(object.email) ? String(object.email) : '',
            phone: isSet(object.phone) ? String(object.phone) : '',
            ip_address: isSet(object.ip_address) ? String(object.ip_address) : '',
            unknown_user_field: isSet(object.unknown_user_field) ? String(object.unknown_user_field) : '',
        };
    },

    toJSON(message: AuditEvent_userMessage): unknown {
        const obj: any = {};
        message.id !== undefined && (obj.id = message.id);
        message.email !== undefined && (obj.email = message.email);
        message.phone !== undefined && (obj.phone = message.phone);
        message.ip_address !== undefined && (obj.ip_address = message.ip_address);
        message.unknown_user_field !== undefined && (obj.unknown_user_field = message.unknown_user_field);
        return obj;
    },

    fromPartial(object: DeepPartial<AuditEvent_userMessage>): AuditEvent_userMessage {
        const message = createBaseAuditEvent_userMessage();
        message.id = object.id ?? '';
        message.email = object.email ?? '';
        message.phone = object.phone ?? '';
        message.ip_address = object.ip_address ?? '';
        message.unknown_user_field = object.unknown_user_field ?? '';
        return message;
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

    fromPartial(object: DeepPartial<AuditEvent_keyValuePairMessage>): AuditEvent_keyValuePairMessage {
        const message = createBaseAuditEvent_keyValuePairMessage();
        message.key = object.key ?? '';
        message.value = object.value ?? '';
        return message;
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

    fromPartial(object: DeepPartial<AuditEvent_platformMessage>): AuditEvent_platformMessage {
        const message = createBaseAuditEvent_platformMessage();
        message.keyValuePair = object.keyValuePair?.map((e) => AuditEvent_keyValuePairMessage.fromPartial(e)) || [];
        return message;
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

    fromPartial(object: DeepPartial<AuditEvent_restrictedMessage>): AuditEvent_restrictedMessage {
        const message = createBaseAuditEvent_restrictedMessage();
        message.keyValuePair = object.keyValuePair?.map((e) => AuditEvent_keyValuePairMessage.fromPartial(e)) || [];
        return message;
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

    fromPartial(object: DeepPartial<AuditEvent_extensionsMessage>): AuditEvent_extensionsMessage {
        const message = createBaseAuditEvent_extensionsMessage();
        message.keyValuePair = object.keyValuePair?.map((e) => AuditEvent_keyValuePairMessage.fromPartial(e)) || [];
        return message;
    },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
    ? T
    : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends {}
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : Partial<T>;

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}
