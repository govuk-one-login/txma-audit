import { IAuditEvent } from "./audit-event";

export interface IObfuscatedEvent {
    timestamp: number;
    timestamp_formatted?: string;
    event_name: string;
}

export class ObfuscatedEvent {
    static fromAuditEvent(event: IAuditEvent) {
        return {
            timestamp: event.timestamp,
            timestamp_formatted: event.timestamp_formatted,
            event_name: event.event_name
        }
    }
}