/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import { Timestamp } from '../google/protobuf/timestamp';

export const protobufPackage = '';

export interface EventMessage {
    event_id: string;
    request_id: string;
    session_id: string;
    client_id: string;
    timestamp?: Date;
    timestamp_formatted: string;
    event_name: string;
    persistent_session_id: string;
}

export interface EventMessage_user {
    id: string;
    email: string;
    phone: string;
    ip_address: string;
}

export interface EventMessage_platform {}

export interface EventMessage_restricted {}

export interface EventMessage_extensions {}

function createBaseEventMessage(): EventMessage {
    return {
        event_id: '',
        request_id: '',
        session_id: '',
        client_id: '',
        timestamp: undefined,
        timestamp_formatted: '',
        event_name: '',
        persistent_session_id: '',
    };
}

export const EventMessage = {
    encode(message: EventMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
        if (message.persistent_session_id !== '') {
            writer.uint32(66).string(message.persistent_session_id);
        }
        if ('_unknownFields' in message) {
            for (const key of Object.keys(message['_unknownFields'])) {
                const values = message['_unknownFields'][key] as Uint8Array[];
                for (const value of values) {
                    writer.uint32(parseInt(key, 10));
                    (writer as any)['_push'](
                        (val: Uint8Array, buf: Buffer, pos: number) => buf.set(val, pos),
                        value.length,
                        value,
                    );
                }
            }
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage();
        (message as any)._unknownFields = {};
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
                    message.persistent_session_id = reader.string();
                    break;
                default:
                    const startPos = reader.pos;
                    reader.skipType(tag & 7);
                    (message as any)._unknownFields[tag] = [
                        ...((message as any)._unknownFields[tag] || []),
                        reader.buf.slice(startPos, reader.pos),
                    ];
                    break;
            }
        }
        return message;
    },

    fromJSON(object: any): EventMessage {
        return {
            event_id: isSet(object.event_id) ? String(object.event_id) : '',
            request_id: isSet(object.request_id) ? String(object.request_id) : '',
            session_id: isSet(object.session_id) ? String(object.session_id) : '',
            client_id: isSet(object.client_id) ? String(object.client_id) : '',
            timestamp: isSet(object.timestamp) ? fromJsonTimestamp(object.timestamp) : undefined,
            timestamp_formatted: isSet(object.timestamp_formatted) ? String(object.timestamp_formatted) : '',
            event_name: isSet(object.event_name) ? String(object.event_name) : '',
            persistent_session_id: isSet(object.persistent_session_id) ? String(object.persistent_session_id) : '',
        };
    },

    toJSON(message: EventMessage): unknown {
        const obj: any = {};
        message.event_id !== undefined && (obj.event_id = message.event_id);
        message.request_id !== undefined && (obj.request_id = message.request_id);
        message.session_id !== undefined && (obj.session_id = message.session_id);
        message.client_id !== undefined && (obj.client_id = message.client_id);
        message.timestamp !== undefined && (obj.timestamp = message.timestamp.toISOString());
        message.timestamp_formatted !== undefined && (obj.timestamp_formatted = message.timestamp_formatted);
        message.event_name !== undefined && (obj.event_name = message.event_name);
        message.persistent_session_id !== undefined && (obj.persistent_session_id = message.persistent_session_id);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<EventMessage>, I>>(object: I): EventMessage {
        const message = createBaseEventMessage();
        message.event_id = object.event_id ?? '';
        message.request_id = object.request_id ?? '';
        message.session_id = object.session_id ?? '';
        message.client_id = object.client_id ?? '';
        message.timestamp = object.timestamp ?? undefined;
        message.timestamp_formatted = object.timestamp_formatted ?? '';
        message.event_name = object.event_name ?? '';
        message.persistent_session_id = object.persistent_session_id ?? '';
        return message;
    },
};

