import { AuditEvent } from './auditEvent'

export interface S3ObjectDetails {
  auditEvents?: AuditEvent[]
  auditEventsFailedReingest?: AuditEvent[]
  bucket: string | undefined
  key: string | undefined
  sqsRecordMessageId: string
}
