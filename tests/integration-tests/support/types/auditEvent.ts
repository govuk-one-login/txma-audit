export interface AuditEvent {
  client_id?: string
  component_id?: string
  event_id?: string
  event_name: string
  extensions?: Extensions
  platform?: unknown
  reIngestCount?: number
  restricted?: unknown
  timestamp: number
  timestamp_formatted?: string
  user?: AuditEventUserObject
  txma?: unknown
}

export interface AuditEventUserObject {
  device_id?: string
  email?: string
  govuk_signin_journey_id?: string
  ip_address?: string
  persistent_session_id?: string
  phone?: string
  session_id?: string
  transaction_id?: string
  user_id?: string
}

export interface Extensions {
  evidence: EvidenceEvent[]
  [key: string]: unknown
}

export type EvidenceEvent = Record<string, unknown>
