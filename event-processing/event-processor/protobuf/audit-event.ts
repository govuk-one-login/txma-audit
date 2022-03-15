/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import { Timestamp } from '../google/protobuf/timestamp';

export const protobufPackage = 'di';

export interface AuditEvent {
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
        timestamp: undefined,
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
    encode(message: AuditEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.event_id !== '') {
            writer.uint32(10).string(message.event_id);
        }
        if (message.request_id !== '') {
            writer.uint32(18).string(message.request_id);
        }
        if (message.session_id !== '') {
            writer.uint32(26).string(message.session_id);
        }
        if (message.client_id !== '') {
            writer.uint32(34).string(message.client_id);
        }
        if (message.timestamp !== undefined) {
            Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(42).fork()).ldelim();
        }
        if (message.timestamp_formatted !== '') {
            writer.uint32(50).string(message.timestamp_formatted);
        }
        if (message.event_name !== '') {
            writer.uint32(58).string(message.event_name);
        }
        if (message.user !== undefined) {
            AuditEvent_userMessage.encode(message.user, writer.uint32(66).fork()).ldelim();
        }
        if (message.platform !== undefined) {
            AuditEvent_platformMessage.encode(message.platform, writer.uint32(74).fork()).ldelim();
        }
        if (message.restricted !== undefined) {
            AuditEvent_restrictedMessage.encode(message.restricted, writer.uint32(82).fork()).ldelim();
        }
        if (message.extensions !== undefined) {
            AuditEvent_extensionsMessage.encode(message.extensions, writer.uint32(90).fork()).ldelim();
        }
        if (message.persistent_session_id !== '') {
            writer.uint32(98).string(message.persistent_session_id);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): AuditEvent {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuditEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.event_id = reader.string();
                    break;
                case 2:
                    message.request_id = reader.string();
                    break;
                case 3:
                    message.session_id = reader.string();
                    break;
                case 4:
                    message.client_id = reader.string();
                    break;
                case 5:
                    message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.timestamp_formatted = reader.string();
                    break;
                case 7:
                    message.event_name = reader.string();
                    break;
                case 8:
                    message.user = AuditEvent_userMessage.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.platform = AuditEvent_platformMessage.decode(reader, reader.uint32());
                    break;
                case 10:
                    message.restricted = AuditEvent_restrictedMessage.decode(reader, reader.uint32());
                    break;
                case 11:
                    message.extensions = AuditEvent_extensionsMessage.decode(reader, reader.uint32());
                    break;
                case 12:
                    message.persistent_session_id = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): AuditEvent {
        return {
            event_id: isSet(object.event_id) ? String(object.event_id) : '',
            request_id: isSet(object.request_id) ? String(object.request_id) : '',
            session_id: isSet(object.session_id) ? String(object.session_id) : '',
            client_id: isSet(object.client_id) ? String(object.client_id) : '',
            timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
            timestamp_formatted: isSet(object.timestamp_formatted) ? String(object.timestamp_formatted) : '',
            event_name: isSet(object.event_name) ? String(object.event_name) : '',
            user: isSet(object.user) ? AuditEvent_userMessage.fromJSON(object.user) : undefined,
            platform: isSet(object.platform) ? AuditEvent_platformMessage.fromJSON(object.platform) : undefined,
            restricted: isSet(object.restricted) ? AuditEvent_restrictedMessage.fromJSON(object.restricted) : undefined,
            extensions: isSet(object.extensions) ? AuditEvent_extensionsMessage.fromJSON(object.extensions) : undefined,
            persistent_session_id: isSet(object.persistent_session_id) ? String(object.persistent_session_id) : '',
        };
    },

    toJSON(message: AuditEvent): unknown {
        const obj: any = {};
        message.event_id !== undefined && (obj.event_id = message.event_id);
        message.request_id !== undefined && (obj.request_id = message.request_id);
        message.session_id !== undefined && (obj.session_id = message.session_id);
        message.client_id !== undefined && (obj.client_id = message.client_id);
        message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
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

    fromPartial<I extends Exact<DeepPartial<AuditEvent>, I>>(object: I): AuditEvent {
        const message = createBaseAuditEvent();
        message.event_id = object.event_id ?? '';
        message.request_id = object.request_id ?? '';
        message.session_id = object.session_id ?? '';
        message.client_id = object.client_id ?? '';
        message.timestamp = object.timestamp ?? undefined;
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
        return message;
    },
};

function createBaseAuditEvent_userMessage(): AuditEvent_userMessage {
    return { id: '', email: '', phone: '', ip_address: '' };
}

