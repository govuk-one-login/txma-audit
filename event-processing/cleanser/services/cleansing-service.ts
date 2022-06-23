import { IAuditEvent } from '../models/audit-event';
import { CleansedEvent, ICleansedEvent } from "../models/cleansed-event";

export class CleansingService {
  static  cleanseEvent(auditEvent: IAuditEvent): ICleansedEvent {

    if (auditEvent.event_id) {
      let cleansedEvent: ICleansedEvent = new CleansedEvent(auditEvent.event_id, auditEvent.event_name, auditEvent.component_id, auditEvent.timestamp)
      if (auditEvent?.timestamp_formatted) {
        cleansedEvent.timestamp_formatted = auditEvent.timestamp_formatted
      }

      return cleansedEvent
    }

    // event_id will always be populated (by the event processor) so this branch will never execute.
    return new CleansedEvent('', '', '', 0)

  }
}
