import { IAuditEvent } from '../models/audit-event';
import { ICleansedEvent } from "../models/cleansed-event";

export class CleansingService {
  static  cleanseEvent(auditEvent: IAuditEvent): ICleansedEvent {


    if (auditEvent.event_id) {
      if (auditEvent.user?.session_id) {
        return{
          event_id: auditEvent.event_id,
          event_name: auditEvent.event_name,
          timestamp: auditEvent.timestamp,
          session_id: auditEvent.user.session_id
        }
      }

      return {
        event_id: auditEvent.event_id,
        event_name: auditEvent.event_name,
        timestamp: auditEvent.timestamp,
      }
    }

    // event_id will always be populated (by the event processor) so this branch will never execute.
    return {
      event_id: '',
      event_name: '',
      timestamp: 0
    }

  }
}
