import { AuditEvent } from './auditEvent'

export interface S3ObjectDetails {
  auditEvents?: AuditEvent[]
  auditEventsFailedReingest?: AuditEvent[]
  bucket: string | null | undefined
  key: string | null | undefined
  sqsRecordMessageId: string
}