function createBaseEventMessage_user(): EventMessage_user {
    return { id: '', email: '', phone: '', ip_address: '' };
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
        if (message.ip_address !== '') {
            writer.uint32(34).string(message.ip_address);
        }
        if ('_unknownFields' in message) {
            for (const key of Object.keys(message['_unknownFields'])) {
                const values = message['_unknownFields'][key] as Uint8Array[];
                for (const value of values) {
                    writer.uint32(parseInt(key, 10));
                    (writer as any)['_push'](
                        (val: Uint8Array, buf: Buffer, pos: number) => buf.set(val, pos),
                        value.length,
                        value,
                    );
                }
            }
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_user {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_user();
        (message as any)._unknownFields = {};
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
                    const startPos = reader.pos;
                    reader.skipType(tag & 7);
                    (message as any)._unknownFields[tag] = [
                        ...((message as any)._unknownFields[tag] || []),
                        reader.buf.slice(startPos, reader.pos),
                    ];
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
            ip_address: isSet(object.ip_address) ? String(object.ip_address) : '',
        };
    },

    toJSON(message: EventMessage_user): unknown {
        const obj: any = {};
        message.id !== undefined && (obj.id = message.id);
        message.email !== undefined && (obj.email = message.email);
        message.phone !== undefined && (obj.phone = message.phone);
        message.ip_address !== undefined && (obj.ip_address = message.ip_address);
        return obj;
    },

    fromPartial<I extends Exact<DeepPartial<EventMessage_user>, I>>(object: I): EventMessage_user {
        const message = createBaseEventMessage_user();
        message.id = object.id ?? '';
        message.email = object.email ?? '';
        message.phone = object.phone ?? '';
        message.ip_address = object.ip_address ?? '';
        return message;
    },
};

function createBaseEventMessage_platform(): EventMessage_platform {
    return {};
}

export const EventMessage_platform = {
    encode(message: EventMessage_platform, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if ('_unknownFields' in message) {
            for (const key of Object.keys(message['_unknownFields'])) {
                const values = message['_unknownFields'][key] as Uint8Array[];
                for (const value of values) {
                    writer.uint32(parseInt(key, 10));
                    (writer as any)['_push'](
                        (val: Uint8Array, buf: Buffer, pos: number) => buf.set(val, pos),
                        value.length,
                        value,
                    );
                }
            }
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_platform {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_platform();
        (message as any)._unknownFields = {};
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    const startPos = reader.pos;
                    reader.skipType(tag & 7);
                    (message as any)._unknownFields[tag] = [
                        ...((message as any)._unknownFields[tag] || []),
                        reader.buf.slice(startPos, reader.pos),
                    ];
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
    encode(message: EventMessage_restricted, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if ('_unknownFields' in message) {
            for (const key of Object.keys(message['_unknownFields'])) {
                const values = message['_unknownFields'][key] as Uint8Array[];
                for (const value of values) {
                    writer.uint32(parseInt(key, 10));
                    (writer as any)['_push'](
                        (val: Uint8Array, buf: Buffer, pos: number) => buf.set(val, pos),
                        value.length,
                        value,
                    );
                }
            }
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_restricted {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_restricted();
        (message as any)._unknownFields = {};
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    const startPos = reader.pos;
                    reader.skipType(tag & 7);
                    (message as any)._unknownFields[tag] = [
                        ...((message as any)._unknownFields[tag] || []),
                        reader.buf.slice(startPos, reader.pos),
                    ];
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
    encode(message: EventMessage_extensions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if ('_unknownFields' in message) {
            for (const key of Object.keys(message['_unknownFields'])) {
                const values = message['_unknownFields'][key] as Uint8Array[];
                for (const value of values) {
                    writer.uint32(parseInt(key, 10));
                    (writer as any)['_push'](
                        (val: Uint8Array, buf: Buffer, pos: number) => buf.set(val, pos),
                        value.length,
                        value,
                    );
                }
            }
        }
        return writer;
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): EventMessage_extensions {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseEventMessage_extensions();
        (message as any)._unknownFields = {};
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    const startPos = reader.pos;
                    reader.skipType(tag & 7);
                    (message as any)._unknownFields[tag] = [
                        ...((message as any)._unknownFields[tag] || []),
                        reader.buf.slice(startPos, reader.pos),
                    ];
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
