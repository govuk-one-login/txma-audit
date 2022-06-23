export interface ICleansedEvent {
  event_id?: string;
  timestamp: number;
  event_name: string;
  session_id?: string;
}

export class CleansedEvent implements ICleansedEvent {

  readonly event_id?: string;
  readonly timestamp: number;
  readonly event_name: string;
  session_id?: string;

  constructor(event_id: string, event_name: string, timestamp: number) {
    this.event_id = event_id
    this.event_name = event_name
    this.timestamp = timestamp
  }
  
}

