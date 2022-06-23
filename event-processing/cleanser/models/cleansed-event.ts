export interface ICleansedEvent {
  event_id?: string;
  timestamp: number;
  event_name: string;
  session_id?: string;
}


function createBaseCleansedEvent(): ICleansedEvent {
  return {
    event_id: '',
    timestamp: 0,
    event_name: '',
    session_id: ''
  };
}

export class CleansedEvent {
  static fromJSONString(object: string): ICleansedEvent {
    const event = createBaseCleansedEvent();
    const jsonObject = JSON.parse(object);
    for (const value in jsonObject) {
      switch (value) {
        case 'event_id':
          event.event_id = jsonObject[value];
          break;
        case 'timestamp':
          event.timestamp = jsonObject[value];
          break;
        case 'event_name':
          event.event_name = jsonObject[value];
          break;
        case 'session_id':
          event.session_id = jsonObject[value];
          break;
      }
    }
    return event;
  }
}
