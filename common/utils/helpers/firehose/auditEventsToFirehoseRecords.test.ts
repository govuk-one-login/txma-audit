import { describe, it, expect } from 'vitest'
import { AuditEvent } from '../../../../common/types/auditEvent'
import { auditEventsToFirehoseRecords } from './auditEventsToFirehoseRecords'

describe('auditEventsToFirehoseRecords', () => {
  it('converts audit events to firehose records with JSON-serialized data', () => {
    // Unit Test
    const events: AuditEvent[] = [
      { event_name: 'AUTH_EVENT', timestamp: 1234567890, event_id: 'id-1' },
      { event_name: 'FRAUD_EVENT', timestamp: 1234567891, event_id: 'id-2' }
    ]

    const result = auditEventsToFirehoseRecords(events)

    expect(result).toHaveLength(2)
    expect(result[0].Data).toEqual(Buffer.from(JSON.stringify(events[0])))
    expect(result[1].Data).toEqual(Buffer.from(JSON.stringify(events[1])))
  })

  it('returns an empty array when given no events', () => {
    // Unit Test
    const result = auditEventsToFirehoseRecords([])

    expect(result).toEqual([])
  })
})
