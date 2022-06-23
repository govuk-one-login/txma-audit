import { IAuditEvent } from '../models/audit-event';
import { CleansedEvent, ICleansedEvent } from "../models/cleansed-event";

export class CleansingService {
  static  cleanseEvent(auditEvent: IAuditEvent): ICleansedEvent {

    if (auditEvent.event_id) {
      let cleansedEvent: ICleansedEvent = new CleansedEvent(auditEvent.event_id, auditEvent.event_name, auditEvent.timestamp)
      if (auditEvent.user?.session_id) {
        cleansedEvent.session_id = auditEvent.user.session_id
      }

      return cleansedEvent
    }

    // event_id will always be populated (by the event processor) so this branch will never execute.
    return new CleansedEvent('', '', 0)

  }
}
