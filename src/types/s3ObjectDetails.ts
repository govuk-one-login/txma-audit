import { AuditEvent } from './auditEvent'

export interface S3ObjectDetails {
  auditEvents?: AuditEvent[]
  key: string
  sqsRecordMessageId: string
}
