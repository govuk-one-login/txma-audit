import { AuditEvent, IAuditEvent } from '../models/audit-event';
import { IAuditEventUnknownFields } from '../models/audit-event-unknown-fields';
import { IValidationResponse } from "../models/validation-response.interface";
import { randomUUID } from "crypto";

export class EnrichmentService {
  static async enrichValidationResponse(response: IValidationResponse): Promise<string> {
    const message = response.message;

    return this.enrichEventMessage(message);
  }

  private static async enrichEventMessage(message: string): Promise<string> {

    const eventMessage = message as unknown as IAuditEventUnknownFields

    if (!eventMessage.timestamp_formatted) {
      eventMessage.timestamp_formatted = new Date(eventMessage.timestamp * 1000).toISOString();
    }

    // if (!eventMessage.event_id) {
    //   eventMessage.event_id = randomUUID()
    // }

    return AuditEvent.toJSON(eventMessage as IAuditEvent) as string
  }

}
