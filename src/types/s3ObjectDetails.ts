import { AuditEvent } from './auditEvent'

export interface S3ObjectDetails {
  auditEvents?: AuditEvent[]
  auditEventsFailedReingest?: AuditEvent[]
  bucket: string
  key: string
  sqsRecordMessageId: string
}
