/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import { Timestamp } from '../google/protobuf/timestamp';

export const protobufPackage = '';

export interface EventMessage {
    eventId: string;
    requestId: string;
    sessionId: string;
    clientId: string;
    timestamp: Date | undefined;
    timestampFormatted: string;
    eventName: string;
    persistentSessionId: string;
}

export interface EventMessage_user {
    id: string;
    email: string;
    phone: string;
    ipAddress: string;
}

export interface EventMessage_platform {}

export interface EventMessage_restricted {}

export interface EventMessage_extensions {}

function createBaseEventMessage(): EventMessage {
    return {
        eventId: '',
        requestId: '',
        sessionId: '',
        clientId: '',
        timestamp: undefined,
        timestampFormatted: '',
        eventName: '',
        persistentSessionId: '',
    };
}

export const EventMessage = {
    encode(message: EventMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.eventId !== '') {
            writer.uint32(10).string(message.eventId);
        }
        if (message.requestId !== '') {
            writer.uint32(18).string(message.requestId);
        }
        if (message.sessionId !== '') {
            writer.uint32(26).string(message.sessionId);
        }
        if (message.clientId !== '') {
            writer.uint32(34).string(message.clientId);
        }
        if (message.timestamp !== undefined) {
            Timestamp.encode(toTimestamp(message.timestamp), writer.uint32(42).fork()).ldelim();
        }
        if (message.timestampFormatted !== '') {
            writer.uint32(50).string(message.timestampFormatted);
        }
        if (message.eventName !== '') {
            writer.uint32(58).string(message.eventName);
        }
        if (message.persistentSessionId !== '') {
            writer.uint32(66).string(message.persistentSessionId);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.eventId = reader.string();
                    break;
                case 2:
                    message.requestId = reader.string();
                    break;
                case 3:
                    message.sessionId = reader.string();
                    break;
                case 4:
                    message.clientId = reader.string();
                    break;
                case 5:
                    message.timestamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.timestampFormatted = reader.string();
                    break;
                case 7:
                    message.eventName = reader.string();
                    break;
                case 8:
                    message.persistentSessionId = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): EventMessage {
        return {
            eventId: isSet(object.eventId) ? String(object.eventId) : '',
            requestId: isSet(object.requestId) ? String(object.requestId) : '',
            sessionId: isSet(object.sessionId) ? String(object.sessionId) : '',
            clientId: isSet(object.clientId) ? String(object.clientId) : '',
            timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
            timestampFormatted: isSet(object.timestampFormatted) ? String(object.timestampFormatted) : '',
            eventName: isSet(object.eventName) ? String(object.eventName) : '',
            persistentSessionId: isSet(object.persistentSessionId) ? String(object.persistentSessionId) : '',
        };
    },

    toJSON(message: EventMessage): unknown {
        const obj: any = {};
        message.eventId !== undefined && (obj.eventId = message.eventId);
        message.requestId !== undefined && (obj.requestId = message.requestId);
        message.sessionId !== undefined && (obj.sessionId = message.sessionId);
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
        message.timestampFormatted !== undefined && (obj.timestampFormatted = message.timestampFormatted);
        message.eventName !== undefined && (obj.eventName = message.eventName);
        message.persistentSessionId !== undefined && (obj.persistentSessionId = message.persistentSessionId);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<EventMessage>, I>>(object: I): EventMessage {
        const message = createBaseEventMessage();
        message.eventId = object.eventId ?? '';
        message.requestId = object.requestId ?? '';
        message.sessionId = object.sessionId ?? '';
        message.clientId = object.clientId ?? '';
        message.timestamp = object.timestamp ?? undefined;
        message.timestampFormatted = object.timestampFormatted ?? '';
        message.eventName = object.eventName ?? '';
        message.persistentSessionId = object.persistentSessionId ?? '';
        return message;
    },
};

function createBaseEventMessage_user(): EventMessage_user {
    return { id: '', email: '', phone: '', ipAddress: '' };
}

export const EventMessage_user = {
    encode(message: EventMessage_user, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.id !== '') {
            writer.uint32(10).string(message.id);
        }
        if (message.email !== '') {
            writer.uint32(18).string(message.email);
        }
        if (message.phone !== '') {
            writer.uint32(26).string(message.phone);
        }
        if (message.ipAddress !== '') {
            writer.uint32(34).string(message.ipAddress);
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_user {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_user();
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
                    message.ipAddress = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): EventMessage_user {
        return {
            id: isSet(object.id) ? String(object.id) : '',
            email: isSet(object.email) ? String(object.email) : '',
            phone: isSet(object.phone) ? String(object.phone) : '',
            ipAddress: isSet(object.ipAddress) ? String(object.ipAddress) : '',
        };
    },

    toJSON(message: EventMessage_user): unknown {
        const obj: any = {};
        message.id !== undefined && (obj.id = message.id);
        message.email !== undefined && (obj.email = message.email);
        message.phone !== undefined && (obj.phone = message.phone);
        message.ipAddress !== undefined && (obj.ipAddress = message.ipAddress);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<EventMessage_user>, I>>(object: I): EventMessage_user {
        const message = createBaseEventMessage_user();
        message.id = object.id ?? '';
        message.email = object.email ?? '';
        message.phone = object.phone ?? '';
        message.ipAddress = object.ipAddress ?? '';
        return message;
    },
};

function createBaseEventMessage_platform(): EventMessage_platform {
    return {};
}

export const EventMessage_platform = {
    encode(_: EventMessage_platform, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_platform {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_platform();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(_: any): EventMessage_platform {
        return {};
    },

    toJSON(_: EventMessage_platform): unknown {
        const obj: any = {};
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<EventMessage_platform>, I>>(_: I): EventMessage_platform {
        const message = createBaseEventMessage_platform();
        return message;
    },
};

function createBaseEventMessage_restricted(): EventMessage_restricted {
    return {};
}

export const EventMessage_restricted = {
    encode(_: EventMessage_restricted, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_restricted {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_restricted();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(_: any): EventMessage_restricted {
        return {};
    },

    toJSON(_: EventMessage_restricted): unknown {
        const obj: any = {};
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<EventMessage_restricted>, I>>(_: I): EventMessage_restricted {
        const message = createBaseEventMessage_restricted();
        return message;
    },
};

function createBaseEventMessage_extensions(): EventMessage_extensions {
    return {};
}

export const EventMessage_extensions = {
    encode(_: EventMessage_extensions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_extensions {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_extensions();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },

    fromJSON(_: any): EventMessage_extensions {
        return {};
    },

    toJSON(_: EventMessage_extensions): unknown {
        const obj: any = {};
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<EventMessage_extensions>, I>>(_: I): EventMessage_extensions {
        const message = createBaseEventMessage_extensions();
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
