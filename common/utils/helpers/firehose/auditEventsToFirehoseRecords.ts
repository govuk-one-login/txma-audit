import { AuditEvent } from '../../../types/auditEvent'
import { _Record } from '@aws-sdk/client-firehose'

export const auditEventsToFirehoseRecords = (events: AuditEvent[]): _Record[] =>
  events.map((event) => ({
    Data: Buffer.from(JSON.stringify(event))
  }))