export const AuditEvent_userMessage = {
    encode(message: AuditEvent_userMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.email !== '') {
            writer.uint32(18).string(message.email);
        }
        if (message.phone !== '') {
            writer.uint32(26).string(message.phone);
        }
        if (message.ip_address !== '') {
            writer.uint32(34).string(message.ip_address);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): AuditEvent_userMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuditEvent_userMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.email = reader.string();
                    break;
                case 3:
                    message.phone = reader.string();
                    break;
                case 4:
                    message.ip_address = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): AuditEvent_userMessage {
        return {
            id: isSet(object.id) ? String(object.id) : '',
            email: isSet(object.email) ? String(object.email) : '',
            phone: isSet(object.phone) ? String(object.phone) : '',
            ip_address: isSet(object.ip_address) ? String(object.ip_address) : '',
        };
    },

    toJSON(message: AuditEvent_userMessage): unknown {
        const obj: any = {};
        message.id !== undefined && (obj.id = message.id);
        message.email !== undefined && (obj.email = message.email);
        message.phone !== undefined && (obj.phone = message.phone);
        message.ip_address !== undefined && (obj.ip_address = message.ip_address);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<AuditEvent_userMessage>, I>>(object: I): AuditEvent_userMessage {
        const message = createBaseAuditEvent_userMessage();
        message.id = object.id ?? '';
        message.email = object.email ?? '';
        message.phone = object.phone ?? '';
        message.ip_address = object.ip_address ?? '';
        return message;
    },
};

function createBaseAuditEvent_keyValuePairMessage(): AuditEvent_keyValuePairMessage {
    return { key: '', value: '' };
}

export const AuditEvent_keyValuePairMessage = {
    encode(message: AuditEvent_keyValuePairMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.key !== '') {
            writer.uint32(10).string(message.key);
        }
        if (message.value !== '') {
            writer.uint32(18).string(message.value);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): AuditEvent_keyValuePairMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuditEvent_keyValuePairMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.value = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

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

    fromPartial<I extends Exact<DeepPartial<AuditEvent_keyValuePairMessage>, I>>(
        object: I,
    ): AuditEvent_keyValuePairMessage {
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
    encode(message: AuditEvent_platformMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        for (const v of message.keyValuePair) {
            AuditEvent_keyValuePairMessage.encode(v!, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): AuditEvent_platformMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuditEvent_platformMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.keyValuePair.push(AuditEvent_keyValuePairMessage.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

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

    fromPartial<I extends Exact<DeepPartial<AuditEvent_platformMessage>, I>>(object: I): AuditEvent_platformMessage {
        const message = createBaseAuditEvent_platformMessage();
        message.keyValuePair = object.keyValuePair?.map((e) => AuditEvent_keyValuePairMessage.fromPartial(e)) || [];
        return message;
    },
};

function createBaseAuditEvent_restrictedMessage(): AuditEvent_restrictedMessage {
    return { keyValuePair: [] };
}

export const AuditEvent_restrictedMessage = {
    encode(message: AuditEvent_restrictedMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        for (const v of message.keyValuePair) {
            AuditEvent_keyValuePairMessage.encode(v!, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): AuditEvent_restrictedMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuditEvent_restrictedMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.keyValuePair.push(AuditEvent_keyValuePairMessage.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

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

    fromPartial<I extends Exact<DeepPartial<AuditEvent_restrictedMessage>, I>>(
        object: I,
    ): AuditEvent_restrictedMessage {
        const message = createBaseAuditEvent_restrictedMessage();
        message.keyValuePair = object.keyValuePair?.map((e) => AuditEvent_keyValuePairMessage.fromPartial(e)) || [];
        return message;
    },
};

function createBaseAuditEvent_extensionsMessage(): AuditEvent_extensionsMessage {
    return { keyValuePair: [] };
}

export const AuditEvent_extensionsMessage = {
    encode(message: AuditEvent_extensionsMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        for (const v of message.keyValuePair) {
            AuditEvent_keyValuePairMessage.encode(v!, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): AuditEvent_extensionsMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuditEvent_extensionsMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.keyValuePair.push(AuditEvent_keyValuePairMessage.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

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

    fromPartial<I extends Exact<DeepPartial<AuditEvent_extensionsMessage>, I>>(
        object: I,
    ): AuditEvent_extensionsMessage {
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

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
    ? P
    : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<Exclude<keyof I, KeysOfUnion<P>>, never>;

function toTimestamp(date: Date): Timestamp {
    const seconds = date.getTime() / 1_000;
    const nanos = (date.getTime() % 1_000) * 1_000_000;
    return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
    let millis = t.seconds * 1_000;
    millis += t.nanos / 1_000_000;
    return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
    if (o instanceof Date) {
        return o;
    } else if (typeof o === 'string') {
        return new Date(o);
    } else {
        return fromTimestamp(Timestamp.fromJSON(o));
    }
}

if (_m0.util.Long !== Long) {
    _m0.util.Long = Long as any;
    _m0.configure();
}

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}
